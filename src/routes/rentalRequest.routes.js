import express from 'express';
import {
  getMyRentalRequestsController,
  getPendingRequestsController,
  approveRentalRequestController,
  rejectRentalRequestController,
  cancelRentalRequestController,
  createRentalRequestWithPaymentController,
} from '../controllers/rentalRequest.controller.js';
import { authenticate } from '../middlewares/auth.js';
import { adminOnly } from '../middlewares/adminOnly.js';
import requireVerifiedPhone from '../middlewares/requireVerifiedPhone.js';

/**
 * @swagger
 * tags:
 *   name: RentalRequest
 *   description: 상품 대여 요청 관련 API
 */

/**
 * @swagger
 * /api/rental-requests:
 *   post:
 *     summary: 대여 요청 생성 (휴대폰 인증 필요)
 *     tags: [RentalRequest]
 *     security:
 *       - bearerAuth: []
 *     description: 휴대폰 인증이 완료된 사용자만 대여 요청을 할 수 있습니다.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - productId
 *               - startDate
 *               - endDate
 *               - howToReceive
 *             properties:
 *               productId:
 *                 type: string
 *                 example: "productId123"
 *               startDate:
 *                 type: string
 *                 format: date
 *                 example: "2024-06-01"
 *               endDate:
 *                 type: string
 *                 format: date
 *                 example: "2024-06-05"
 *               howToReceive:
 *                 type: string
 *                 example: "직접수령"
 *               memo:
 *                 type: string
 *                 example: "현관 앞에 두세요"
 *     responses:
 *       201:
 *         description: 대여 요청 생성 완료
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
 *                     rentalRequest:
 *                       type: object
 *       400:
 *         description: 잘못된 입력(날짜, 잔고부족 등)
 *       401:
 *         description: 인증 실패 또는 휴대폰 미인증
 *       404:
 *         description: 상품 또는 유저 없음
 */

/**
 * @swagger
 * /api/rental-requests/me:
 *   get:
 *     summary: 내 대여 요청 목록 조회
 *     tags: [RentalRequest]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 내 요청 목록 반환
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
 *                     requests:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                           rentalPeriod:
 *                             type: string
 *                           productTitle:
 *                             type: string
 *                           status:
 *                             type: string
 *                           howToReceive:
 *                             type: string
 *                           memo:
 *                             type: string
 *                           totalPrice:
 *                             type: number
 */

/**
 * @swagger
 * /api/rental-requests/pending:
 *   get:
 *     summary: 관리자용 대기 요청 목록 조회
 *     tags: [RentalRequest]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 대기 요청 목록 반환
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
 *                     requests:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                           rentalPeriod:
 *                             type: string
 *                           productTitle:
 *                             type: string
 *                           howToReceive:
 *                             type: string
 *                           memo:
 *                             type: string
 *                           userName:
 *                             type: string
 *                           userPhone:
 *                             type: string
 *                           status:
 *                             type: string
 *                           totalPrice:
 *                             type: number
 */

/**
 * @swagger
 * /api/rental-requests/{id}/approve:
 *   patch:
 *     summary: 대여 요청 승인
 *     tags: [RentalRequest]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: 요청 ID
 *     responses:
 *       200:
 *         description: 승인 완료
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
 *                     request:
 *                       type: object
 *       404:
 *         description: 요청 없음
 */

/**
 * @swagger
 * /api/rental-requests/{id}/reject:
 *   patch:
 *     summary: 대여 요청 거절
 *     tags: [RentalRequest]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: 요청 ID
 *     responses:
 *       200:
 *         description: 거절 완료
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
 *                     request:
 *                       type: object
 *       404:
 *         description: 요청 없음
 */

/**
 * @swagger
 * /api/rental-requests/{id}/cancel:
 *   patch:
 *     summary: 대여 요청 취소 (고객)
 *     tags: [RentalRequest]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: 요청 ID
 *     responses:
 *       200:
 *         description: 고객 요청으로 거절됨
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
 *                     request:
 *                       type: object
 *       404:
 *         description: 요청 없음
 */

const router = express.Router();

// 대여 요청
router.post(
  '/',
  authenticate,
  requireVerifiedPhone,
  createRentalRequestWithPaymentController,
);

// 본인 대여요청 목록 조회
router.get('/me', authenticate, getMyRentalRequestsController);

// 대기 요청 전체조회
router.get('/pending', authenticate, adminOnly, getPendingRequestsController);

// 대여요청수락
router.patch(
  '/:id/approve',
  authenticate,
  adminOnly,
  approveRentalRequestController,
);

// 대여요청거절
router.patch(
  '/:id/reject',
  authenticate,
  adminOnly,
  rejectRentalRequestController,
);

// 대여요청취소 (본인만)
router.patch('/:id/cancel', authenticate, cancelRentalRequestController);

export default router;
