import prisma from '../data-source.js';

export const createPackageRentalRequestRepo = async (data) => {
  return await prisma.packageRentalRequest.create({
    data,
    include: { items: true },
  });
};

export const getPackageRentalRequestByIdRepo = async (id, userId) => {
  return await prisma.packageRentalRequest.findFirst({
    where: { id, userId },
    include: {
      items: { include: { product: true, owner: true } },
      package: true,
    },
  });
};

export const getMyPackageRentalRequestsRepo = async (userId) => {
  return await prisma.packageRentalRequest.findMany({
    where: { userId },
    include: {
      items: { include: { product: true, owner: true } },
      package: true,
    },
    orderBy: { createdAt: 'desc' },
  });
};

export const cancelPackageRentalRequestRepo = async (id) => {
  return await prisma.packageRentalRequest.update({
    where: { id },
    data: { status: 'CANCELED' },
  });
};

export const approvePackageRentalRequestRepo = async (id) => {
  return await prisma.packageRentalRequest.update({
    where: { id },
    data: { status: 'APPROVED' },
  });
};

export const rejectPackageRentalRequestRepo = async (id) => {
  return await prisma.packageRentalRequest.update({
    where: { id },
    data: { status: 'REJECTED' },
  });
};
