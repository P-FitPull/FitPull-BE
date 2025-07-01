import prisma from '../data-source.js';
import CustomError from '../utils/customError.js';
import { PACKAGE_MESSAGES } from '../constants/messages.js';
import {
  getPackageByIdRepo,
  getAllPackagesRepo,
  updatePackageRepo,
  deletePackageRepo,
  getProductsByIdsRepo,
  deletePackageItemsByPackageIdRepo,
  createPackageItemsRepo,
} from '../repositories/package.repository.js';

export const createPackage = async ({
  title,
  description,
  productIds,
  createdBy,
  isFeatured = false,
}) => {
  if (!title || !Array.isArray(productIds)) {
    throw new CustomError(
      400,
      'PACKAGE_TITLE_AND_PRODUCTS_REQUIRED',
      PACKAGE_MESSAGES.PACKAGE_TITLE_AND_PRODUCTS_REQUIRED,
    );
  }
  if (productIds.length < 2) {
    throw new CustomError(
      400,
      'PACKAGE_MIN_PRODUCTS_REQUIRED',
      PACKAGE_MESSAGES.PACKAGE_MIN_PRODUCTS_REQUIRED,
    );
  }

  // 상품 존재 여부 사전 검증
  const products = await getProductsByIdsRepo(productIds);
  if (products.length !== productIds.length) {
    throw new CustomError(
      400,
      'PRODUCT_NOT_FOUND',
      PACKAGE_MESSAGES.PRODUCT_NOT_FOUND,
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

export const getPackageById = async (id) => {
  if (!id || typeof id !== 'string') {
    throw new CustomError(400, 'INVALID_ID', PACKAGE_MESSAGES.INVALID_ID);
  }
  const pkg = await getPackageByIdRepo(id);
  if (!pkg) {
    throw new CustomError(
      404,
      'PACKAGE_NOT_FOUND',
      PACKAGE_MESSAGES.PACKAGE_NOT_FOUND,
    );
  }
  return pkg;
};

export const getAllPackages = async (filter = {}) => {
  return await getAllPackagesRepo(filter);
};

export const updatePackage = async (id, data, userId) => {
  // ID 유효성 검사
  if (!id || typeof id !== 'string') {
    throw new CustomError(400, 'INVALID_ID', PACKAGE_MESSAGES.INVALID_ID);
  }

  // 패키지 존재 여부 확인
  const existing = await getPackageByIdRepo(id);
  if (!existing) {
    throw new CustomError(
      404,
      'PACKAGE_NOT_FOUND',
      PACKAGE_MESSAGES.PACKAGE_NOT_FOUND,
    );
  }

  // 등록자만 수정 가능
  if (existing.createdBy !== userId) {
    throw new CustomError(403, 'NO_PERMISSION', PACKAGE_MESSAGES.NO_PERMISSION);
  }

  // 상품목록 변경 시 상품 존재 여부 검증
  if (data.productIds) {
    if (!Array.isArray(data.productIds)) {
      throw new CustomError(
        400,
        'PRODUCTS_REQUIRED',
        PACKAGE_MESSAGES.PACKAGE_TITLE_AND_PRODUCTS_REQUIRED,
      );
    }
    if (data.productIds.length < 2) {
      throw new CustomError(
        400,
        'PACKAGE_MIN_PRODUCTS_REQUIRED',
        PACKAGE_MESSAGES.PACKAGE_MIN_PRODUCTS_REQUIRED,
      );
    }
    const products = await getProductsByIdsRepo(data.productIds);
    if (products.length !== data.productIds.length) {
      throw new CustomError(
        400,
        'PRODUCT_NOT_FOUND',
        PACKAGE_MESSAGES.PRODUCT_NOT_FOUND,
      );
    }
    // 기존 packageItem 모두 삭제
    await deletePackageItemsByPackageIdRepo(id);
    // 새 productIds로 packageItem 생성
    const items = data.productIds.map((productId) => ({
      packageId: id,
      productId,
    }));
    await createPackageItemsRepo(items);
    // productIds는 패키지 테이블에 없으므로 제거
    delete data.productIds;
  }
  //패키지 정보 업데이트
  const pkg = await updatePackageRepo(id, data);

  return pkg;
};

export const deletePackage = async (id) => {
  // ID 유효성 검사
  if (!id || typeof id !== 'string') {
    throw new CustomError(400, 'INVALID_ID', PACKAGE_MESSAGES.INVALID_ID);
  }

  // 패키지 존재 여부 확인
  const existing = await getPackageByIdRepo(id);
  if (!existing) {
    throw new CustomError(
      404,
      'PACKAGE_NOT_FOUND',
      PACKAGE_MESSAGES.PACKAGE_NOT_FOUND,
    );
  }

  // 패키지-상품 관계 먼저 삭제
  await deletePackageItemsByPackageIdRepo(id);

  return await deletePackageRepo(id);
};
