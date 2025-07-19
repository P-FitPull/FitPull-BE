import prisma from '../data-source.js';

export const saveAiPriceEstimation = async (data) => {
  return await prisma.aiPriceEstimation.create({ data });
};

export const getRecentAiPriceEstimations = async ({ take = 20, skip = 0 }) => {
  return await prisma.aiPriceEstimation.findMany({
    take,
    skip,
    orderBy: {
      createdAt: 'desc',
    },
    include: {
      product: {
        select: {
          id: true,
          title: true,
        },
      },
    },
  });
};

export const saveAiProductRecommendation = async (data) => {
  return await prisma.aiProductRecommendation.create({ data });
};
