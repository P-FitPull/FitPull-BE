import express from 'express';
import { authenticate } from '../middlewares/auth.js';
import { adminOnly } from '../middlewares/adminOnly.js';
import {
  requestAiPriceEstimationController,
  summarizeReviewsController,
  recommendProductsController,
  getRecentPriceEstimationsController,
} from '../controllers/ai.controller.js';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: AI
 *   description: AI 기능 관련 API
 */
/**
 * @swagger
 * /api/ai/price-estimation/{productId}:
 *   post:
 *     summary: 상품 AI 적정가 분석 시작 (관리자 전용)
 *     tags: [AI]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: string
 *         description: 상품 ID
 *     responses:
 *       200:
 *         description: AI 적정가 분석 시작 응답
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                   example: "상품 추정 가격 분석이 진행중입니다."
 *                 data:
 *                   type: object
 *                   properties:
 *                     message:
 *                       type: string
 *                       example: "상품 추정 가격 분석이 진행중입니다."
 *                     productId:
 *                       type: string
 *                     status:
 *                       type: string
 *                       example: "processing"
 *       400:
 *         description: 잘못된 요청(상품 상태 등)
 *       404:
 *         description: 상품 없음
 */
/**
 * @swagger
 * /api/ai/summary/{productId}:
 *   post:
 *     summary: 상품 리뷰 요약
 *     tags: [AI]
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: string
 *         description: 상품 ID
 *     responses:
 *       200:
 *         description: 리뷰 요약 결과 반환
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
 *                     summary:
 *                       type: string
 *       404:
 *         description: 상품 또는 리뷰 없음
 */

/**
 * @swagger
 * /api/ai/recommend:
 *   post:
 *     summary: 상품 추천
 *     tags: [AI]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - prompt
 *             properties:
 *               prompt:
 *                 type: string
 *                 description: 추천 키워드 또는 요청
 *     responses:
 *       200:
 *         description: 추천 상품 목록 및 추천 사유 반환
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
 *                     recommendedProductIds:
 *                       type: array
 *                       items:
 *                         type: string
 *                     reason:
 *                       type: string
 *       400:
 *         description: 잘못된 입력(프롬프트 누락 등)
 *       404:
 *         description: 추천할 상품 없음
 */

/**
 * @swagger
 * /api/ai/price-estimation/history:
 *   get:
 *     summary: 최근 AI 가격 추정 목록 조회
 *     tags: [AI]
 *     parameters:
 *       - in: query
 *         name: take
 *         schema:
 *           type: integer
 *         description: 조회할 개수
 *         example: 20
 *       - in: query
 *         name: skip
 *         schema:
 *           type: integer
 *         description: 건너뛸 개수
 *         example: 0
 *     responses:
 *       200:
 *         description: 최근 AI 가격 추정 목록 반환
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
 *                     estimations:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                           productId:
 *                             type: string
 *                           productTitle:
 *                             type: string
 *                           estimatedPrice:
 *                             type: integer
 *                           estimatedDailyRentalPrice:
 *                             type: integer
 *                           isValid:
 *                             type: boolean
 *                           reason:
 *                             type: string
 *                           sources:
 *                             type: object
 *                             properties:
 *                               쿠팡:
 *                                 type: integer
 *                               당근마켓:
 *                                 type: integer
 *                               중고나라:
 *                                 type: integer
 *                           createdAt:
 *                             type: string
 *                             format: date-time
 */
// 적정가 분석
router.post(
  '/price-estimation/:productId',
  authenticate,
  adminOnly,
  requestAiPriceEstimationController,
);

// 리뷰 요약
router.post('/summary/:productId', summarizeReviewsController);

// 상품 추천
router.post('/recommend', recommendProductsController);

// 최근 AI 가격 추정 목록 조회
router.get('/price-estimation/history', getRecentPriceEstimationsController);

export default router;
