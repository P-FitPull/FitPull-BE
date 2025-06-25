import prisma from '../data-source.js';

export const createReviewRepo = async (data) => {
  return await prisma.rentalReview.create({ data });
};

export const getReviewByIdRepo = async (id) => {
  return await prisma.rentalReview.findUnique({ where: { id } });
};

// 상품별 리뷰 목록 조회 user는 네임만 공개되는데 이것도 mask 처리예정
export const getReviewsByProductIdRepo = async (productId) => {
  return await prisma.rentalReview.findMany({
    where: { productId, deletedAt: null },
    orderBy: { createdAt: 'desc' },
    include: { user: { select: { name: true } } },
  });
};

// 하나의 대여완료에 하나의 리뷰만 가능함
export const checkOneRentalOneReviewRepo = async (
  userId,
  completedRentalId,
) => {
  return await prisma.rentalReview.findFirst({
    where: { userId, completedRentalId, deletedAt: null },
  });
};

// 본인 대여건인지 확인
export const getCompletedRentalByUserRepo = async (
  userId,
  completedRentalId,
) => {
  return await prisma.completedRental.findUnique({
    where: { id: completedRentalId, userId, deletedAt: null },
  });
};

export const updateReviewRepo = async (id, data) => {
  return await prisma.rentalReview.update({
    where: { id },
    data,
  });
};

export const deleteReviewRepo = async (id) => {
  return await prisma.rentalReview.update({
    where: { id },
    data: { deletedAt: new Date() },
  });
};
