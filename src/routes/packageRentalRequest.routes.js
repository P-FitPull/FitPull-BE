import express from 'express';
import {
  createPackageRentalRequestController,
  getMyPackageRentalRequestsController,
  getPackageRentalRequestByIdController,
} from '../controllers/packageRentalRequest.controller.js';
import { authenticate } from '../middlewares/auth.js';

const router = express.Router();

// 패키지 대여 요청 생성
router.post('/', authenticate, createPackageRentalRequestController);
// 내 패키지 대여 요청 목록
router.get('/my', authenticate, getMyPackageRentalRequestsController);
// 패키지 대여 요청 상세
router.get('/:id', authenticate, getPackageRentalRequestByIdController);

export default router;
