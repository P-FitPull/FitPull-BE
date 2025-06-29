import prisma from '../data-source.js';
import CustomError from '../utils/customError.js';
import { PACKAGE_MESSAGES } from '../constants/messages.js';
import {
  getPackageByIdRepo,
  getPackagesRepo,
  updatePackageRepo,
  deletePackageRepo,
} from '../repositories/package.repository.js';

export const createPackage = async ({
  title,
  description,
  productIds,
  createdBy,
  isFeatured = false,
  discountRate,
}) => {
  if (!title || !Array.isArray(productIds) || productIds.length === 0) {
    throw new CustomError(
      400,
      'INVALID_REQUEST',
      PACKAGE_MESSAGES.PACKAGE_TITLE_AND_PRODUCTS_REQUIRED,
    );
  }

  return await prisma.$transaction(async (tx) => {
    // 1. 패키지 생성
    const pkg = await tx.package.create({
      data: {
        title,
        description,
        createdBy,
        isFeatured,
        discountRate,
      },
    });

    // 2. 패키지 상품목록 생성
    const items = productIds.map((productId) => ({
      packageId: pkg.id,
      productId,
    }));
    await tx.packageItem.createMany({ data: items });

    // 3. 패키지 + 상품목록 반환
    const result = await tx.package.findUnique({
      where: { id: pkg.id },
      include: { items: { include: { product: true } } },
    });
    return result;
  });
};

export const getPackage = async (id) => {
  const pkg = await getPackageByIdRepo(id);
  if (!pkg)
    throw new CustomError(404, 'NOT_FOUND', PACKAGE_MESSAGES.PACKAGE_NOT_FOUND);
  return pkg;
};

export const getPackages = async (filter = {}) => {
  return await getPackagesRepo(filter);
};

export const updatePackage = async (id, data) => {
  const pkg = await updatePackageRepo(id, data);
  return pkg;
};

export const deletePackage = async (id) => {
  return await deletePackageRepo(id);
};
