import prisma from '../data-source.js';
import { DEFAULT_CATEGORY_NAME } from '../constants/category.js';
import { PRODUCT_STATUS } from '../constants/status.js';

// 상품 생성
export const createProductRepo = async (data, ownerId) => {
  if (!ownerId) {
    throw new Error('상품 소유자 ID가 필요합니다.');
  }

  const { categoryId, ...restData } = data;

  return await prisma.product.create({
    data: {
      ...restData,
      ownerId,
      categoryId,
    },
  });
};

// 승인된 상품 목록조회 // 페이징 + 카테고리 필터
export const getAllProductsRepo = async ({
  skip = 0,
  take = 10,
  categoryId,
}) => {
  const where = {
    status: PRODUCT_STATUS.APPROVED,
    deletedAt: null,
    ...(categoryId && { categoryId }),
  };

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      skip,
      take,
      include: {
        owner: true,
        category: true,
      },
    }),
    prisma.product.count({ where }), // 총 개수 집계
  ]);

  return { products, total };
};

// 단일 상품 상세
export const getProductByIdRepo = async (id) => {
  return await prisma.product.findFirst({
    where: { id, deletedAt: null },
    include: {
      owner: true,
      category: true,
      RentalReview: true,
      statusLogs: true,
    },
  });
};

// 상품 ID로 soft delete 포함 단일 상품 조회 (리뷰 생성 등에서 사용)
export const findProductByIdRepo = async (id) => {
  return await prisma.product.findUnique({ where: { id } });
};

// 특정 유저가 등록한 모든 상품
export const getProductsByUserRepo = async (ownerId) => {
  return await prisma.product.findMany({
    where: { ownerId, deletedAt: null },
    include: {
      category: true,
    },
  });
};

export const findCategoryById = (id) => {
  return prisma.category.findUnique({ where: { id } });
};

export const findEtcCategoryId = async () => {
  const category = await prisma.category.findFirst({
    where: { name: DEFAULT_CATEGORY_NAME },
  });
  return category.id;
};

export const updateProductRepo = async (id, productData) => {
  const product = await getProductByIdRepo(id);
  if (!product) throw new Error('상품을 찾을 수 없습니다.');

  return await prisma.product.update({
    where: { id },
    data: productData,
    include: {
      owner: true,
      category: true,
    },
  });
};

export const deleteProductRepo = async (id) => {
  const product = await getProductByIdRepo(id);
  if (!product) throw new Error('상품을 찾을 수 없습니다.');

  return await prisma.product.update({
    where: { id },
    data: {
      deletedAt: new Date(),
    },
  });
};

export const findWaitingProductsRepo = async () => {
  return await prisma.product.findMany({
    where: {
      status: PRODUCT_STATUS.PENDING,
      deletedAt: null,
    },
    include: {
      category: true,
      owner: {
        select: {
          id: true,
          name: true,
          phone: true,
        },
      },
      aiPriceEstimation: {
        take: 1,
        orderBy: { createdAt: 'desc' },
      },
    },
    orderBy: { createdAt: 'desc' },
  });
};

export const updateProductStatusRepo = async (id, status) => {
  return await prisma.product.update({
    where: { id },
    data: { status },
    include: {
      owner: true,
      category: true,
    },
  });
};

export const findDuplicateProductRepo = async (
  title,
  description,
  price,
  ownerId,
) => {
  return await prisma.product.findFirst({
    where: {
      title,
      description,
      price: Number(price),
      ownerId,
    },
  });
};

export const findProductsForStorageFeeRepo = async (days) => {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  return await prisma.product.findMany({
    where: {
      status: PRODUCT_STATUS.APPROVED,
      deletedAt: null,
      OR: [
        {
          lastRentalCompletedAt: null,
          approvedAt: { lt: startDate },
        },
        {
          lastRentalCompletedAt: { lt: startDate },
        },
      ],
      // 최근 N일 이내에 보관료가 부과된 기록이 없는 상품만 조회
      PaymentLog: {
        none: {
          paymentType: 'STORAGE_FEE',
          createdAt: {
            gte: startDate,
          },
        },
      },
    },
    include: {
      owner: {
        select: {
          id: true,
          name: true,
          phone: true,
        },
      },
    },
  });
};
