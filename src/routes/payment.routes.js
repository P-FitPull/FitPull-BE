import express from 'express';
import {
  chargeBalanceController,
  useBalanceController,
  paymentLogsController,
} from '../controllers/payment.controller.js';
import { authenticate } from '../middlewares/auth.js';
import requireVerifiedPhone from '../middlewares/requireVerifiedPhone.js';

/**
 * @swagger
 * tags:
 *   name: Payment
 *   description: 가상 잔고 충전/차감 API
 */

/**
 * @swagger
 * /api/payments/charge:
 *   post:
 *     summary: 가상 잔고 충전
 *     tags: [Payment]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - amount
 *             properties:
 *               amount:
 *                 type: number
 *                 example: 10000
 *                 description: 충전할 금액
 *     responses:
 *       200:
 *         description: 충전 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "잔고 충전에 성공했습니다."
 *                 data:
 *                   type: object
 *                   properties:
 *                     balance:
 *                       type: number
 *                       example: 15000
 *       400:
 *         description: 잘못된 입력(음수, 0, 초과값 등)
 *       401:
 *         description: 인증 필요(JWT 토큰 누락/만료)
 *       403:
 *         description: 휴대폰 미인증
 *       404:
 *         description: 유저 없음
 */

/**
 * @swagger
 * /api/payments/use:
 *   post:
 *     summary: 가상 잔고 차감
 *     tags: [Payment]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - amount
 *             properties:
 *               amount:
 *                 type: number
 *                 example: 5000
 *                 description: 차감할 금액
 *     responses:
 *       200:
 *         description: 차감 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "잔고 차감에 성공했습니다."
 *                 data:
 *                   type: object
 *                   properties:
 *                     balance:
 *                       type: number
 *                       example: 10000
 *       400:
 *         description: 잘못된 입력(음수, 0, 초과값 등) 또는 잔고 부족
 *       401:
 *         description: 인증 필요(JWT 토큰 누락/만료)
 *       403:
 *         description: 휴대폰 미인증
 *       404:
 *         description: 유저 없음
 */

/**
 * @swagger
 * /api/payments/logs:
 *   get:
 *     summary: 유저 결제/잔고 내역 전체 조회
 *     tags: [Payment]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [RENTAL_PAYMENT, STORAGE_FEE, DAMAGE_COMPENSATION, OWNER_PAYOUT, REFUND, ETC]
 *         description: 결제/잔고 내역 타입 필터(선택)
 *       - in: query
 *         name: skip
 *         schema:
 *           type: integer
 *           default: 0
 *         description: 페이징 skip
 *       - in: query
 *         name: take
 *         schema:
 *           type: integer
 *           default: 20
 *         description: 페이징 take(한 번에 가져올 개수)
 *     responses:
 *       200:
 *         description: 거래내역 조회 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "잔고 사용되었습니다."
 *                 data:
 *                   type: object
 *                   properties:
 *                     logs:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                           amount:
 *                             type: number
 *                           paymentType:
 *                             type: string
 *                           memo:
 *                             type: string
 *                           createdAt:
 *                             type: string
 *                             format: date-time
 *                           balanceBefore:
 *                             type: number
 *                           balanceAfter:
 *                             type: number
 *                           rentalRequestId:
 *                             type: string
 *                     total:
 *                       type: number
 *                       example: 42
 *       401:
 *         description: 인증 필요(JWT 토큰 누락/만료)
 */

const router = express.Router();

// 잔고 충전
router.post(
  '/charge',
  authenticate,
  requireVerifiedPhone,
  chargeBalanceController,
);
// 잔고 차감
router.post('/use', authenticate, requireVerifiedPhone, useBalanceController);
// 결제/잔고 내역 전체 조회
router.get('/logs', authenticate, paymentLogsController);

export default router;
