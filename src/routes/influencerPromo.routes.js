import express from 'express';
import { adminOnly } from '../middlewares/adminOnly.js';
import { authenticate } from '../middlewares/auth.js';
import { s3ImageUpload } from '../middlewares/s3ImageUpload.js';
import {
  findAllInfluencerPromosController,
  findInfluencerPromoDetailController,
  createInfluencerPromoController,
  updateInfluencerPromoController,
  deleteInfluencerPromoController,
} from '../controllers/influencerPromo.controller.js';

const router = express.Router();

// 홈화면or리스트
router.get('/', findAllInfluencerPromosController);

// 상세보기
router.get('/:id', findInfluencerPromoDetailController);

// admin 등록
router.post(
  '/',
  authenticate,
  adminOnly,
  s3ImageUpload,
  createInfluencerPromoController,
);

// admin 수정
router.patch(
  '/:id',
  authenticate,
  adminOnly,
  s3ImageUpload,
  updateInfluencerPromoController,
);

// admin 삭제
router.delete('/:id', authenticate, adminOnly, deleteInfluencerPromoController);

export default router;
