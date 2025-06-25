import express from 'express';
import {
  getCategoriesController,
  createCategoryController,
  updateCategoryController,
  deleteCategoryController,
  getCategoryDetailController,
} from '../controllers/category.controller.js';
import { authenticate } from '../middlewares/auth.js';
import { adminOnly } from '../middlewares/adminOnly.js';

/**
 * @swagger
 * tags:
 *   name: Category
 *   description: 카테고리 관련 API
 */

/**
 * @swagger
 * /api/categories:
 *   get:
 *     summary: 모든 카테고리 조회
 *     tags: [Category]
 *     responses:
 *       200:
 *         description: 카테고리 목록 반환
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
 *                     categories:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                           name:
 *                             type: string
 *                           description:
 *                             type: string
 */

/**
 * @swagger
 * /api/categories:
 *   post:
 *     summary: 카테고리 생성 (admin 전용)
 *     tags: [Category]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *                 example: "전자기기"
 *               description:
 *                 type: string
 *                 example: "전자제품 관련 카테고리"
 *     responses:
 *       201:
 *         description: 카테고리 생성 완료
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
 *                     category:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                         name:
 *                           type: string
 *                         description:
 *                           type: string
 *       400:
 *         description: 이름 누락 등 잘못된 요청
 *       409:
 *         description: 이미 존재하는 카테고리
 */

/**
 * @swagger
 * /api/categories/{id}:
 *   patch:
 *     summary: 카테고리 수정 (admin 전용)
 *     tags: [Category]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: 카테고리 ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *                 example: "전자기기"
 *               description:
 *                 type: string
 *                 example: "전자제품 관련 카테고리"
 *     responses:
 *       200:
 *         description: 카테고리 수정 완료
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
 *                     category:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                         name:
 *                           type: string
 *                         description:
 *                           type: string
 *       400:
 *         description: 이름 누락 등 잘못된 요청
 *       404:
 *         description: 카테고리 없음
 */

/**
 * @swagger
 * /api/categories/{id}:
 *   delete:
 *     summary: 카테고리 삭제 (admin 전용)
 *     tags: [Category]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: 카테고리 ID
 *     responses:
 *       200:
 *         description: 카테고리 삭제 완료
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
 *         description: 카테고리 없음
 */

/**
 * @swagger
 * /api/categories/{id}:
 *   get:
 *     summary: 카테고리 상세 조회 (상품 포함)
 *     tags: [Category]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: 카테고리 ID
 *     responses:
 *       200:
 *         description: 카테고리 상세 정보 및 상품 목록 반환
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
 *                     category:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                         name:
 *                           type: string
 *                         description:
 *                           type: string
 *                     products:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                           title:
 *                             type: string
 *                           price:
 *                             type: number
 *                           imageUrl:
 *                             type: string
 *                           status:
 *                             type: string
 *       404:
 *         description: 카테고리 없음
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 */

const router = express.Router();
//카테고리 조회
router.get('/', getCategoriesController);
//카테고리 생성
router.post('/', authenticate, adminOnly, createCategoryController);
//카테고리 수정
router.patch('/:id', authenticate, adminOnly, updateCategoryController);
//카테고리 삭제
router.delete('/:id', authenticate, adminOnly, deleteCategoryController);
//카테고리 상세 조회
router.get('/:id', getCategoryDetailController);

export default router;
