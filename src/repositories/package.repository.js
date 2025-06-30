import prisma from '../data-source.js';

export const createPackageRepo = async (data) => {
  return await prisma.package.create({
    data,
  });
};

export const createPackageItemsRepo = async (items) => {
  return await prisma.packageItem.createMany({
    data: items,
  });
};

export const getPackageByIdRepo = async (id) => {
  return await prisma.package.findUnique({
    where: { id },
    include: { items: { include: { product: true } }, creator: true },
  });
};

export const getAllPackagesRepo = async (filter = {}) => {
  return await prisma.package.findMany({
    where: filter,
    include: { items: { include: { product: true } }, creator: true },
  });
};

export const updatePackageRepo = async (id, data) => {
  return await prisma.package.update({
    where: { id },
    data,
  });
};

export const deletePackageRepo = async (id) => {
  return await prisma.package.delete({
    where: { id },
  });
};
