import {
  findAllInfluencerPromosRepo,
  findInfluencerPromoDetailRepo,
  createInfluencerPromoRepo,
  updateInfluencerPromoRepo,
  deleteInfluencerPromoRepo,
  findFeaturedHomeInfluencerPromoRepo,
} from '../repositories/influencerPromo.repository.js';

export const findAllInfluencerPromos = async () => {
  return await findAllInfluencerPromosRepo();
};

export const findInfluencerPromoDetail = async (id) => {
  return await findInfluencerPromoDetailRepo(id);
};

export const createInfluencerPromo = async (data) => {
  return await createInfluencerPromoRepo(data);
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
