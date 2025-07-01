import express from 'express';
import {
  createPackageController,
  getPackageByIdController,
  getAllPackagesController,
  updatePackageController,
  deletePackageController,
} from '../controllers/package.controller.js';
import { authenticate } from '../middlewares/auth.js';
import { adminOnly } from '../middlewares/adminOnly.js';

const router = express.Router();

// 패키지 생성
router.post('/', authenticate, adminOnly, createPackageController);
// 패키지 목록 조회
router.get('/', getAllPackagesController);
// 패키지 단일 조회
router.get('/:id', getPackageByIdController);
// 패키지 수정
router.patch('/:id', authenticate, adminOnly, updatePackageController);
// 패키지 삭제
router.delete('/:id', authenticate, adminOnly, deletePackageController);

export default router;
