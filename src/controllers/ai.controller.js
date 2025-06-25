import {
  requestAiPriceEstimation,
  summarizeReviews,
  recommendProducts,
} from '../services/ai.service.js';
import { success } from '../utils/responseHandler.js';
import { AI_MESSAGES } from '../constants/messages.js';

export const requestAiPriceEstimationController = async (req, res, next) => {
  try {
    const { productId } = req.params;
    const adminUser = req.user;

    const result = await requestAiPriceEstimation({ productId, adminUser });

    return success(res, AI_MESSAGES.PRICE_ESTIMATION_SUCCESS, result);
  } catch (err) {
    next(err);
  }
};

export const summarizeReviewsController = async (req, res, next) => {
  try {
    const { productId } = req.params;
    const result = await summarizeReviews(productId);
    return success(res, AI_MESSAGES.REVIEW_SUMMARY_SUCCESS, result);
  } catch (err) {
    next(err);
  }
};

export const recommendProductsController = async (req, res, next) => {
  try {
    const { prompt } = req.body;
    const userId = req.user?.id ?? null;
    const result = await recommendProducts({ prompt, userId });
    return success(res, AI_MESSAGES.PRODUCT_RECOMMENDATION_SUCCESS, result);
  } catch (err) {
    next(err);
  }
};
