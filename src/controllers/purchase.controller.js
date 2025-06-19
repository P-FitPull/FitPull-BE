import {
  purchaseProduct,
  cancelPurchase,
} from '../services/purchase.service.js';
import { PRODUCT_MESSAGES } from '../constants/messages.js';
import { success } from '../utils/responseHandler.js';

export const purchaseProductController = async (req, res, next) => {
  try {
    const { id: productId } = req.params;
    const userId = req.user.id;

    const result = await purchaseProduct(productId, userId);

    return success(res, PRODUCT_MESSAGES.PURCHASE_COMPLETED, result);
  } catch (error) {
    next(error);
  }
};

export const cancelPurchaseController = async (req, res, next) => {
  try {
    const { id: productId } = req.params;
    const userId = req.user.id;

    const result = await cancelPurchase(productId, userId);

    return success(res, PRODUCT_MESSAGES.PURCHASE_CANCELED, result);
  } catch (error) {
    console.log(error);
    next(error);
  }
};
