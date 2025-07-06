import prisma from '../data-source.js';
import CustomError from '../utils/customError.js';
import {
  PACKAGE_MESSAGES,
  RENTAL_REQUEST_MESSAGES,
  PLATFORM_MESSAGES,
} from '../constants/messages.js';
import { findUserById } from '../repositories/user.repository.js';
import {
  PERIOD_RENTAL_DISCOUNT_RATE,
  INFLUENCER_PROMO_RENTAL_DISCOUNT_RATE,
  PACKAGE_RENTAL_DISCOUNT_RATE,
} from '../constants/discount.js';
import { getPackageByIdRepo } from '../repositories/package.repository.js';
import { checkRentalDateConflict } from '../repositories/rentalRequest.repository.js';
import { findInfluencerPromoByProductId } from '../repositories/influencerPromo.repository.js';
import { createNotification } from './notification.service.js';
import { NOTIFICATION_MESSAGES } from '../constants/messages.js';

export const createPackageRentalRequest = async ({
  userId,
  packageId,
  startDate,
  endDate,
  howToReceive,
  memo,
}) => {
  //패키지, 유저, 상품 정보 검증
  const pkg = await getPackageByIdRepo(packageId);
  if (!pkg)
    throw new CustomError(
      404,
      'PACKAGE_NOT_FOUND',
      PACKAGE_MESSAGES.PACKAGE_NOT_FOUND,
    );

  const user = await findUserById(userId);
  if (!user)
    throw new CustomError(
      404,
      'USER_NOT_FOUND',
      RENTAL_REQUEST_MESSAGES.USER_NOT_FOUND,
    );

  const start = new Date(startDate);
  const end = new Date(endDate);
  const now = new Date();
  const oneMonthLater = new Date();
  oneMonthLater.setDate(now.getDate() + 30);

  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    throw new CustomError(
      400,
      'INVALID_DATE_FORMAT',
      RENTAL_REQUEST_MESSAGES.INVALID_DATE_FORMAT,
    );
  }
  if (start < now.setHours(0, 0, 0, 0)) {
    throw new CustomError(
      400,
      'START_DATE_BEFORE_TODAY',
      RENTAL_REQUEST_MESSAGES.START_DATE_BEFORE_TODAY,
    );
  }
  if (end <= start) {
    throw new CustomError(
      400,
      'INVALID_RENTAL_DATE',
      RENTAL_REQUEST_MESSAGES.INVALID_RENTAL_DATE,
    );
  }
  if (start > oneMonthLater) {
    throw new CustomError(
      400,
      'RENTAL_DATE_LIMIT',
      RENTAL_REQUEST_MESSAGES.START_DATE_LIMIT,
    );
  }
  if (!howToReceive) {
    throw new CustomError(
      400,
      'RECEIVE_METHOD_REQUIRED',
      RENTAL_REQUEST_MESSAGES.RECEIVE_METHOD_REQUIRED,
    );
  }

  // 각 상품별 대여 가능 여부 및 금액 계산
  let totalPrice = 0;
  const dayCount = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
  const items = [];

  for (const item of pkg.items) {
    const product = item.product;
    // 상품 상태/삭제 체크
    if (!product || product.deletedAt) {
      throw new CustomError(
        404,
        'PRODUCT_NOT_FOUND',
        RENTAL_REQUEST_MESSAGES.PRODUCT_NOT_FOUND,
      );
    }
    if (['PURCHASE_RESERVED', 'SOLD'].includes(product.status)) {
      throw new CustomError(
        400,
        'RENTAL_NOT_ALLOWED',
        RENTAL_REQUEST_MESSAGES.RENTAL_NOT_ALLOWED,
      );
    }
    // 날짜 중복 체크
    const conflict = await checkRentalDateConflict(
      product.id,
      startDate,
      endDate,
    );
    if (conflict) {
      throw new CustomError(
        400,
        'RENTAL_DATE_CONFLICT',
        RENTAL_REQUEST_MESSAGES.RENTAL_DATE_CONFLICT,
      );
    }

    // 기본 가격
    let price = product.price * dayCount;

    // 할인 정책 적용
    const discountPolicy = PERIOD_RENTAL_DISCOUNT_RATE.find(
      (policy) => dayCount >= policy.minDays,
    );
    if (discountPolicy) {
      price *= discountPolicy.rate;
    }

    // 인플루언서 홍보관 할인
    const influencerPromo = await findInfluencerPromoByProductId(product.id);
    if (influencerPromo) {
      price *= 1 - INFLUENCER_PROMO_RENTAL_DISCOUNT_RATE;
    }

    // 패키지 대여 할인
    price *= 1 - PACKAGE_RENTAL_DISCOUNT_RATE;

    price = Math.round(price);

    totalPrice += price;

    items.push({
      productId: product.id,
      ownerId: product.ownerId,
      price: product.price * dayCount,
      finalPrice: price,
      status: 'PENDING',
    });
  }

  if (user.balance < totalPrice) {
    throw new CustomError(
      400,
      'INSUFFICIENT_BALANCE',
      RENTAL_REQUEST_MESSAGES.INSUFFICIENT_BALANCE,
    );
  }

  // 트랜잭션: 잔고 차감, 패키지 대여 생성, 결제로그, 플랫폼 정산
  return await prisma.$transaction(async (tx) => {
    // 동시성 체크
    const exists = await tx.packageRentalRequest.findFirst({
      where: {
        userId,
        packageId,
        status: { in: ['PENDING', 'APPROVED'] },
        startDate: { lte: new Date(endDate) },
        endDate: { gte: new Date(startDate) },
      },
    });
    if (exists) {
      throw new CustomError(
        400,
        'ALREADY_REQUESTED',
        PACKAGE_MESSAGES.ALREADY_REQUESTED,
      );
    }

    // 유저 잔액 차감
    const updatedUser = await tx.user.update({
      where: { id: userId },
      data: { balance: { decrement: totalPrice } },
      select: { balance: true },
    });

    // 패키지 대여 요청 생성
    const packageRentalRequest = await tx.packageRentalRequest.create({
      data: {
        userId,
        packageId,
        startDate: start,
        endDate: end,
        totalPrice,
        memo,
        status: 'PENDING',
        items: {
          create: items,
        },
      },
      include: { items: true },
    });

    // 결제 로그
    await tx.paymentLog.create({
      data: {
        userId,
        amount: totalPrice,
        paymentType: 'RENTAL_PAYMENT',
        memo: `[패키지대여] ${pkg.title}`,
        balanceBefore: user.balance,
        balanceAfter: updatedUser.balance,
        paidAt: new Date(),
      },
    });

    // 플랫폼 계정 처리
    const platformAccount = await tx.platformAccount.findFirst();
    if (!platformAccount) {
      throw new CustomError(
        500,
        'PLATFORM_ACCOUNT_NOT_FOUND',
        PLATFORM_MESSAGES.PLATFORM_ACCOUNT_NOT_FOUND,
      );
    }
    const platformBalanceBefore = platformAccount.balance;
    const platformBalanceAfter = platformBalanceBefore + totalPrice;

    await tx.platformAccount.update({
      where: { id: platformAccount.id },
      data: { balance: { increment: totalPrice } },
    });

    await tx.platformPaymentLog.create({
      data: {
        platformAccountId: platformAccount.id,
        type: 'INCOME',
        amount: totalPrice,
        memo: `[패키지대여] ${pkg.title}`,
        balanceBefore: platformBalanceBefore,
        balanceAfter: platformBalanceAfter,
        userId,
      },
    });

    return packageRentalRequest;
  });
};

