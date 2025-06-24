import prisma from '../data-source.js';
import {
  getProductByIdForPurchase,
  getCompletedRentalTotalByUser,
} from '../repositories/purchase.repository.js';
import { getLastApprovedRentalEndDate } from '../repositories/rentalRequest.repository.js';
import { PRODUCT_MESSAGES, PLATFORM_MESSAGES } from '../constants/messages.js';
import CustomError from '../utils/customError.js';
import {
  USER_PURCHASE_COMMISSION_RATE,
  INFLUENCER_PURCHASE_COMMISSION_RATE,
} from '../constants/commission.js';
import { createNotification } from './notification.service.js';

export const purchaseProduct = async (productId, userId) => {
  return await prisma.$transaction(async (tx) => {
    // 상품 조회 및 검증
    const product = await getProductByIdForPurchase(tx, productId);

    if (!product?.allowPurchase) {
      throw new CustomError(
        400,
        'PURCHASE_NOT_ALLOWED',
        PRODUCT_MESSAGES.PURCHASE_NOT_ALLOWED,
      );
    }
    // 구매 예약 or 판매 상태면 구매 차단
    if (['SOLD', 'PURCHASE_RESERVED'].includes(product.status)) {
      throw new CustomError(
        400,
        'PURCHASE_NOT_ALLOWED',
        PRODUCT_MESSAGES.PURCHASE_NOT_ALLOWED,
      );
    }

    if (product.ownerId === userId) {
      throw new CustomError(
        400,
        'NO_PERMISSION',
        PRODUCT_MESSAGES.NO_PERMISSION,
      );
    }

    // 누적 대여금액 조회 및 할인 적용
    const totalRentalAmount = await getCompletedRentalTotalByUser(
      tx,
      productId,
      userId,
    );
    const purchasePrice = product.purchasePrice;
    const finalPrice = Math.max(purchasePrice - totalRentalAmount, 0);

    // 유저 잔액 확인 및 차감
    const buyer = await tx.user.findUnique({ where: { id: userId } });
    if (buyer.balance < finalPrice) {
      throw new CustomError(
        400,
        'INSUFFICIENT_BALANCE',
        PRODUCT_MESSAGES.INSUFFICIENT_BALANCE,
      );
    }

    const updatedBuyer = await tx.user.update({
      where: { id: userId },
      data: { balance: { decrement: finalPrice } },
    });

    await tx.paymentLog.create({
      data: {
        userId,
        productId: product.id,
        amount: finalPrice,
        paymentType: 'PURCHASE',
        memo: `[구매] ${product.title} (할인: ${totalRentalAmount}원)`,
        paidAt: new Date(),
        balanceBefore: buyer.balance,
        balanceAfter: updatedBuyer.balance,
      },
    });

    // 판매자 정산 및 수익 로그 기록
    const seller = await tx.user.findUnique({ where: { id: product.ownerId } });
    const commissionRate =
      seller.role === 'INFLUENCER'
        ? INFLUENCER_PURCHASE_COMMISSION_RATE
        : USER_PURCHASE_COMMISSION_RATE;
    const commission = Math.floor(finalPrice * commissionRate);
    const sellerProfit = finalPrice - commission;

    const updatedSeller = await tx.user.update({
      where: { id: product.ownerId },
      data: { balance: { increment: sellerProfit } },
    });

    await tx.paymentLog.create({
      data: {
        userId: product.ownerId,
        amount: sellerProfit,
        paymentType: 'OWNER_PAYOUT',
        memo: `[판매수익] ${product.title} (수수료: ${commission}원)`,
        paidAt: new Date(),
        balanceBefore: seller.balance,
        balanceAfter: updatedSeller.balance,
      },
    });

    // 상품 상태 변경
    // 상품 상태 변경 전 현재 상태 재확인
    const latestEndDate = await getLastApprovedRentalEndDate(tx, product.id);
    const now = new Date();
    const isReservation = latestEndDate.getTime() > now.getTime();

    // 조건부 상태 업데이트 (status가 여전히 APPROVED인 경우에만 업데이트)
    const updatedProduct = await tx.product.updateMany({
      where: {
        id: product.id,
        status: 'APPROVED', // 현재 상태가 APPROVED인 경우에만 업데이트
      },
      data: {
        status: isReservation ? 'PURCHASE_RESERVED' : 'SOLD',
        purchaseReservedUserId: userId,
        purchaseReservedAt: latestEndDate,
      },
    });

    // 업데이트된 row가 없다면 동시성 문제 발생
    if (updatedProduct.count === 0) {
      throw new CustomError(
        400,
        'PURCHASE_FAILED',
        PRODUCT_MESSAGES.PURCHASE_NOT_ALLOWED,
      );
    }
    // 플랫폼 계정 조회
    const platformAccount = await tx.platformAccount.findFirst();
    if (!platformAccount) {
      throw new CustomError(
        500,
        'PLATFORM_ACCOUNT_NOT_FOUND',
        PLATFORM_MESSAGES.PLATFORM_ACCOUNT_NOT_FOUND,
      );
    }

    // 플랫폼 잔액 증가 (수수료만큼)
    const platformBalanceBefore = platformAccount.balance;
    const platformBalanceAfter = platformBalanceBefore + commission;

    await tx.platformAccount.update({
      where: { id: platformAccount.id },
      data: { balance: { increment: commission } },
    });

    // 플랫폼 수익 로그 생성
    await tx.platformPaymentLog.create({
      data: {
        platformAccountId: platformAccount.id,
        type: 'INCOME',
        amount: commission,
        memo: `[자동] 구매 수수료 수입: ${product.title}`,
        balanceBefore: platformBalanceBefore,
        balanceAfter: platformBalanceAfter,
        userId,
      },
    });

    // 알림 전송
    await createNotification({
      userId: product.ownerId,
      type: 'PURCHASE',
      message: `[판매완료] ${product.title} 상품이 판매되었습니다.`,
      url: `/products/${product.id}`,
      productId: product.id,
    });

    // 응답
    return {
      productId: product.id,
      title: product.title,
      purchasePrice,
      discount: totalRentalAmount,
      finalPrice,
      status: isReservation ? 'PURCHASE_RESERVED' : 'SOLD',
      sellerProfit,
      commission,
    };
  });
};

