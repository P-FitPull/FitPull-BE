import { findUserById } from '../repositories/user.repository.js';
import {
  chargeBalanceRepo,
  useBalanceRepo,
  findPaymentLogsByUserRepo,
} from '../repositories/paymentRepository.js';
import CustomError from '../utils/customError.js';
import { PAYMENT_MESSAGES, PLATFORM_MESSAGES } from '../constants/messages.js';
import { MAX_INT_32 } from '../constants/limits.js';
import prisma from '../data-source.js';

export const chargeBalance = async (userId, amount) => {
  if (!userId) {
    throw new CustomError(401, 'AUTH_REQUIRED', PAYMENT_MESSAGES.AUTH_REQUIRED);
  }
  if (typeof amount !== 'number' || amount <= 0 || amount > MAX_INT_32) {
    throw new CustomError(400, 'INVALID_INPUT', PAYMENT_MESSAGES.INVALID_INPUT);
  }

  const user = await findUserById(userId);
  if (!user) {
    throw new CustomError(
      404,
      'USER_NOT_FOUND',
      PAYMENT_MESSAGES.USER_NOT_FOUND,
    );
  }
  if (!user.verifiedPhone) {
    throw new CustomError(
      403,
      'PHONE_NOT_VERIFIED',
      PAYMENT_MESSAGES.PHONE_NOT_VERIFIED,
    );
  }

  const updated = await chargeBalanceRepo(userId, amount);
  return updated;
};

export const useBalance = async (userId, amount) => {
  if (!userId) {
    throw new CustomError(401, 'AUTH_REQUIRED', PAYMENT_MESSAGES.AUTH_REQUIRED);
  }
  if (typeof amount !== 'number' || amount <= 0 || amount > MAX_INT_32) {
    throw new CustomError(
      400,
      'INVALID_USE_INPUT',
      PAYMENT_MESSAGES.INVALID_USE_INPUT,
    );
  }

  const user = await findUserById(userId);
  if (!user) {
    throw new CustomError(
      404,
      'USER_NOT_FOUND',
      PAYMENT_MESSAGES.USER_NOT_FOUND,
    );
  }
  if (!user.verifiedPhone) {
    throw new CustomError(
      403,
      'PHONE_NOT_VERIFIED',
      PAYMENT_MESSAGES.PHONE_NOT_VERIFIED,
    );
  }
  if (user.balance < amount) {
    throw new CustomError(
      400,
      'INSUFFICIENT_BALANCE',
      PAYMENT_MESSAGES.INSUFFICIENT_BALANCE,
    );
  }

  const updated = await useBalanceRepo(userId, amount);
  return updated;
};

export const getPaymentLogs = async (
  userId,
  { type, skip = 0, take = 20 } = {},
) => {
  if (!userId) {
    throw new CustomError(401, 'AUTH_REQUIRED', PAYMENT_MESSAGES.AUTH_REQUIRED);
  }
  const { logs, total } = await findPaymentLogsByUserRepo(userId, {
    type,
    skip,
    take,
  });
  if (!logs || logs.length === 0) {
    return { logs: [], total: 0 };
  }
  return { logs, total };
};

export const chargeStorageFee = async (
  userId,
  productId,
  fee,
  productTitle,
) => {
  const user = await findUserById(userId);
  if (!user) {
    throw new CustomError(
      404,
      'USER_NOT_FOUND',
      PAYMENT_MESSAGES.USER_NOT_FOUND,
    );
  }

  return await prisma.$transaction(async (tx) => {
    const balanceBefore = user.balance;

    // 잔액 차감 (마이너스 허용)
    const updatedUser = await tx.user.update({
      where: { id: userId },
      data: {
        balance: {
          decrement: fee,
        },
      },
    });
    const balanceAfter = updatedUser.balance;

    // PaymentLog 생성
    const paymentLog = await tx.paymentLog.create({
      data: {
        userId,
        productId,
        amount: fee,
        paymentType: 'STORAGE_FEE',
        memo: `[자동] ${productTitle} 상품 보관료`,
        balanceBefore,
        balanceAfter,
        paidAt: new Date(),
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

    // 플랫폼 잔액 증가
    const platformBalanceBefore = platformAccount.balance;
    const updatedPlatformAccount = await tx.platformAccount.update({
      where: { id: platformAccount.id },
      data: { balance: { increment: fee } },
    });
    const platformBalanceAfter = updatedPlatformAccount.balance;

    // 플랫폼 수익 로그 생성
    await tx.platformPaymentLog.create({
      data: {
        platformAccountId: platformAccount.id,
        type: 'STORAGE_FEE_INCOME',
        amount: fee,
        memo: `[자동] 보관료 수입: ${productTitle}`,
        balanceBefore: platformBalanceBefore,
        balanceAfter: platformBalanceAfter,
        userId: userId,
      },
    });

    return {
      paymentLogId: paymentLog.id,
      userId,
      balanceAfter,
    };
  });
};
