import express from 'express';
import {
  createProductController,
  getAllProductsController,
  getProductByIdController,
  getProductsMeController,
  updateProductController,
  deleteProductController,
  getWaitingProductsController,
  approveProductController,
  rejectProductController,
} from '../controllers/product.controller.js';
import { authenticate } from '../middlewares/auth.js';
import { adminOnly } from '../middlewares/adminOnly.js';
import { s3ImageUpload } from '../middlewares/s3ImageUpload.js';
import requireVerifiedPhone from '../middlewares/requireVerifiedPhone.js';

/**
 * @swagger
 * tags:
 *   name: Product
 *   description: 상품 관련 API
 */

/**
 * @swagger
 * /api/products:
 *   post:
 *     summary: 상품 등록 (이미지 업로드 지원, 휴대폰 인증 필요)
 *     tags: [Product]
 *     security:
 *       - bearerAuth: []
 *     description: 휴대폰 인증이 완료된 사용자만 상품을 등록할 수 있습니다.
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - price
 *             properties:
 *               title:
 *                 type: string
 *                 description: 상품명
 *                 example: "아이패드 9세대"
 *               description:
 *                 type: string
 *                 description: 상품 설명
 *                 example: "최신형, 상태 최상"
 *               price:
 *                 type: number
 *                 description: 가격
 *                 example: 10000
 *               categoryId:
 *                 type: string
 *                 description: 카테고리 ID
 *                 example: "clothes"
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *                 description: 상품 이미지 파일들 (최대 5장)
 *     responses:
 *       201:
 *         description: 상품 등록 성공
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
 *                     product:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                         title:
 *                           type: string
 *                         description:
 *                           type: string
 *                         price:
 *                           type: number
 *                         status:
 *                           type: string
 *                         imageUrls:
 *                           type: array
 *                           items:
 *                             type: string
 *                         allowPurchase:
 *                           type: boolean
 *                         category:
 *                           type: object
 *                           properties:
 *                             name:
 *                               type: string
 *       400:
 *         description: 잘못된 입력(가격, 이미지 등)
 *       401:
 *         description: 인증 실패 또는 휴대폰 미인증
 */

/**
 * @swagger
 * /api/products:
 *   get:
 *     summary: 전체 상품 조회
 *     tags: [Product]
 *     parameters:
 *       - in: query
 *         name: skip
 *         schema:
 *           type: integer
 *         description: 스킵할 개수(페이지네이션)
 *       - in: query
 *         name: take
 *         schema:
 *           type: integer
 *         description: 가져올 개수(페이지네이션)
 *       - in: query
 *         name: categoryId
 *         schema:
 *           type: string
 *         description: 카테고리 ID로 필터링
 *     responses:
 *       200:
 *         description: 상품 목록 반환
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
 *                           category:
 *                             type: object
 *                             properties:
 *                               name:
 *                                 type: string
 *                     total:
 *                       type: integer
 */

/**
 * @swagger
 * /api/products/{id}:
 *   get:
 *     summary: 상품 상세 조회
 *     tags: [Product]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: 상품 ID
 *     responses:
 *       200:
 *         description: 상품 상세 정보 반환
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
 *                     title:
 *                       type: string
 *                     description:
 *                       type: string
 *                     price:
 *                       type: number
 *                     allowPurchase:
 *                       type: boolean
 *                     imageUrls:
 *                       type: array
 *                       items:
 *                         type: string
 *                     category:
 *                       type: object
 *                       properties:
 *                         name:
 *                           type: string
 *                     statusLogs:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                           type:
 *                             type: string
 *                           createdAt:
 *                             type: string
 *                             format: date-time
 *                           notes:
 *                             type: string
 *                           photoUrls:
 *                             type: array
 *                             items:
 *                               type: string
 *                     reservedDates:
 *                       type: array
 *                       description: 상품에 대한 예약 날짜 목록
 *                       items:
 *                         type: object
 *                         properties:
 *                           startDate:
 *                             type: string
 *                             format: date
 *                             description: 대여 시작일
 *                           endDate:
 *                             type: string
 *                             format: date
 *                             description: 대여 종료일
 *       404:
 *         description: 상품을 찾을 수 없음
 */

/**
 * @swagger
 * /api/products/me:
 *   get:
 *     summary: 내 상품 조회 (로그인한 사용자)
 *     tags: [Product]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 로그인한 사용자가 등록한 상품 목록 반환
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
 *                           status:
 *                             type: string
 *                           imageUrl:
 *                             type: string
 *                           category:
 *                             type: object
 *                             properties:
 *                               name:
 *                                 type: string
 *       401:
 *         description: 인증 실패
 *       404:
 *         description: 상품을 찾을 수 없음
 */

