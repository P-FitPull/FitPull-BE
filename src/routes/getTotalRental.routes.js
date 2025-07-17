import express from 'express';
import {
  getTotalRentalRequestsByUserController,
  getTotalRentalRequestsForAdminController,
} from '../controllers/getTotalRental.controller.js';
import { authenticate } from '../middlewares/auth.js';
import { adminOnly } from '../middlewares/adminOnly.js';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: TotalRentalRequest
 *   description: 단건/패키지 통합 대여요청 조회 API
 */

/**
 * @swagger
 * /api/total-rental-requests/my:
 *   get:
 *     summary: 내 통합 대여요청 목록 조회
 *     description: 로그인한 유저의 단건/패키지 대여요청을 통합 조회합니다.
 *     tags: [TotalRentalRequest]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 통합 대여요청 목록 반환
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                       type:
 *                         type: string
 *                         description: SINGLE(단건) 또는 PACKAGE(패키지)
 *                       rentalPeriod:
 *                         type: string
 *                       title:
 *                         type: string
 *                       status:
 *                         type: string
 *                       howToReceive:
 *                         type: string
 *                       memo:
 *                         type: string
 *                       totalPrice:
 *                         type: number
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *
 * /api/total-rental-requests:
 *   get:
 *     summary: (어드민) 전체/상태별 통합 대여요청 목록 조회
 *     description: 어드민이 모든 유저의 단건/패키지 대여요청을 통합 조회합니다. 쿼리 파라미터 status로 상태별 필터링 가능.
 *     tags: [TotalRentalRequest]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [PENDING, APPROVED, REJECTED, CANCELED, ON_RENTING]
 *         description: (선택) 조회할 대여요청 상태
 *     responses:
 *       200:
 *         description: 통합 대여요청 목록 반환
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     rentalRequests:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                           type:
 *                             type: string
 *                             description: SINGLE(단건) 또는 PACKAGE(패키지)
 *                           rentalPeriod:
 *                             type: string
 *                           title:
 *                             type: string
 *                           userName:
 *                             type: string
 *                           userPhone:
 *                             type: string
 *                           status:
 *                             type: string
 *                           howToReceive:
 *                             type: string
 *                           memo:
 *                             type: string
 *                           totalPrice:
 *                             type: number
 *                           createdAt:
 *                             type: string
 *                             format: date-time
 */

// 유저의 통합 대여 요청 조회
router.get('/my', authenticate, getTotalRentalRequestsByUserController);

// 어드민 전체/상태별 대여요청 통합 조회
router.get(
  '/',
  authenticate,
  adminOnly,
  getTotalRentalRequestsForAdminController,
);

export default router;
