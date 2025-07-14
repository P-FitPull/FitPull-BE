import express from 'express';
import { authenticate } from '../middlewares/auth.js';
import { adminOnly } from '../middlewares/adminOnly.js';
import {
  createPackageCompletedRentalController,
  getMyPackageCompletedRentalsController,
  getAllPackageCompletedRentalsController,
} from '../controllers/packageCompletedRental.controller.js';

const router = express.Router();

// 패키지 대여 완료 생성
router.post(
  '/:packageRentalRequestId',
  authenticate,
  adminOnly,
  createPackageCompletedRentalController,
);

// 전체 패키지 대여완료 조회 (어드민)
router.get(
  '/',
  authenticate,
  adminOnly,
  getAllPackageCompletedRentalsController,
);

// 내 패키지 대여완료 조회 (유저)
router.get('/my', authenticate, getMyPackageCompletedRentalsController);

export default router;