/**
 * @swagger
 * /api/products/{id}:
 *   patch:
 *     summary: 상품 수정 (이미지 업로드 지원)
 *     tags: [Product]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
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
 *             properties:
 *               title:
 *                 type: string
 *                 description: 상품명
 *               description:
 *                 type: string
 *                 description: 상품 설명
 *               price:
 *                 type: number
 *                 description: 가격
 *               categoryId:
 *                 type: string
 *                 description: 카테고리 ID
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *                 description: 상품 이미지 파일들 (최대 5장)
 *     responses:
 *       200:
 *         description: 상품 수정 성공
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
 *                     product:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                         title:
 *                           type: string
 *                         description:
 *                           type: string
 *                         price:
 *                           type: number
 *                         imageUrls:
 *                           type: array
 *                           items:
 *                             type: string
 *                         status:
 *                           type: string
 *                         allowPurchase:
 *                           type: boolean
 *                         category:
 *                           type: object
 *                           properties:
 *                             name:
 *                               type: string
 *       400:
 *         description: 권한 없음 또는 잘못된 요청
 *       404:
 *         description: 상품을 찾을 수 없음
 */

/**
 * @swagger
 * /api/products/{id}:
 *   delete:
 *     summary: 상품 삭제
 *     tags: [Product]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: 상품 ID
 *     responses:
 *       200:
 *         description: 상품 삭제 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       400:
 *         description: 권한 없음 또는 잘못된 요청
 *       404:
 *         description: 상품을 찾을 수 없음
 */

/**
 * @swagger
 * /api/products/admin/waiting:
 *   get:
 *     summary: 관리자 전용 대기 상품 조회
 *     tags: [Product]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 대기 상품 목록 반환
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
 *                           status:
 *                             type: string
 *                           imageUrl:
 *                             type: string
 *                           category:
 *                             type: object
 *                             properties:
 *                               name:
 *                                 type: string
 *                           owner:
 *                             type: object
 *                             properties:
 *                               id:
 *                                 type: string
 *                               name:
 *                                 type: string
 *                               phone:
 *                                 type: string
 *                           createdAt:
 *                             type: string
 *                             format: date-time
 *                           aiPriceEstimation:
 *                             type: object
 *                             properties:
 *                               estimatedPrice:
 *                                 type: number
 *                               isValid:
 *                                 type: boolean
 *                               reason:
 *                                 type: string
 *                               sources:
 *                                 type: array
 *                                 items:
 *                                   type: string
 *                               createdAt:
 *                                 type: string
 *                                 format: date-time
 */

/**
 * @swagger
 * /api/products/admin/{id}/approve:
 *   patch:
 *     summary: 상품 승인
 *     tags: [Product]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: 상품 ID
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
 *                     id:
 *                       type: string
 *                     title:
 *                       type: string
 *                     price:
 *                       type: number
 *                     status:
 *                       type: string
 *                     imageUrl:
 *                       type: string
 *                     category:
 *                       type: object
 *                       properties:
 *                         name:
 *                           type: string
 *                     owner:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                         name:
 *                           type: string
 *                         phone:
 *                           type: string
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *       404:
 *         description: 상품을 찾을 수 없음
 */

/**
 * @swagger
 * /api/products/admin/{id}/reject:
 *   patch:
 *     summary: 상품 거절
 *     tags: [Product]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: 상품 ID
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
 *                     id:
 *                       type: string
 *                     title:
 *                       type: string
 *                     price:
 *                       type: number
 *                     status:
 *                       type: string
 *                     imageUrl:
 *                       type: string
 *                     category:
 *                       type: object
 *                       properties:
 *                         name:
 *                           type: string
 *                     owner:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                         name:
 *                           type: string
 *                         phone:
 *                           type: string
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *       404:
 *         description: 상품을 찾을 수 없음
 */

const router = express.Router();
//상품등록 (이미지 업로드 및 S3 연동)
router.post(
  '/',
  authenticate,
  requireVerifiedPhone,
  ...s3ImageUpload,
  createProductController,
);
//상품조회전체
router.get('/', getAllProductsController);
//내상품조회
router.get('/me', authenticate, getProductsMeController);
//상품상세조회
router.get('/:id', getProductByIdController);
// 상품 수정
router.patch('/:id', authenticate, s3ImageUpload, updateProductController);
// 상품 삭제
router.delete('/:id', authenticate, deleteProductController);
// 어드민 대기중상품 조회
router.get(
  '/admin/waiting',
  authenticate,
  adminOnly,
  getWaitingProductsController,
);
// 어드민 상품 승인
router.patch(
  '/admin/:id/approve',
  authenticate,
  adminOnly,
  approveProductController,
);
// 어드민 상품 거절
router.patch(
  '/admin/:id/reject',
  authenticate,
  adminOnly,
  rejectProductController,
);
export default router;
