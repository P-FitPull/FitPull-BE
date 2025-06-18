import express from 'express';
import { purchaseProductController } from '../controllers/purchase.controller.js';
import { authenticate } from '../middlewares/auth.js';
import requireVerifiedPhone from '../middlewares/requireVerifiedPhone.js';

const router = express.Router();

router.post(
  '/products/:id/purchase',
  authenticate,
  requireVerifiedPhone,
  purchaseProductController,
);

export default router;
