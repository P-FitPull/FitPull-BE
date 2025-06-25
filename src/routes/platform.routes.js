import express from 'express';
import {
  getPlatformBalanceController,
  getPlatformSummaryController,
  getPlatformLogsController,
  addPlatformDepositController,
} from '../controllers/platform.controller.js';
import { authenticate } from '../middlewares/auth.js';
import { adminOnly } from '../middlewares/adminOnly.js';

const router = express.Router();

/**
 * @swagger
 * /api/admin/platform/balance:
 *   get:
 *     summary: 플랫폼(회사) 잔고 조회
 *     tags: [Platform]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 플랫폼 잔고 조회 성공
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
 *                   example: "플랫폼 잔고 조회 성공"
 *                 data:
 *                   type: object
 *                   properties:
 *                     balance:
 *                       type: number
 *                       example: 1000000
 */
/**
 * @swagger
 * /api/admin/platform/summary:
 *   get:
 *     summary: 플랫폼(회사) 자금 요약(총수익, 총지출, 현재잔고) 조회
 *     tags: [Platform]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 플랫폼 자금 요약 조회 성공
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
 *                   example: "플랫폼 자금 요약 조회 성공"
 *                 data:
 *                   type: object
 *                   properties:
 *                     totalIncome:
 *                       type: number
 *                       example: 1000000
 *                     totalOutcome:
 *                       type: number
 *                       example: 200000
 *                     totalOwnerPayout:
 *                       type: number
 *                       example: 500000
 *                     totalRefund:
 *                       type: number
 *                       example: 10000
 *                     balance:
 *                       type: number
 *                       example: 800000
 */
/**
 * @swagger
 * /api/admin/platform/logs:
 *   get:
 *     summary: 플랫폼(회사) 전체 자금 로그 조회
 *     tags: [Platform]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [INCOME, OUTCOME, OWNER_PAYOUT, REFUND, ETC]
 *         description: 로그 타입 필터(선택)
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
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date-time
 *         description: 시작일(YYYY-MM-DD)
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date-time
 *         description: 종료일(YYYY-MM-DD)
 *     responses:
 *       200:
 *         description: 플랫폼 자금 로그 조회 성공
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
 *                   example: "플랫폼 자금 로그 조회 성공"
 *                 data:
 *                   type: object
 *                   properties:
 *                     logs:
 *                       type: array
 *                       items:
 *                         type: object
 *                     total:
 *                       type: number
 *                       example: 42
 */
/**
 * @swagger
 * /api/admin/platform/deposit:
 *   post:
 *     summary: 플랫폼(회사) 잔고 입금(증가)
 *     tags: [Platform]
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
 *                 example: 1000000
 *                 description: 입금할 금액
 *               memo:
 *                 type: string
 *                 example: "초기 자본금"
 *                 description: 입금 사유(선택)
 *     responses:
 *       200:
 *         description: 플랫폼 잔고 입금 성공
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
 *                   example: "플랫폼 잔고 입금 성공"
 *                 data:
 *                   type: object
 *                   properties:
 *                     balance:
 *                       type: number
 *                       example: 1000000
 *                     log:
 *                       type: object
 *                       description: 생성된 PlatformPaymentLog
 */

// 플랫폼 잔고 조회
router.get('/balance', authenticate, adminOnly, getPlatformBalanceController);

// 플랫폼 자금 요약 조회
router.get('/summary', authenticate, adminOnly, getPlatformSummaryController);

// 플랫폼 전체 자금 로그 조회
router.get('/logs', authenticate, adminOnly, getPlatformLogsController);

// 플랫폼 입금
router.post('/deposit', authenticate, adminOnly, addPlatformDepositController);

export default router;
