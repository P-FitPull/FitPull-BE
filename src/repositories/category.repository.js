import prisma from '../data-source.js';

export const findAll = () => {
  return prisma.category.findMany({
    orderBy: { id: 'asc' },
    include: {
      products: {
        where: { status: 'APPROVED' },
      },
    },
  });
};

export const create = (name, description) => {
  return prisma.category.create({ data: { name, description } });
};

export const update = (id, name, description) => {
  return prisma.category.update({
    where: { id },
    data: { name, description },
  });
};

export const remove = (id) => {
  return prisma.category.delete({
    where: { id },
  });
};

export const findById = (id) => {
  return prisma.category.findUnique({ where: { id } });
};

export const findByName = (name) => {
  return prisma.category.findFirst({ where: { name } });
};

export const moveProductsToCategory = (fromCategoryId, toCategoryId) => {
  return prisma.product.updateMany({
    where: { categoryId: fromCategoryId },
    data: { categoryId: toCategoryId },
  });
};

export const findByIdWithProducts = (id) => {
  return prisma.category.findUnique({
    where: { id },
    include: {
      products: {
        where: { status: 'APPROVED' },
      },
    },
  });
};