export const approvePackageRentalRequest = async (id) => {
  // 상태 변경
  const updated = await prisma.packageRentalRequest.updateMany({
    where: {
      id,
      status: 'PENDING',
    },
    data: { status: 'APPROVED' },
  });
  if (updated.count === 0) {
    throw new CustomError(
      404,
      'PACKAGE_RENTAL_NOT_FOUND_OR_ALREADY_PROCESSED',
      PACKAGE_MESSAGES.PACKAGE_RENTAL_ALREADY_PROCESSED,
    );
  }

  // 상세 정보 조회 (패키지, 대여자, 상품, 소유주)
  const request = await prisma.packageRentalRequest.findUnique({
    where: { id },
    include: {
      user: true,
      package: true,
      items: { include: { product: true } },
    },
  });
  if (!request) {
    throw new CustomError(
      404,
      'PACKAGE_RENTAL_NOT_FOUND',
      PACKAGE_MESSAGES.PACKAGE_RENTAL_REQUEST_NOT_FOUND,
    );
  }

  // 대여자 알림
  await createNotification({
    userId: request.userId,
    type: 'PACKAGE_RENTAL_STATUS',
    message: `${NOTIFICATION_MESSAGES.PACKAGE_RENTAL_APPROVED} [${request.package.title}]`,
    url: `/package-rental-requests/${id}`,
    packageRentalRequestId: id,
  });

  // 각 상품 소유주 알림
  const ownerIdSet = new Set();
  for (const item of request.items) {
    if (item.product && item.product.ownerId) {
      ownerIdSet.add(item.product.ownerId);
    }
  }
  for (const ownerId of ownerIdSet) {
    await createNotification({
      userId: ownerId,
      type: 'PACKAGE_RENTAL_STATUS',
      message: `${NOTIFICATION_MESSAGES.PACKAGE_RENTAL_PRODUCT_RENTED} [${request.package.title}]`,
      url: `/package-rental-requests/${id}`,
      packageRentalRequestId: id,
    });
  }

  // 승인 결과 반환
  return {
    id,
    status: 'APPROVED',
    packageTitle: request.package.title,
    totalPrice: request.totalPrice,
  };
};

