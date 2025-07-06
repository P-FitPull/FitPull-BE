import express from 'express';
import {
  createPackageRentalRequestController,
  cancelPackageRentalRequestController,
  approvePackageRentalRequestController,
  rejectPackageRentalRequestByAdminController,
  getMyPackageRentalRequestsListController,
  getPendingPackageRentalRequestsController,
} from '../controllers/packageRentalRequest.controller.js';
import { authenticate } from '../middlewares/auth.js';
import { adminOnly } from '../middlewares/adminOnly.js';

const router = express.Router();

// 패키지 대여 요청 생성
router.post('/', authenticate, createPackageRentalRequestController);

// 패키지 대여 요청 취소
router.patch('/:id/cancel', authenticate, cancelPackageRentalRequestController);
// 패키지 대여 요청 승인
router.patch(
  '/:id/approve',
  authenticate,
  adminOnly,
  approvePackageRentalRequestController,
);

// 패키지 대여 요청 거절
router.patch(
  '/:id/reject',
  authenticate,
  adminOnly,
  rejectPackageRentalRequestByAdminController,
);
// 나의 패키지 대여요청 목록 (간단)
router.get('/my', authenticate, getMyPackageRentalRequestsListController);

// 대기중인 패키지 대여요청 목록 (admin 전용)
router.get(
  '/pending',
  authenticate,
  adminOnly,
  getPendingPackageRentalRequestsController,
);

export default router;
