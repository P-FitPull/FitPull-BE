import express from 'express';
import { adminOnly } from '../middlewares/adminOnly.js';
import { influencerOnly } from '../middlewares/influencerOnly.js';
import { authenticate } from '../middlewares/auth.js';
import { s3ImageUpload } from '../middlewares/s3ImageUpload.js';
import {
  findAllInfluencerPromosController,
  findInfluencerPromoDetailController,
  createInfluencerPromoController,
  updateInfluencerPromoController,
  deleteInfluencerPromoController,
  findFeaturedHomeInfluencerPromoController,
  setFeaturedHomeInfluencerPromoController,
} from '../controllers/influencerPromo.controller.js';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: InfluencerPromo
 *   description: 인플루언서 홍보물 관련 API
 */

/**
 * @swagger
 * /api/influencer-promos:
 *   get:
 *     summary: 전체 인플루언서 홍보물 리스트 조회
 *     tags: [InfluencerPromo]
 *     responses:
 *       200:
 *         description: 홍보물 목록 반환
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
 *                     promos:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                           title:
 *                             type: string
 *                           imageUrls:
 *                             type: array
 *                             items:
 *                               type: string
 */
/**
 * @swagger
 * /api/influencer-promos/featured-home:
 *   get:
 *     summary: 홈화면 대표 인플루언서 홍보물 조회 (관리자)
 *     tags: [InfluencerPromo]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 대표 홍보물 반환
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
 *                     promo:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                         title:
 *                           type: string
 *                         videoUrl:
 *                           type: string
 *       401:
 *         description: 인증 필요
 *       403:
 *         description: 관리자 권한 필요
 *       404:
 *         description: 대표 홍보물 없음
 */
/**
 * @swagger
 * /api/influencer-promos/{id}:
 *   get:
 *     summary: 인플루언서 홍보물 상세 조회
 *     tags: [InfluencerPromo]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: 홍보물 ID
 *     responses:
 *       200:
 *         description: 홍보물 상세 반환
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
 *                     promo:
 *                       type: object
 *       404:
 *         description: 홍보물 없음
 */
/**
 * @swagger
 * /api/influencer-promos:
 *   post:
 *     summary: 인플루언서 홍보물 등록
 *     tags: [InfluencerPromo]
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
 *               - videoUrl
 *               - productId
 *               - userId
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               videoUrl:
 *                 type: string
 *               productId:
 *                 type: string
 *               userId:
 *                 type: string
 *               snsLinks:
 *                 type: array
 *                 items:
 *                   type: string
 *               imageUrls:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       200:
 *         description: 등록 성공
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
 *                     promo:
 *                       type: object
 *       400:
 *         description: 필수값 누락/유효성 오류
 *       401:
 *         description: 인증 필요
 *       403:
 *         description: 인플루언서 권한 필요
 *       404:
 *         description: 상품 없음
 */
/**
 * @swagger
 * /api/influencer-promos/{id}:
 *   patch:
 *     summary: 인플루언서 홍보물 수정
 *     tags: [InfluencerPromo]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: 홍보물 ID
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
 *               videoUrl:
 *                 type: string
 *               productId:
 *                 type: string
 *               snsLinks:
 *                 type: array
 *                 items:
 *                   type: string
 *               imageUrls:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       200:
 *         description: 수정 성공
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
 *                     promo:
 *                       type: object
 *       400:
 *         description: 유효성 오류
 *       401:
 *         description: 인증 필요
 *       403:
 *         description: 인플루언서 권한/권한 없음
 *       404:
 *         description: 홍보물/상품 없음
 */
/**
 * @swagger
 * /api/influencer-promos/{id}:
 *   delete:
 *     summary: 인플루언서 홍보물 삭제
 *     tags: [InfluencerPromo]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: 홍보물 ID
 *     responses:
 *       200:
 *         description: 삭제 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       401:
 *         description: 인증 필요
 *       403:
 *         description: 인플루언서 권한/권한 없음
 *       404:
 *         description: 홍보물 없음
 */
/**
 * @swagger
 * /api/influencer-promos/{id}/featured-home:
 *   patch:
 *     summary: 홈화면 대표 인플루언서 홍보물 지정 (관리자)
 *     tags: [InfluencerPromo]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: 홍보물 ID
 *     responses:
 *       200:
 *         description: 대표 홍보물 지정 성공
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
 *                     promo:
 *                       type: object
 *       401:
 *         description: 인증 필요
 *       403:
 *         description: 관리자 권한 필요
 *       404:
 *         description: 홍보물 없음
 */

//홍보관 전체보기
router.get('/', findAllInfluencerPromosController);

//홈화면 대표 홍보물 조회
router.get(
  '/featured-home',
  authenticate,
  adminOnly,
  findFeaturedHomeInfluencerPromoController,
);
//홍보관 상세보기
router.get('/:id', findInfluencerPromoDetailController);

//홍보관 등록
router.post(
  '/',
  authenticate,
  influencerOnly,
  s3ImageUpload,
  createInfluencerPromoController,
);

//홈화면 대표 홍보물 지정
router.patch(
  '/:id/featured-home',
  authenticate,
  adminOnly,
  setFeaturedHomeInfluencerPromoController,
);

//홍보관 수정
router.patch(
  '/:id',
  authenticate,
  influencerOnly,
  s3ImageUpload,
  updateInfluencerPromoController,
);

//홍보관 삭제
router.delete(
  '/:id',
  authenticate,
  influencerOnly,
  deleteInfluencerPromoController,
);

export default router;
