import express from 'express';
import { purchaseProductController } from '../controllers/purchase.controller.js';
import { authenticate } from '../middlewares/auth.js';
import requireVerifiedPhone from '../middlewares/requireVerifiedPhone.js';

const router = express.Router();

router.post(
  '/:productId',
  authenticate,
  requireVerifiedPhone,
  purchaseProductController,
);
// 추후 구매 취소, 구매 내역 등도 여기에 추가

export default router;
