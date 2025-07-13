import express from 'express';
import { createPackageCompletedRentalController } from '../controllers/packageCompletedRental.controller.js';
import { authenticate } from '../middlewares/auth.js';
import { adminOnly } from '../middlewares/adminOnly.js';

const router = express.Router();

// 패키지 대여 완료 생성
router.post(
  '/:packageRentalRequestId',
  authenticate,
  adminOnly,
  createPackageCompletedRentalController,
);

export default router;
