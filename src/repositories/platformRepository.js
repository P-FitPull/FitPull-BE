import prisma from '../data-source.js';
import CustomError from '../utils/customError.js';
import { PLATFORM_MESSAGES } from '../constants/messages.js';

export const getPlatformBalanceRepo = async () => {
  const account = await prisma.platformAccount.findFirst();
  if (!account) return 0;
  return account.balance;
};

export const getPlatformSummaryRepo = async () => {
  const [income, outcome, ownerPayout, refund] = await Promise.all([
    prisma.platformPaymentLog.aggregate({
      _sum: { amount: true },
      where: { type: 'INCOME' },
    }),
    prisma.platformPaymentLog.aggregate({
      _sum: { amount: true },
      where: { type: 'OUTCOME' },
    }),
    prisma.platformPaymentLog.aggregate({
      _sum: { amount: true },
      where: { type: 'OWNER_PAYOUT' },
    }),
    prisma.platformPaymentLog.aggregate({
      _sum: { amount: true },
      where: { type: 'REFUND' },
    }),
  ]);
  return {
    totalIncome: income._sum.amount || 0,
    totalOutcome: outcome._sum.amount || 0,
    totalOwnerPayout: ownerPayout._sum.amount || 0,
    totalRefund: refund._sum.amount || 0,
  };
};

export const getPlatformLogsRepo = async ({
  type,
  skip = 0,
  take = 20,
  startDate,
  endDate,
} = {}) => {
  const where = {};
  if (type) where.type = type;
  if (startDate || endDate) {
    where.createdAt = {};
    if (startDate) where.createdAt.gte = new Date(startDate);
    if (endDate) where.createdAt.lte = new Date(endDate);
  }
  const [logs, total] = await Promise.all([
    prisma.platformPaymentLog.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take,
    }),
    prisma.platformPaymentLog.count({ where }),
  ]);
  return { logs, total };
};

export const addPlatformDepositRepo = async ({ amount, memo }) => {
  return await prisma.$transaction(async (tx) => {
    const account = await tx.platformAccount.findFirst();
    if (!account)
      throw new CustomError(
        500,
        'PLATFORM_ACCOUNT_NOT_FOUND',
        PLATFORM_MESSAGES.PLATFORM_ACCOUNT_NOT_FOUND,
      );
    const balanceBefore = account.balance;
    const balanceAfter = balanceBefore + amount;
    await tx.platformAccount.update({
      where: { id: account.id },
      data: { balance: { increment: amount } },
    });

    const log = await tx.platformPaymentLog.create({
      data: {
        platformAccountId: account.id,
        type: 'INCOME',
        amount,
        memo,
        balanceBefore,
        balanceAfter,
      },
    });
    return { balance: balanceAfter, log };
  });
};
