import { getPackageByIdRepo } from '../repositories/package.repository.js';
import { getPackageRentalRequestById } from '../repositories/packageRentalRequest.repository.js';
import CustomError from '../utils/customError.js';
import prisma from '../data-source.js';
import {
  NOTIFICATION_MESSAGES,
  PLATFORM_MESSAGES,
  PACKAGE_MESSAGES,
} from '../constants/messages.js';
import {
  USER_RENTAL_COMMISSION_RATE,
  INFLUENCER_RENTAL_COMMISSION_RATE,
} from '../constants/commission.js';
import { createNotification } from './notification.service.js';
import {
  findPackageCompletedRentalsByUser,
  findAllPackageCompletedRentals,
} from '../repositories/packageCompletedRental.repository.js';

export const createPackageCompletedRental = async (packageRentalRequestId) => {
  // 패키지 대여요청 조회
  const packageRentalRequest = await getPackageRentalRequestById(
    packageRentalRequestId,
  );
  if (!packageRentalRequest)
    throw new CustomError(
      404,
      'PACKAGE_RENTAL_REQUEST_NOT_FOUND',
      PACKAGE_MESSAGES.PACKAGE_RENTAL_REQUEST_NOT_FOUND,
    );
  if (packageRentalRequest.status !== 'APPROVED')
    throw new CustomError(
      400,
      'PACKAGE_RENTAL_NOT_APPROVED',
      PACKAGE_MESSAGES.PACKAGE_RENTAL_NOT_APPROVED,
    );

  // 패키지 정보 조회
  const pkg = await getPackageByIdRepo(packageRentalRequest.packageId);
  if (!pkg)
    throw new CustomError(
      404,
      'PACKAGE_NOT_FOUND',
      PACKAGE_MESSAGES.PACKAGE_NOT_FOUND,
    );

  // 트랜잭션: 패키지 완료 + 각 상품별 CompletedRental 생성 + 정산/후처리
  return await prisma.$transaction(async (tx) => {
    // 이미 완료된 패키지 대여인지 체크
    const alreadyCompleted = await tx.packageCompletedRental.findUnique({
      where: { packageRentalRequestId },
    });
    if (alreadyCompleted) {
      return { message: PACKAGE_MESSAGES.PACKAGE_RENTAL_ALREADY_PROCESSED };
    }

    // 패키지 완료 생성
    const packageCompleted = await tx.packageCompletedRental.create({
      data: {
        packageRentalRequestId,
        userId: packageRentalRequest.userId,
        packageId: packageRentalRequest.packageId,
        startDate: packageRentalRequest.startDate,
        endDate: packageRentalRequest.endDate,
        totalPrice: packageRentalRequest.totalPrice,
      },
    });

    // 각 상품별 CompletedRental 생성 및 정산/후처리
    for (const item of packageRentalRequest.items) {
      const product = await tx.product.findUnique({
        where: { id: item.productId },
        include: { owner: true },
      });
      if (!product) continue;
      const owner = product.owner;
      const totalPrice = item.finalPrice;
      const commissionRate =
        owner.role === 'INFLUENCER'
          ? INFLUENCER_RENTAL_COMMISSION_RATE
          : USER_RENTAL_COMMISSION_RATE;
      const platformCommission = Math.floor(totalPrice * commissionRate);
      const ownerProfit = totalPrice - platformCommission;

      // CompletedRental 생성
      await tx.completedRental.create({
        data: {
          rentalRequestId: item.rentalRequestId,
          userId: packageRentalRequest.userId,
          productId: item.productId,
          startDate: packageRentalRequest.startDate,
          endDate: packageRentalRequest.endDate,
          totalPrice: item.finalPrice,
          packageCompletedRentalId: packageCompleted.id,
        },
      });

      // 상품의 마지막 대여 완료일 업데이트
      await tx.product.update({
        where: { id: item.productId },
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
          rentalRequestId: item.rentalRequestId,
          packageCompletedRentalId: packageCompleted.id,
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
          PLATFORM_MESSAGES.INSUFFICIENT_PLATFORM_BALANCE,
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
          packageCompletedRentalId: packageCompleted.id,
          memo: `[자동] 소유주 정산: ${product.title} (수수료 ${platformCommission}원 제외)`,
          balanceBefore: platformBalanceBefore,
          balanceAfter: platformBalanceAfter,
          rentalRequestId: item.rentalRequestId,
          userId: owner.id,
        },
      });

      // 플랫폼 수수료 수입 로그
      await tx.platformPaymentLog.create({
        data: {
          platformAccountId: platform.id,
          type: 'INCOME',
          amount: platformCommission,
          packageCompletedRentalId: packageCompleted.id,
          memo: `[자동] 플랫폼 수수료 수입: ${product.title}`,
          balanceBefore: platformBalanceAfter,
          balanceAfter: platformBalanceAfter + platformCommission,
          rentalRequestId: item.rentalRequestId,
          userId: packageRentalRequest.userId,
        },
      });

      // 리뷰 작성 요청 알림 (상품별)
      await createNotification({
        userId: packageRentalRequest.userId,
        type: 'REVIEW',
        message: `${NOTIFICATION_MESSAGES.REVIEW_REQUEST} [${product.title}]`,
        url: `/products/${product.id}`,
        productId: product.id,
        rentalRequestId: item.rentalRequestId,
      });
    }

    return packageCompleted;
  });
};

export const getMyPackageCompletedRentals = async (userId) => {
  const rentals = await findPackageCompletedRentalsByUser(userId);
  return rentals.map((rental) => ({
    packageCompletedRentalId: rental.id,
    packageRentalRequestId: rental.packageRentalRequestId,
    packageTitle: rental.package?.title,
    rentalPeriod: `${rental.startDate.toISOString().slice(0, 10)} ~ ${rental.endDate.toISOString().slice(0, 10)}`,
    totalPrice: Number(rental.totalPrice),
  }));
};

export const getAllPackageCompletedRentals = async () => {
  const rentals = await findAllPackageCompletedRentals();
  return rentals.map((rental) => ({
    packageCompletedRentalId: rental.id,
    packageRentalRequestId: rental.packageRentalRequestId,
    packageTitle: rental.package?.title,
    userName: rental.user?.name,
    userPhone: rental.user?.phone,
    rentalPeriod: `${rental.startDate.toISOString().slice(0, 10)} ~ ${rental.endDate.toISOString().slice(0, 10)}`,
    totalPrice: Number(rental.totalPrice),
  }));
};
