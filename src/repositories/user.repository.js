import prisma from '../data-source.js';

export const findUserById = async (userId) => {
  return await prisma.user.findFirst({
    where: { id: userId, deletedAt: null },
  });
};

export const updateUserById = async (userId, updateData) => {
  return await prisma.user.update({
    where: { id: userId },
    data: updateData,
  });
};

export const softDeleteUserById = async (userId) => {
  await prisma.account.updateMany({
    where: { userId, deletedAt: null },
    data: { deletedAt: new Date() },
  });
  return await prisma.user.update({
    where: { id: userId },
    data: { deletedAt: new Date() },
  });
};

// 전화번호로 유저 찾기
export const findUserByPhone = async (phone) => {
  return await prisma.user.findFirst({
    where: { phone },
  });
};

// 전화번호 인증 완료 처리
export const updateUserVerifiedPhone = async (userId) => {
  return await prisma.user.update({
    where: { id: userId },
    data: {
      verifiedPhone: true,
    },
  });
};

export const findValidUserByPhone = async (phone) => {
  if (phone === '00000000000') return null;

  return await prisma.user.findFirst({
    where: {
      phone,
      deletedAt: null,
    },
  });
};
