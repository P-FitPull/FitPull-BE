import {
  findCompletedRentalsByUser,
  findAllCompletedRentals,
} from '../repositories/completedRental.repository.js';
import { getRentalRequestById } from '../repositories/rentalRequest.repository.js';
import { getProductByIdRepo } from '../repositories/product.repository.js';
import CustomError from '../utils/customError.js';
import {
  COMPLETED_RENTAL_MESSAGES,
  PLATFORM_MESSAGES,
  NOTIFICATION_MESSAGES,
} from '../constants/messages.js';
import { createNotification } from './notification.service.js';
import {
  USER_RENTAL_COMMISSION_RATE,
  INFLUENCER_RENTAL_COMMISSION_RATE,
} from '../constants/commission.js';
import prisma from '../data-source.js';

export const completeRental = async (rentalRequestId) => {
  const rental = await getRentalRequestById(rentalRequestId);
  if (!rental)
    throw new CustomError(
      404,
      'RENTAL_NOT_FOUND',
      COMPLETED_RENTAL_MESSAGES.RENTAL_NOT_FOUND,
    );
  if (rental.status !== 'APPROVED')
    throw new CustomError(
      400,
      'RENTAL_NOT_APPROVED',
      COMPLETED_RENTAL_MESSAGES.RENTAL_NOT_APPROVED,
    );

  const product = await getProductByIdRepo(rental.productId);
  const pricePerDay = Number(product.price);
  const owner = product.owner;

  const days = Math.ceil(
    (rental.endDate - rental.startDate) / (1000 * 60 * 60 * 24),
  );
  const totalPrice = pricePerDay * days;
  const commissionRate =
    owner.role === 'INFLUENCER'
      ? INFLUENCER_RENTAL_COMMISSION_RATE
      : USER_RENTAL_COMMISSION_RATE;
  const platformCommission = Math.floor(totalPrice * commissionRate);
  const ownerProfit = totalPrice - platformCommission;

  const completedRental = await prisma.$transaction(async (tx) => {
    const alreadyCompleted = await tx.completedRental.findUnique({
      where: { rentalRequestId },
    });

    if (alreadyCompleted) {
      return { message: COMPLETED_RENTAL_MESSAGES.ALREADY_COMPLETED };
    }

    // CompletedRental 생성
    const created = await tx.completedRental.create({
      data: {
        rentalRequestId,
        userId: rental.userId,
        productId: rental.productId,
        startDate: rental.startDate,
        endDate: rental.endDate,
        totalPrice,
      },
    });

    // 상품의 마지막 대여 완료일 업데이트
    await tx.product.update({
      where: { id: rental.productId },
      data: { lastRentalCompletedAt: new Date() },
    });

    // 소유주 잔액 증가 (수수료 제외 금액)
    const updatedOwner = await tx.user.update({
      where: { id: owner.id },
      data: { balance: { increment: ownerProfit } },
      select: { balance: true },
    });

    // 유저 수익 로그
    await tx.paymentLog.create({
      data: {
        userId: owner.id,
        rentalRequestId,
        completedRentalId: created.id,
        amount: ownerProfit,
        paymentType: 'OWNER_PAYOUT',
        memo: `[자동] ${product.title} 대여 수익 (플랫폼 수수료 ${platformCommission}원 제외)`,
        balanceBefore: owner.balance,
        balanceAfter: updatedOwner.balance,
        paidAt: new Date(),
      },
    });

    // 플랫폼 계정 조회 + 잔액 감소 (수수료 제외 금액만큼만 차감)
    const platform = await tx.platformAccount.findFirst();
    if (!platform)
      throw new CustomError(
        500,
        'PLATFORM_ACCOUNT_NOT_FOUND',
        PLATFORM_MESSAGES.PLATFORM_ACCOUNT_NOT_FOUND,
      );

    const platformBalanceBefore = platform.balance;
    const platformBalanceAfter = platformBalanceBefore - ownerProfit;

    if (platformBalanceAfter < 0) {
      throw new CustomError(
        422,
        'INSUFFICIENT_PLATFORM_BALANCE',
        PLATFORM_MESSAGES.PLATFORM_ACCOUNT_NOT_FOUND,
      );
    }

    await tx.platformAccount.update({
      where: { id: platform.id },
      data: { balance: { decrement: ownerProfit } },
    });

    // 플랫폼 지출 로그
    await tx.platformPaymentLog.create({
      data: {
        platformAccountId: platform.id,
        type: 'OWNER_PAYOUT',
        amount: ownerProfit,
        completedRentalId: created.id,
        memo: `[자동] 소유주 정산: ${product.title} (수수료 ${platformCommission}원 제외)`,
        balanceBefore: platformBalanceBefore,
        balanceAfter: platformBalanceAfter,
        rentalRequestId,
        userId: owner.id,
      },
    });

    // 플랫폼 수수료 수입 로그
    await tx.platformPaymentLog.create({
      data: {
        platformAccountId: platform.id,
        type: 'INCOME',
        amount: platformCommission,
        completedRentalId: created.id,
        memo: `[자동] 플랫폼 수수료 수입: ${product.title}`,
        balanceBefore: platformBalanceAfter,
        balanceAfter: platformBalanceAfter + platformCommission,
        rentalRequestId,
        userId: rental.userId,
      },
    });

    return created;
  });

  // 리뷰 작성 요청 알림
  await createNotification({
    userId: rental.userId,
    type: 'REVIEW',
    message: `${NOTIFICATION_MESSAGES.REVIEW_REQUEST} [${product.title}]`,
    url: `/products/${product.id}`,
    productId: product.id,
    rentalRequestId: rentalRequestId,
  });

  return {
    completedRentalId: completedRental.id,
    rentalRequestId: completedRental.rentalRequestId,
    productTitle: rental.product.title,
    userName: rental.user.name,
    userPhone: rental.user.phone,
    rentalPeriod: `${rental.startDate.toISOString().slice(0, 10)} ~ ${rental.endDate.toISOString().slice(0, 10)}`,
    totalPrice: Number(totalPrice),
    platformCommission: Number(platformCommission),
    ownerProfit: Number(ownerProfit),
  };
};

export const getMyCompletedRentals = async (userId) => {
  const rentals = await findCompletedRentalsByUser(userId);

  return rentals.map((rental) => ({
    completedRentalId: rental.id,
    rentalRequestId: rental.rentalRequestId,
    productTitle: rental.product.title,
    rentalPeriod: `${rental.startDate.toISOString().slice(0, 10)} ~ ${rental.endDate.toISOString().slice(0, 10)}`,
    totalPrice: Number(rental.totalPrice),
  }));
};

export const getAllCompletedRentals = async () => {
  const rentals = await findAllCompletedRentals();

  return rentals.map((rental) => ({
    completedRentalId: rental.id,
    rentalRequestId: rental.rentalRequestId,
    productTitle: rental.product.title,
    userName: rental.user.name,
    userPhone: rental.user.phone,
    rentalPeriod: `${rental.startDate.toISOString().slice(0, 10)} ~ ${rental.endDate.toISOString().slice(0, 10)}`,
    totalPrice: Number(rental.totalPrice),
  }));
};
