import express from 'express';
import {
  getTotalRentalRequestsByUserController,
  getTotalRentalRequestsForAdminController,
} from '../controllers/getTotalRentalRequest.controller.js';
import { authenticate } from '../middlewares/auth.js';
import { adminOnly } from '../middlewares/adminOnly.js';

const router = express.Router();

// 유저의 통합 대여 요청 조회
router.get('/my', authenticate, getTotalRentalRequestsByUserController);

// 어드민 전체/상태별 대여요청 쿼리로 조회
router.get(
  '/',
  authenticate,
  adminOnly,
  getTotalRentalRequestsForAdminController,
);

export default router;
