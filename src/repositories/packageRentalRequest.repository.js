import prisma from '../data-source.js';

export const createPackageRentalRequestRepo = async (data) => {
  return await prisma.packageRentalRequest.create({
    data,
    include: { items: true },
  });
};

export const findMyPackageRentalRequestsRepo = async (userId) => {
  return await prisma.packageRentalRequest.findMany({
    where: { userId, deletedAt: null },
    include: {
      package: true,
      user: true,
    },
    orderBy: { createdAt: 'desc' },
  });
};

export const findPendingPackageRentalRequestsRepo = async () => {
  return await prisma.packageRentalRequest.findMany({
    where: { status: 'PENDING', deletedAt: null },
    include: {
      package: true,
      user: true,
    },
    orderBy: { createdAt: 'desc' },
  });
};

export const cancelPackageRentalRequestRepo = async (id) => {
  return await prisma.packageRentalRequest.update({
    where: { id },
    data: { status: 'CANCELED', deletedAt: new Date() },
  });
};

export const approvePackageRentalRequestRepo = async (id) => {
  return await prisma.packageRentalRequest.update({
    where: { id },
    data: { status: 'APPROVED', deletedAt: null },
  });
};

export const rejectPackageRentalRequestRepo = async (id) => {
  return await prisma.packageRentalRequest.update({
    where: { id },
    data: { status: 'REJECTED', deletedAt: new Date() },
  });
};

// 패키지 대여요청 상세 조회 (items, package, user 포함)
export const getPackageRentalRequestById = async (id) => {
  return await prisma.packageRentalRequest.findUnique({
    where: { id, deletedAt: null },
    include: {
      items: true,
      package: true,
      user: true,
    },
  });
};
