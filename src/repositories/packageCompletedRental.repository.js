import prisma from '../data-source.js';

export const createPackageCompletedRentalRepo = async (data) => {
  return await prisma.packageCompletedRental.create({ data });
};

export const findPackageCompletedRentalById = async (id) => {
  return await prisma.packageCompletedRental.findUnique({
    where: { id },
    include: {
      user: true,
      package: true,
      packageRentalRequest: true,
      completedRental: true,
    },
  });
};

export const findPackageCompletedRentalsByUser = async (userId) => {
  return await prisma.packageCompletedRental.findMany({
    where: { userId },
    include: {
      package: true,
      packageRentalRequest: true,
    },
    orderBy: { createdAt: 'desc' },
  });
};

export const findAllPackageCompletedRentals = async () => {
  return await prisma.packageCompletedRental.findMany({
    include: {
      user: true,
      package: true,
      packageRentalRequest: true,
    },
    orderBy: { createdAt: 'desc' },
  });
};