export const cancelPackageRentalRequest = async (
  packageRentalRequestId,
  userId,
  refundMemo = null,
) => {
  // 패키지 대여 요청 조회
  const packageRentalRequest = await prisma.packageRentalRequest.findUnique({
    where: { id: packageRentalRequestId },
    include: {
      user: true,
      package: true,
      items: { include: { product: true } },
    },
  });
  if (!packageRentalRequest)
    throw new CustomError(
      404,
      'PACKAGE_RENTAL_REQUEST_NOT_FOUND',
      PACKAGE_MESSAGES.PACKAGE_RENTAL_REQUEST_NOT_FOUND,
    );
  if (packageRentalRequest.userId !== userId) {
    throw new CustomError(403, 'NO_PERMISSION', PACKAGE_MESSAGES.NO_PERMISSION);
  }
  if (!['PENDING', 'APPROVED'].includes(packageRentalRequest.status)) {
    throw new CustomError(
      400,
      'PACKAGE_RENTAL_CANCEL_NOT_ALLOWED',
      PACKAGE_MESSAGES.PACKAGE_RENTAL_CANCEL_NOT_ALLOWED,
    );
  }

  // 3일 전까지만 취소 가능
  const now = new Date();
  const startDate = new Date(packageRentalRequest.startDate);
  const diffDays = (startDate - now) / (1000 * 60 * 60 * 24);
  if (diffDays < 3) {
    throw new CustomError(
      400,
      'PACKAGE_RENTAL_CANCEL_TOO_LATE',
      PACKAGE_MESSAGES.PACKAGE_RENTAL_CANCEL_TOO_LATE,
    );
  }

  // 트랜잭션: 상태 변경, 환불, 결제로그, 플랫폼 정산
  const result = await prisma.$transaction(async (tx) => {
    // 동시성 처리: FOR UPDATE
    await tx.$executeRaw`SELECT * FROM "PackageRentalRequest" WHERE id = ${packageRentalRequestId} FOR UPDATE`;

    // 상태 변경
    const updated = await tx.packageRentalRequest.updateMany({
      where: {
        id: packageRentalRequestId,
        status: { in: ['PENDING', 'APPROVED'] },
      },
      data: { status: 'CANCELED' },
    });
    if (updated.count === 0) {
      throw new CustomError(
        400,
        'ALREADY_PROCESSED',
        PACKAGE_MESSAGES.PACKAGE_RENTAL_ALREADY_PROCESSED,
      );
    }

    // 유저 환불
    const updatedUser = await tx.user.update({
      where: { id: packageRentalRequest.userId },
      data: { balance: { increment: packageRentalRequest.totalPrice } },
      select: { balance: true },
    });

    // 결제 로그
    await tx.paymentLog.create({
      data: {
        userId: packageRentalRequest.userId,
        packageRentalRequestId,
        amount: packageRentalRequest.totalPrice,
        paymentType: 'REFUND',
        memo: refundMemo || '[자동] 패키지 대여 취소 환불',
        balanceBefore: packageRentalRequest.user.balance,
        balanceAfter: updatedUser.balance,
        paidAt: new Date(),
      },
    });

    // 플랫폼 계정
    const platformAccount = await tx.platformAccount.findFirst();
    if (!platformAccount)
      throw new CustomError(
        500,
        'PLATFORM_ACCOUNT_NOT_FOUND',
        PLATFORM_MESSAGES.PLATFORM_ACCOUNT_NOT_FOUND,
      );
    if (platformAccount.balance < packageRentalRequest.totalPrice) {
      throw new CustomError(
        422,
        'INSUFFICIENT_PLATFORM_BALANCE',
        PLATFORM_MESSAGES.INSUFFICIENT_PLATFORM_BALANCE,
      );
    }
    await tx.platformAccount.update({
      where: { id: platformAccount.id },
      data: { balance: { decrement: packageRentalRequest.totalPrice } },
    });
    await tx.platformPaymentLog.create({
      data: {
        platformAccountId: platformAccount.id,
        type: 'REFUND',
        amount: packageRentalRequest.totalPrice,
        memo: `[자동] 패키지 대여 취소 환불: ${packageRentalRequest.package?.title ?? ''}`,
        balanceBefore: platformAccount.balance,
        balanceAfter: platformAccount.balance - packageRentalRequest.totalPrice,
        packageRentalRequestId,
        userId: packageRentalRequest.userId,
      },
    });
    return {
      packageRentalRequestId,
      refundedAmount: packageRentalRequest.totalPrice,
      status: 'CANCELED',
    };
  });

  // 취소한 유저에게 알림
  await createNotification({
    userId: packageRentalRequest.userId,
    type: 'PACKAGE_RENTAL_STATUS',
    message: `${NOTIFICATION_MESSAGES.PACKAGE_RENTAL_CANCELED} [${packageRentalRequest.package?.title ?? ''}]`,
    url: `/package-rental-requests/${packageRentalRequestId}`,
    packageRentalRequestId,
  });

  // 각 상품 소유주에게 취소 알림
  const ownerIdSet = new Set();
  for (const item of packageRentalRequest.items) {
    if (item.product && item.product.ownerId) {
      ownerIdSet.add(item.product.ownerId);
    }
  }
  for (const ownerId of ownerIdSet) {
    await createNotification({
      userId: ownerId,
      type: 'PACKAGE_RENTAL_STATUS',
      message: `${NOTIFICATION_MESSAGES.PACKAGE_RENTAL_CANCELED} [${packageRentalRequest.package?.title ?? ''}]`,
      url: `/package-rental-requests/${packageRentalRequestId}`,
      packageRentalRequestId,
    });
  }

  return result;
};

