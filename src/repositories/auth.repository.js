import prisma from '../data-source.js';

export const findByEmail = async (email) => {
  return await prisma.account.findFirst({
    where: {
      email,
      deletedAt: null,
      user: {
        deletedAt: null,
      },
    },
    include: { user: true },
  });
};

export const findAnyByEmail = async (email) => {
  return await prisma.account.findFirst({
    where: { email },
    include: { user: true },
  });
};

export const createUser = async ({
  email,
  passwordHash,
  name,
  phone,
  provider = 'LOCAL',
  providerId = null,
}) => {
  const data = {
    provider,
    providerId,
    email,
    ...(passwordHash && { passwordHash }), // passwordHash가 undefined인 경우 제거
    user: {
      create: {
        name,
        phone,
      },
    },
  };

  return await prisma.account.create({
    data,
    include: { user: true },
  });
};

export const restoreAccountByEmail = async (email, passwordHash) => {
  const account = await prisma.account.findFirst({
    where: { email },
    include: { user: true },
  });
  if (!account) throw new Error('Account not found');

  return await prisma.account.update({
    where: { id: account.id },
    data: {
      deletedAt: null,
      passwordHash,
      verifiedEmail: true,
      user: { update: { deletedAt: null } },
    },
    include: { user: true },
  });
};

export const findAccountByProvider = async (provider, providerId) => {
  return await prisma.account.findFirst({
    where: {
      provider,
      providerId,
      deletedAt: null,
      user: {
        deletedAt: null,
      },
    },
    include: { user: true },
  });
};

export const updatePasswordByEmail = async (id, passwordHash) => {
  return await prisma.account.update({
    where: { id },
    data: { passwordHash },
  });
};
