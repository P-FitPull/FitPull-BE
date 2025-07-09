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

/**
 * @swagger
 * tags:
 *   name: Package
 *   description: 패키지 상품 관련 API
 */

/**
 * @swagger
 * /api/packages:
 *   post:
 *     summary: 패키지 생성
 *     tags: [Package]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - productIds
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               productIds:
 *                 type: array
 *                 items:
 *                   type: string
 *               isFeatured:
 *                 type: boolean
 *     responses:
 *       201:
 *         description: 패키지 생성 성공
 *       400:
 *         description: 잘못된 입력
 *       401:
 *         description: 인증 실패
 *       403:
 *         description: 관리자 권한 필요
 */

/**
 * @swagger
 * /api/packages:
 *   get:
 *     summary: 패키지 목록 조회
 *     tags: [Package]
 *     responses:
 *       200:
 *         description: 패키지 목록 반환
 */

/**
 * @swagger
 * /api/packages/{id}:
 *   get:
 *     summary: 패키지 단일 조회
 *     tags: [Package]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: 패키지 ID
 *     responses:
 *       200:
 *         description: 패키지 상세 반환
 *       404:
 *         description: 패키지 없음
 */

/**
 * @swagger
 * /api/packages/{id}:
 *   patch:
 *     summary: 패키지 수정
 *     tags: [Package]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: 패키지 ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               productIds:
 *                 type: array
 *                 items:
 *                   type: string
 *               isFeatured:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: 패키지 수정 성공
 *       400:
 *         description: 잘못된 입력
 *       401:
 *         description: 인증 실패
 *       403:
 *         description: 관리자 권한 필요
 *       404:
 *         description: 패키지 없음
 */

/**
 * @swagger
 * /api/packages/{id}:
 *   delete:
 *     summary: 패키지 삭제
 *     tags: [Package]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: 패키지 ID
 *     responses:
 *       200:
 *         description: 패키지 삭제 성공
 *       401:
 *         description: 인증 실패
 *       403:
 *         description: 관리자 권한 필요
 *       404:
 *         description: 패키지 없음
 */
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