export const rejectPackageRentalRequestByAdmin = async (
  packageRentalRequestId,
  refundMemo = null,
) => {
  // 패키지 대여 요청 조회
  const packageRentalRequest = await prisma.packageRentalRequest.findUnique({
    where: { id: packageRentalRequestId },
    include: {
      user: true,
      package: true,
      items: { include: { product: true } },
    },
  });
  if (!packageRentalRequest)
    throw new CustomError(
      404,
      'PACKAGE_RENTAL_REQUEST_NOT_FOUND',
      PACKAGE_MESSAGES.PACKAGE_RENTAL_REQUEST_NOT_FOUND,
    );
  if (['REJECTED', 'CANCELED'].includes(packageRentalRequest.status)) {
    throw new CustomError(
      400,
      'ALREADY_PROCESSED',
      PACKAGE_MESSAGES.PACKAGE_RENTAL_ALREADY_PROCESSED,
    );
  }

  //트랜잭션: 상태 변경, 환불, 결제로그, 플랫폼 정산
  const result = await prisma.$transaction(async (tx) => {
    await tx.$executeRaw`SELECT * FROM "PackageRentalRequest" WHERE id = ${packageRentalRequestId} FOR UPDATE`;

    const updated = await tx.packageRentalRequest.updateMany({
      where: {
        id: packageRentalRequestId,
        status: { in: ['PENDING', 'APPROVED'] },
      },
      data: { status: 'REJECTED' },
    });
    if (updated.count === 0) {
      throw new CustomError(
        400,
        'ALREADY_PROCESSED',
        PACKAGE_MESSAGES.PACKAGE_RENTAL_ALREADY_PROCESSED,
      );
    }

    // 유저 환불
    const updatedUser = await tx.user.update({
      where: { id: packageRentalRequest.userId },
      data: { balance: { increment: packageRentalRequest.totalPrice } },
      select: { balance: true },
    });

    // 결제 로그
    await tx.paymentLog.create({
      data: {
        userId: packageRentalRequest.userId,
        packageRentalRequestId,
        amount: packageRentalRequest.totalPrice,
        paymentType: 'REFUND',
        memo: refundMemo || '[자동] 어드민 거절 환불',
        balanceBefore: packageRentalRequest.user.balance,
        balanceAfter: updatedUser.balance,
        paidAt: new Date(),
      },
    });

    // 플랫폼 계정
    const platformAccount = await tx.platformAccount.findFirst();
    if (!platformAccount)
      throw new CustomError(
        500,
        'PLATFORM_ACCOUNT_NOT_FOUND',
        PLATFORM_MESSAGES.PLATFORM_ACCOUNT_NOT_FOUND,
      );
    if (platformAccount.balance < packageRentalRequest.totalPrice) {
      throw new CustomError(
        422,
        'INSUFFICIENT_PLATFORM_BALANCE',
        PLATFORM_MESSAGES.INSUFFICIENT_PLATFORM_BALANCE,
      );
    }
    await tx.platformAccount.update({
      where: { id: platformAccount.id },
      data: { balance: { decrement: packageRentalRequest.totalPrice } },
    });
    await tx.platformPaymentLog.create({
      data: {
        platformAccountId: platformAccount.id,
        type: 'REFUND',
        amount: packageRentalRequest.totalPrice,
        memo: `[자동] 어드민 거절 환불: ${packageRentalRequest.package?.title ?? ''}`,
        balanceBefore: platformAccount.balance,
        balanceAfter: platformAccount.balance - packageRentalRequest.totalPrice,
        packageRentalRequestId,
        userId: packageRentalRequest.userId,
      },
    });
    return {
      packageRentalRequestId,
      refundedAmount: packageRentalRequest.totalPrice,
      status: 'REJECTED',
    };
  });

  // 대여자(신청자)에게 거절 알림
  await createNotification({
    userId: packageRentalRequest.userId,
    type: 'PACKAGE_RENTAL_STATUS',
    message: `${NOTIFICATION_MESSAGES.PACKAGE_RENTAL_REJECTED} [${packageRentalRequest.package?.title ?? ''}]`,
    url: `/package-rental-requests/${packageRentalRequestId}`,
    packageRentalRequestId,
  });

  // 각 상품 소유주에게 거절 알림
  const ownerIdSet = new Set();
  for (const item of packageRentalRequest.items) {
    if (item.product && item.product.ownerId) {
      ownerIdSet.add(item.product.ownerId);
    }
  }
  for (const ownerId of ownerIdSet) {
    await createNotification({
      userId: ownerId,
      type: 'PACKAGE_RENTAL_STATUS',
      message: `${NOTIFICATION_MESSAGES.PACKAGE_RENTAL_REJECTED} [${packageRentalRequest.package?.title ?? ''}]`,
      url: `/package-rental-requests/${packageRentalRequestId}`,
      packageRentalRequestId,
    });
  }

  return result;
};
