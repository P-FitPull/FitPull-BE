import {
  findAllInfluencerPromos,
  findInfluencerPromoDetail,
  createInfluencerPromo,
  updateInfluencerPromo,
  deleteInfluencerPromo,
  findFeaturedHomeInfluencerPromo,
  setFeaturedHomeInfluencerPromo,
} from '../services/influencerPromo.service.js';
import { success } from '../utils/responseHandler.js';
import { INFLUENCER_PROMO_MESSAGES } from '../constants/messages.js';

export const findAllInfluencerPromosController = async (req, res, next) => {
  try {
    const promos = await findAllInfluencerPromos();
    if (!promos || promos.length === 0) {
      return success(res, INFLUENCER_PROMO_MESSAGES.EMPTY_LIST, { promos: [] });
    }
    return success(res, INFLUENCER_PROMO_MESSAGES.GET_ALL_SUCCESS, { promos });
  } catch (err) {
    next(err);
  }
};

export const findInfluencerPromoDetailController = async (req, res, next) => {
  try {
    const { id } = req.params;
    const promo = await findInfluencerPromoDetail(id);
    return success(res, INFLUENCER_PROMO_MESSAGES.GET_DETAIL_SUCCESS, {
      promo,
    });
  } catch (err) {
    next(err);
  }
};

export const createInfluencerPromoController = async (req, res, next) => {
  try {
    const promo = await createInfluencerPromo(req.body);
    return success(res, INFLUENCER_PROMO_MESSAGES.CREATE_SUCCESS, { promo });
  } catch (err) {
    next(err);
  }
};

export const updateInfluencerPromoController = async (req, res, next) => {
  try {
    const { id } = req.params;
    const promo = await updateInfluencerPromo(id, req.body, req.user.id);
    return success(res, INFLUENCER_PROMO_MESSAGES.UPDATE_SUCCESS, { promo });
  } catch (err) {
    next(err);
  }
};

export const deleteInfluencerPromoController = async (req, res, next) => {
  try {
    const { id } = req.params;
    await deleteInfluencerPromo(id, req.user.id);
    return success(res, INFLUENCER_PROMO_MESSAGES.DELETE_SUCCESS);
  } catch (err) {
    next(err);
  }
};

export const findFeaturedHomeInfluencerPromoController = async (
  req,
  res,
  next,
) => {
  try {
    const promo = await findFeaturedHomeInfluencerPromo();
    return success(res, INFLUENCER_PROMO_MESSAGES.GET_FEATURED_HOME_SUCCESS, {
      promo,
    });
  } catch (err) {
    next(err);
  }
};

export const setFeaturedHomeInfluencerPromoController = async (
  req,
  res,
  next,
) => {
  try {
    const { id } = req.params;
    const updated = await setFeaturedHomeInfluencerPromo(id);
    return success(res, INFLUENCER_PROMO_MESSAGES.SET_FEATURED_HOME_SUCCESS, {
      promo: updated,
    });
  } catch (err) {
    console.log(err);
    next(err);
  }
};
