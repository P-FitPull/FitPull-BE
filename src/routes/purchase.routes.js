import express from 'express';
import {
  purchaseProductController,
  cancelPurchaseController,
} from '../controllers/purchase.controller.js';
import { authenticate } from '../middlewares/auth.js';
import requireVerifiedPhone from '../middlewares/requireVerifiedPhone.js';

const router = express.Router();

router.post(
  '/products/:id/purchase',
  authenticate,
  requireVerifiedPhone,
  purchaseProductController,
);

router.post(
  '/products/:id/purchase/cancel',
  authenticate,
  requireVerifiedPhone,
  cancelPurchaseController,
);

export default router;
