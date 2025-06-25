import {
  findAllInfluencerPromosRepo,
  findInfluencerPromoDetailRepo,
  createInfluencerPromoRepo,
  updateInfluencerPromoRepo,
  deleteInfluencerPromoRepo,
  findAllFeaturedHomeInfluencerPromosRepo,
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
  const promo = await findInfluencerPromoDetailRepo(id);
  if (!promo || promo.deletedAt) {
    throw new CustomError(
      404,
      'NOT_FOUND',
      INFLUENCER_PROMO_MESSAGES.NOT_FOUND,
    );
  }
  return promo;
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

  if (!title) {
    throw new CustomError(
      400,
      'MISSING_TITLE',
      INFLUENCER_PROMO_MESSAGES.MISSING_TITLE,
    );
  }
  if (!videoUrl) {
    throw new CustomError(
      400,
      'MISSING_VIDEO_URL',
      INFLUENCER_PROMO_MESSAGES.MISSING_VIDEO_URL,
    );
  }
  if (!productId) {
    throw new CustomError(
      400,
      'MISSING_PRODUCT_ID',
      INFLUENCER_PROMO_MESSAGES.MISSING_PRODUCT_ID,
    );
  }
  if (!userId) {
    throw new CustomError(
      400,
      'MISSING_USER_ID',
      INFLUENCER_PROMO_MESSAGES.MISSING_USER_ID,
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

export const updateInfluencerPromo = async (id, data, userId) => {
  const promo = await findInfluencerPromoDetailRepo(id);
  if (!promo || promo.deletedAt) {
    throw new CustomError(
      404,
      'NOT_FOUND',
      INFLUENCER_PROMO_MESSAGES.NOT_FOUND,
    );
  }

  if (promo.userId !== userId) {
    throw new CustomError(
      403,
      'NO_PERMISSION',
      INFLUENCER_PROMO_MESSAGES.NO_PERMISSION,
    );
  }

  // 필드 유효성 검사
  if ('title' in data && !data.title) {
    throw new CustomError(
      400,
      'INVALID_TITLE',
      INFLUENCER_PROMO_MESSAGES.INVALID_TITLE,
    );
  }

  if ('videoUrl' in data && !data.videoUrl) {
    throw new CustomError(
      400,
      'INVALID_VIDEO_URL',
      INFLUENCER_PROMO_MESSAGES.INVALID_VIDEO_URL,
    );
  }

  if ('productId' in data) {
    const product = await getProductByIdRepo(data.productId);
    if (!product) {
      throw new CustomError(
        404,
        'PRODUCT_NOT_FOUND',
        INFLUENCER_PROMO_MESSAGES.PRODUCT_NOT_FOUND,
      );
    }
    if (product.ownerId !== userId) {
      throw new CustomError(
        403,
        'NOT_PRODUCT_OWNER',
        INFLUENCER_PROMO_MESSAGES.NOT_PRODUCT_OWNER,
      );
    }
  }

  if (data.imageUrls && data.imageUrls.length > MAX_INFLUENCER_PROMO_IMAGES) {
    throw new CustomError(
      400,
      'IMAGE_LIMIT_EXCEEDED',
      INFLUENCER_PROMO_MESSAGES.IMAGE_LIMIT_EXCEEDED,
    );
  }

  // snsLinks 정리
  if ('snsLinks' in data) {
    if (typeof data.snsLinks === 'string') {
      data.snsLinks = data.snsLinks.split(',').map((snsLink) => snsLink.trim());
    } else if (!Array.isArray(data.snsLinks)) {
      throw new CustomError(
        400,
        'INVALID_SNS_LINKS',
        INFLUENCER_PROMO_MESSAGES.INVALID_SNS_LINKS,
      );
    }
  }

  return await updateInfluencerPromoRepo(id, data);
};

export const deleteInfluencerPromo = async (id, userId) => {
  const promo = await findInfluencerPromoDetailRepo(id);
  if (!promo || promo.deletedAt) {
    throw new CustomError(
      404,
      'NOT_FOUND',
      INFLUENCER_PROMO_MESSAGES.NOT_FOUND,
    );
  }

  //본인 소유/권한 체크
  if (promo.userId !== userId) {
    throw new CustomError(
      403,
      'NO_PERMISSION',
      INFLUENCER_PROMO_MESSAGES.NO_PERMISSION,
    );
  }

  return await deleteInfluencerPromoRepo(id);
};

export const findFeaturedHomeInfluencerPromo = async () => {
  const promos = await findAllFeaturedHomeInfluencerPromosRepo();

  if (!promos || promos.length === 0) {
    throw new CustomError(
      404,
      'NOT_FOUND',
      INFLUENCER_PROMO_MESSAGES.FEATURED_HOME_NOT_FOUND,
    );
  }

  if (promos.length > 1) {
    throw new CustomError(
      409,
      'MULTIPLE_FEATURED_HOME',
      `${INFLUENCER_PROMO_MESSAGES.MULTIPLE_FEATURED_HOME} id: [${promos.map((promo) => promo.id).join(', ')}]`,
    );
  }

  return promos[0];
};

export const setFeaturedHomeInfluencerPromo = async (id) => {
  // 1. 기존에 true인 홍보물 찾아서 false로 변경
  await updateInfluencerPromoRepo(
    { isFeaturedHome: true },
    { isFeaturedHome: false },
  );
  // 2. 지정한 id의 홍보물 isFeaturedHome을 true로 변경
  const updated = await updateInfluencerPromoRepo(id, { isFeaturedHome: true });
  if (!updated) {
    throw new CustomError(
      404,
      'NOT_FOUND',
      INFLUENCER_PROMO_MESSAGES.NOT_FOUND,
    );
  }
  return updated;
};
