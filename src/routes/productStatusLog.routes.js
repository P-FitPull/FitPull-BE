import express from 'express';
import {
  createStatusLogController,
  getStatusLogsController,
  updateStatusLogController,
  deleteStatusLogController,
} from '../controllers/productStatusLog.controller.js';
import { authenticate } from '../middlewares/auth.js';
import { adminOnly } from '../middlewares/adminOnly.js';
import { s3ImageUpload } from '../middlewares/s3ImageUpload.js';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: ProductStatusLog
 *   description: 상품 상태 로그 관련 API
 */

/**
 * @swagger
 * /api/products/{productId}/logs:
 *   get:
 *     summary: 상품 상태 로그 조회 (유저/관리자)
 *     tags: [ProductStatusLog]
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
 *         description: 상품 상태 로그 목록 반환
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
 *                     logs:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                           type:
 *                             type: string
 *                           notes:
 *                             type: string
 *                           photoUrls:
 *                             type: array
 *                             items:
 *                               type: string
 *                           createdAt:
 *                             type: string
 *                             format: date-time
 *       404:
 *         description: 상품 없음
 */

/**
 * @swagger
 * /api/products/{productId}/logs:
 *   post:
 *     summary: 상품 상태 로그 생성 (관리자 전용, 이미지 업로드)
 *     tags: [ProductStatusLog]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: string
 *         description: 상품 ID
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - type
 *             properties:
 *               type:
 *                 type: string
 *                 enum: [PRE_RENTAL, ON_RENTAL, DAMAGE_REPORTED, WITHDRAWN, STORAGE_FEE_NOTICE, ETC]
 *               notes:
 *                 type: string
 *               completedRentalId:
 *                 type: string
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *     responses:
 *       201:
 *         description: 상태 로그 생성 성공
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
 *                     log:
 *                       type: object
 *       400:
 *         description: 잘못된 입력(필수값 누락, 이미지 개수 초과 등)
 *       404:
 *         description: 상품 없음
 */

/**
 * @swagger
 * /api/products/{productId}/logs/{id}:
 *   patch:
 *     summary: 상품 상태 로그 수정 (관리자 전용)
 *     tags: [ProductStatusLog]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         description: 상품 ID
 *         schema:
 *           type: string
 *       - in: path
 *         name: id
 *         required: true
 *         description: 로그 ID
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               type:
 *                 type: string
 *                 enum: [PRE_RENTAL, ON_RENTAL, DAMAGE_REPORTED, WITHDRAWN, STORAGE_FEE_NOTICE, ETC]
 *               notes:
 *                 type: string
 *               completedRentalId:
 *                 type: string
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *     responses:
 *       200:
 *         description: 상태 로그 수정 성공
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
 *                     log:
 *                       type: object
 *       400:
 *         description: 잘못된 입력(필수값 누락, 이미지 개수 초과 등)
 *       404:
 *         description: 상품 또는 로그 없음
 */

/**
 * @swagger
 * /api/products/logs/{id}:
 *   delete:
 *     summary: 상품 상태 로그 삭제 (관리자 전용)
 *     tags: [ProductStatusLog]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: 로그 ID
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: 상태 로그 삭제 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       404:
 *         description: 로그 없음
 */

// 상품로그조회
router.get('/:productId/logs', authenticate, getStatusLogsController);

// 어드민 상품로그생성
router.post(
  '/:productId/logs',
  authenticate,
  adminOnly,
  ...s3ImageUpload,
  createStatusLogController,
);

// 어드민 상품로그수정
router.patch(
  '/:productId/logs/:id',
  authenticate,
  adminOnly,
  ...s3ImageUpload,
  updateStatusLogController,
);
// 어드민 상품로그삭제
router.delete('/logs/:id', authenticate, adminOnly, deleteStatusLogController);

export default router;
