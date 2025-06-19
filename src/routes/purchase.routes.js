import express from 'express';
import {
  purchaseProductController,
  cancelPurchaseController,
} from '../controllers/purchase.controller.js';
import { authenticate } from '../middlewares/auth.js';
import requireVerifiedPhone from '../middlewares/requireVerifiedPhone.js';

/**
 * @swagger
 * tags:
 *   name: Purchase
 *   description: 상품 구매 관련 API
 */

/**
 * @swagger
 * /api/products/{id}/purchase:
 *   post:
 *     summary: 상품 구매하기 (대여금액 할인 적용)
 *     tags: [Purchase]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: 상품 ID
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: 구매 성공
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
 *                   example: "상품 구매가 완료되었습니다."
 *                 data:
 *                   type: object
 *                   properties:
 *                     productId:
 *                       type: string
 *                     title:
 *                       type: string
 *                     purchasePrice:
 *                       type: number
 *                     discount:
 *                       type: number
 *                     finalPrice:
 *                       type: number
 *                     status:
 *                       type: string
 *                       enum: [SOLD, PURCHASE_RESERVED]
 *                     sellerProfit:
 *                       type: number
 *                     commission:
 *                       type: number
 *       400:
 *         description: 잘못된 요청 (구매 불가, 잔액 부족 등)
 *       401:
 *         description: 인증 필요
 *       403:
 *         description: 권한 없음 (본인 상품 구매 시도 등)
 *       404:
 *         description: 상품 없음
 */

/**
 * @swagger
 * /api/products/{id}/purchase/cancel:
 *   post:
 *     summary: 상품 구매 취소 (예약 구매 상태일 때만 가능)
 *     tags: [Purchase]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: 상품 ID
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: 구매 취소 성공
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
 *                   example: "상품 구매가 취소되었습니다."
 *                 data:
 *                   type: object
 *                   properties:
 *                     productId:
 *                       type: string
 *                     title:
 *                       type: string
 *                     status:
 *                       type: string
 *                       example: "APPROVED"
 *                     refundAmount:
 *                       type: number
 *       400:
 *         description: 잘못된 요청 (구매 예약 상태가 아님)
 *       401:
 *         description: 인증 필요
 *       403:
 *         description: 권한 없음 (구매 예약자가 아님)
 *       404:
 *         description: 상품 또는 결제 기록 없음
 */

const router = express.Router();

router.post(
  '/products/:id/purchase',
  authenticate,
  requireVerifiedPhone,
  purchaseProductController,
);

router.post(
  '/products/:id/purchase/cancel',
  authenticate,
  requireVerifiedPhone,
  cancelPurchaseController,
);

export default router;
