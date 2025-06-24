import {
  findAllInfluencerPromos,
  findInfluencerPromoDetail,
  createInfluencerPromo,
  updateInfluencerPromo,
  deleteInfluencerPromo,
  findFeaturedHomeInfluencerPromo,
} from '../services/influencerPromo.service.js';

export const findAllInfluencerPromosController = async (req, res, next) => {
  try {
    const promos = await findAllInfluencerPromos();
    res.json(promos);
  } catch (err) {
    next(err);
  }
};

export const findInfluencerPromoDetailController = async (req, res, next) => {
  try {
    const { id } = req.params;
    const promo = await findInfluencerPromoDetail(id);
    res.json(promo);
  } catch (err) {
    next(err);
  }
};

export const createInfluencerPromoController = async (req, res, next) => {
  try {
    const promo = await createInfluencerPromo(req.body);
    res.status(201).json(promo);
  } catch (err) {
    next(err);
  }
};

export const updateInfluencerPromoController = async (req, res, next) => {
  try {
    const { id } = req.params;
    const promo = await updateInfluencerPromo(id, req.body);
    res.json(promo);
  } catch (err) {
    next(err);
  }
};

export const deleteInfluencerPromoController = async (req, res, next) => {
  try {
    const { id } = req.params;
    await deleteInfluencerPromo(id);
    res.status(204).send();
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
    res.json(promo);
  } catch (err) {
    next(err);
  }
};
