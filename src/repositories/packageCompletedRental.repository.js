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
