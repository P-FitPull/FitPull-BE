import prisma from '../data-source.js';
import {
  getProductByIdForPurchase,
  getCompletedRentalTotalByUser,
} from '../repositories/purchase.repository.js';
import { PRODUCT_MESSAGES } from '../constants/messages.js';
import CustomError from '../utils/customError.js';
import { PURCHASE_COMMISSION_RATE } from '../constants/commission.js';
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
    if (product.status === 'SOLD') {
      throw new CustomError(400, 'ALREADY_SOLD', PRODUCT_MESSAGES.ALREADY_SOLD);
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
        amount: finalPrice,
        paymentType: 'PURCHASE',
        memo: `[구매] ${product.title} (할인: ${totalRentalAmount}원)`,
        paidAt: new Date(),
        balanceBefore: buyer.balance,
        balanceAfter: updatedBuyer.balance,
      },
    });

    // 판매자 정산 및 수익 로그 기록
    const commission = Math.floor(finalPrice * PURCHASE_COMMISSION_RATE);
    const sellerProfit = finalPrice - commission;

    const seller = await tx.user.findUnique({ where: { id: product.ownerId } });
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
    await tx.product.update({
      where: { id: product.id },
      data: {
        status: 'SOLD',
        purchaseReservedUserId: userId,
        purchaseReservedAt: new Date(),
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
      status: 'SOLD',
      sellerProfit,
      commission,
    };
  });
};