export const cancelPurchase = async (productId, userId) => {
  return await prisma.$transaction(async (tx) => {
    // 상품 조회 및 검증
    const product = await tx.product.findUnique({
      where: { id: productId },
      include: {
        purchaseReservedUser: true,
      },
    });

    if (!product) {
      throw new CustomError(
        404,
        'PRODUCT_NOT_FOUND',
        PRODUCT_MESSAGES.NOT_FOUND,
      );
    }

    // 조건부로 상태 변경 시도 (낙관적 제어)
    const updated = await tx.product.updateMany({
      where: {
        id: productId,
        status: 'PURCHASE_RESERVED',
        purchaseReservedUserId: userId,
      },
      data: {
        status: 'APPROVED',
        purchaseReservedUserId: null,
        purchaseReservedAt: null,
      },
    });

    if (updated.count === 0) {
      throw new CustomError(
        400,
        'ALREADY_CANCELED_OR_INVALID',
        PRODUCT_MESSAGES.ALREADY_CANCELED_OR_INVALID,
      );
    }

    // 구매자의 마지막 결제 로그 조회
    const lastPaymentLog = await tx.paymentLog.findFirst({
      where: {
        userId,
        productId,
        paymentType: 'PURCHASE',
      },
      orderBy: {
        paidAt: 'desc',
      },
    });

    if (!lastPaymentLog) {
      throw new CustomError(
        404,
        'PAYMENT_LOG_NOT_FOUND',
        PRODUCT_MESSAGES.PAYMENT_LOG_NOT_FOUND,
      );
    }

    const purchaseAmount = lastPaymentLog.amount;

    // 구매자 잔액 복원
    const buyer = await tx.user.findUnique({ where: { id: userId } });
    const updatedBuyer = await tx.user.update({
      where: { id: userId },
      data: { balance: { increment: purchaseAmount } },
    });

    // 구매 취소 결제 로그 생성
    await tx.paymentLog.create({
      data: {
        userId,
        productId: product.id,
        amount: purchaseAmount,
        paymentType: 'PURCHASE_CANCEL',
        memo: `[구매취소] ${product.title}`,
        paidAt: new Date(),
        balanceBefore: buyer.balance,
        balanceAfter: updatedBuyer.balance,
      },
    });

    // 판매자 잔액 차감
    const commissionRate =
      product.owner.role === 'INFLUENCER'
        ? INFLUENCER_PURCHASE_COMMISSION_RATE
        : USER_PURCHASE_COMMISSION_RATE;
    const commission = Math.floor(purchaseAmount * commissionRate);
    const sellerProfit = purchaseAmount - commission;

    const seller = await tx.user.findUnique({ where: { id: product.ownerId } });
    const updatedSeller = await tx.user.update({
      where: { id: product.ownerId },
      data: { balance: { decrement: sellerProfit } },
    });

    // 판매자 결제 로그 생성
    await tx.paymentLog.create({
      data: {
        userId: product.ownerId,
        productId,
        amount: -sellerProfit,
        paymentType: 'OWNER_PAYOUT_CANCEL',
        memo: `[판매취소] ${product.title}`,
        paidAt: new Date(),
        balanceBefore: seller.balance,
        balanceAfter: updatedSeller.balance,
      },
    });

    // 플랫폼 계정 조회
    const platformAccount = await tx.platformAccount.findFirst();
    if (!platformAccount) {
      throw new CustomError(
        500,
        'PLATFORM_ACCOUNT_NOT_FOUND',
        PLATFORM_MESSAGES.PLATFORM_ACCOUNT_NOT_FOUND,
      );
    }

    // 플랫폼 잔액 차감 (수수료만큼)
    const platformBalanceBefore = platformAccount.balance;
    const platformBalanceAfter = platformBalanceBefore - commission;

    await tx.platformAccount.update({
      where: { id: platformAccount.id },
      data: { balance: { decrement: commission } },
    });

    // 플랫폼 수수료 차감 로그 생성
    await tx.platformPaymentLog.create({
      data: {
        platformAccountId: platformAccount.id,
        type: 'REFUND',
        amount: -commission,
        memo: `[자동] 구매 취소 수수료 환불: ${product.title}`,
        balanceBefore: platformBalanceBefore,
        balanceAfter: platformBalanceAfter,
        userId,
      },
    });

    // 알림 전송
    await createNotification({
      userId: product.ownerId,
      type: 'PURCHASE_CANCEL',
      message: `[판매취소] ${product.title} 상품의 판매가 취소되었습니다.`,
      url: `/products/${product.id}`,
      productId: product.id,
    });

    // 응답
    return {
      productId: product.id,
      title: product.title,
      status: 'APPROVED',
      refundAmount: purchaseAmount,
    };
  });
};
