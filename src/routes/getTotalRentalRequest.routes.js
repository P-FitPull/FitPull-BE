import express from 'express';
import { getTotalRentalRequestsByUserController } from '../controllers/getTotalRentalRequest.controller.js';
import { authenticate } from '../middlewares/auth.js';

const router = express.Router();

// 유저의 통합 대여 요청 조회
router.get('/my', authenticate, getTotalRentalRequestsByUserController);

export default router;
