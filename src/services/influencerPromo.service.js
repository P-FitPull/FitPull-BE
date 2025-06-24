import {
  findAllInfluencerPromosRepo,
  findInfluencerPromoDetailRepo,
  createInfluencerPromoRepo,
  updateInfluencerPromoRepo,
  deleteInfluencerPromoRepo,
  findFeaturedHomeInfluencerPromoRepo,
} from '../repositories/influencerPromo.repository.js';
import { INFLUENCER_PROMO_MESSAGES } from '../constants/messages.js';
import CustomError from '../utils/customError.js';
import { getProductByIdRepo } from '../repositories/product.repository.js';
import { findUserById } from '../repositories/user.repository.js';
import { MAX_INFLUENCER_PROMO_IMAGES } from '../constants/limits.js';

export const findAllInfluencerPromos = async () => {
  return await findAllInfluencerPromosRepo();
};

export const findInfluencerPromoDetail = async (id) => {
  return await findInfluencerPromoDetailRepo(id);
};

export const createInfluencerPromo = async (data) => {
  const {
    title,
    description,
    videoUrl,
    productId,
    userId,
    snsLinks,
    imageUrls,
  } = data;

  if (!title || !videoUrl || !productId || !userId) {
    throw new CustomError(
      400,
      'MISSING_REQUIRED_FIELDS',
      INFLUENCER_PROMO_MESSAGES.MISSING_REQUIRED_FIELDS,
    );
  }

  // 상품 존재 확인
  const product = await getProductByIdRepo(productId);
  if (!product) {
    throw new CustomError(
      404,
      'PRODUCT_NOT_FOUND',
      INFLUENCER_PROMO_MESSAGES.PRODUCT_NOT_FOUND,
    );
  }

  // 상품 소유주 확인
  if (product.ownerId !== userId) {
    throw new CustomError(
      403,
      'NOT_PRODUCT_OWNER',
      INFLUENCER_PROMO_MESSAGES.NOT_PRODUCT_OWNER,
    );
  }

  // 유저 role 확인
  const user = await findUserById(userId);
  if (!user || user.role !== 'INFLUENCER') {
    throw new CustomError(
      403,
      'NOT_INFLUENCER',
      INFLUENCER_PROMO_MESSAGES.NOT_INFLUENCER,
    );
  }

  // 이미지 개수 한도 확인
  if (imageUrls && imageUrls.length > MAX_INFLUENCER_PROMO_IMAGES) {
    throw new CustomError(
      400,
      'IMAGE_LIMIT_EXCEEDED',
      INFLUENCER_PROMO_MESSAGES.IMAGE_LIMIT_EXCEEDED,
    );
  }

  // snsLinks가 문자열이면 배열로 변환
  let snsLinksArr = [];
  if (typeof snsLinks === 'string') {
    snsLinksArr = snsLinks.split(',').map((snsLink) => snsLink.trim());
  } else if (Array.isArray(snsLinks)) {
    snsLinksArr = snsLinks;
  }

  return await createInfluencerPromoRepo({
    title,
    description,
    videoUrl,
    productId,
    userId,
    snsLinks: snsLinksArr,
    imageUrls: imageUrls || [],
  });
};

export const updateInfluencerPromo = async (id, data) => {
  return await updateInfluencerPromoRepo(id, data);
};

export const deleteInfluencerPromo = async (id) => {
  return await deleteInfluencerPromoRepo(id);
};

export const findFeaturedHomeInfluencerPromo = async () => {
  return await findFeaturedHomeInfluencerPromoRepo();
};
