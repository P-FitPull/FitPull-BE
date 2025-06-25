import prisma from '../data-source.js';

export const saveAiPriceEstimation = async (data) => {
  return await prisma.aiPriceEstimation.create({ data });
};

export const saveAiProductRecommendation = async (data) => {
  return await prisma.aiProductRecommendation.create({ data });
};
