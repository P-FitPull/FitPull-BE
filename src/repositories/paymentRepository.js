import prisma from '../data-source.js';

// 잔고 충전
export const chargeBalanceRepo = async (userId, amount) => {
  return await prisma.user.update({
    where: { id: userId },
    data: { balance: { increment: amount } },
    select: { id: true, balance: true },
  });
};

// 잔고 차감
export const useBalanceRepo = async (userId, amount) => {
  return await prisma.user.update({
    where: { id: userId },
    data: { balance: { decrement: amount } },
    select: { id: true, balance: true },
  });
};

export const createPaymentLogRepo = async ({
  userId,
  rentalRequestId,
  amount,
  paymentType,
  memo,
  balanceBefore,
  balanceAfter,
  paidAt,
}) => {
  return await prisma.paymentLog.create({
    data: {
      userId,
      rentalRequestId,
      amount,
      paymentType,
      memo,
      balanceBefore,
      balanceAfter,
      paidAt,
    },
  });
};

// 유저 결제/잔고 내역 조회
export const findPaymentLogsByUserRepo = async (
  userId,
  { type, skip = 0, take = 20 } = {},
) => {
  const where = { userId };

  if (type) where.paymentType = type;

  const [logs, total] = await Promise.all([
    prisma.paymentLog.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take,
      select: {
        id: true,
        amount: true,
        paymentType: true,
        memo: true,
        createdAt: true,
        balanceBefore: true,
        balanceAfter: true,
        rentalRequestId: true,
      },
    }),
    prisma.paymentLog.count({ where }),
  ]);
  return { logs, total };
};
