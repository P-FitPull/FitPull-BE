import prisma from '../data-source.js';

export const findAllInfluencerPromosRepo = async () => {
  return prisma.influencerPromo.findMany({
    where: { deletedAt: null },
    select: {
      id: true,
      title: true,
      imageUrls: true,
    },
    orderBy: { createdAt: 'desc' },
  });
};

export const findInfluencerPromoDetailRepo = async (id) => {
  return prisma.influencerPromo.findUnique({
    where: { id },
    include: {
      product: true,
      user: true,
    },
  });
};

export const createInfluencerPromoRepo = async (data) => {
  return prisma.influencerPromo.create({ data });
};

export const updateInfluencerPromoRepo = async (id, data) => {
  return prisma.influencerPromo.update({ where: { id }, data });
};

export const deleteInfluencerPromoRepo = async (id) => {
  return prisma.influencerPromo.update({
    where: { id },
    data: { deletedAt: new Date() },
  });
};

export const findFeaturedHomeInfluencerPromoRepo = async () => {
  return prisma.influencerPromo.findFirst({
    where: { deletedAt: null, isFeaturedHome: true },
    select: {
      id: true,
      title: true,
      videoUrl: true,
    },
  });
};

export const findInfluencerPromoByProductId = async (productId) => {
  return prisma.influencerPromo.findFirst({
    where: { productId, deletedAt: null },
  });
};
