import prisma from '../data-source.js';

// 로그 생성
export const createStatusLogRepo = async (data) => {
  return await prisma.productStatusLog.create({ data });
};

// 로그 조회 (상품 기준)
export const findLogsByProductRepo = async (productId, take = 5) => {
  return await prisma.productStatusLog.findMany({
    where: { productId },
    orderBy: { createdAt: 'desc' },
    take,
  });
};

// 로그 수정
export const updateStatusLogRepo = async (id, data) => {
  return await prisma.productStatusLog.update({
    where: { id },
    data,
  });
};

// 로그 삭제
export const deleteStatusLogRepo = async (id) => {
  return await prisma.productStatusLog.delete({
    where: { id },
  });
};
