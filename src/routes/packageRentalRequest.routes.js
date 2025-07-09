import express from 'express';
import {
  createPackageRentalRequestController,
  cancelPackageRentalRequestController,
  approvePackageRentalRequestController,
  rejectPackageRentalRequestByAdminController,
  getMyPackageRentalRequestsListController,
  getPendingPackageRentalRequestsController,
} from '../controllers/packageRentalRequest.controller.js';
import { authenticate } from '../middlewares/auth.js';
import { adminOnly } from '../middlewares/adminOnly.js';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: PackageRentalRequest
 *   description: 패키지 대여 요청 관련 API
 */

/**
 * @swagger
 * /api/package-rental-requests:
 *   post:
 *     summary: 패키지 대여 요청 생성
 *     tags: [PackageRentalRequest]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - packageId
 *               - startDate
 *               - endDate
 *               - howToReceive
 *             properties:
 *               packageId:
 *                 type: string
 *               startDate:
 *                 type: string
 *                 format: date
 *               endDate:
 *                 type: string
 *                 format: date
 *               howToReceive:
 *                 type: string
 *               memo:
 *                 type: string
 *     responses:
 *       201:
 *         description: 패키지 대여 요청 생성 성공
 *       400:
 *         description: 잘못된 입력
 *       401:
 *         description: 인증 실패
 */

/**
 * @swagger
 * /api/package-rental-requests/{id}/cancel:
 *   patch:
 *     summary: 패키지 대여 요청 취소
 *     tags: [PackageRentalRequest]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: 패키지 대여 요청 ID
 *     responses:
 *       200:
 *         description: 패키지 대여 요청 취소 성공
 *       400:
 *         description: 잘못된 요청
 *       401:
 *         description: 인증 실패
 *       404:
 *         description: 요청 없음
 */

/**
 * @swagger
 * /api/package-rental-requests/{id}/approve:
 *   patch:
 *     summary: 패키지 대여 요청 승인
 *     tags: [PackageRentalRequest]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: 패키지 대여 요청 ID
 *     responses:
 *       200:
 *         description: 패키지 대여 요청 승인 성공
 *       401:
 *         description: 인증 실패
 *       403:
 *         description: 관리자 권한 필요
 *       404:
 *         description: 요청 없음
 */
/**
 * @swagger
 * /api/package-rental-requests/{id}/reject:
 *   patch:
 *     summary: 패키지 대여 요청 거절
 *     tags: [PackageRentalRequest]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: 패키지 대여 요청 ID
 *     responses:
 *       200:
 *         description: 패키지 대여 요청 거절 성공
 *       401:
 *         description: 인증 실패
 *       403:
 *         description: 관리자 권한 필요
 *       404:
 *         description: 요청 없음
 */

/**
 * @swagger
 * /api/package-rental-requests/my:
 *   get:
 *     summary: 나의 패키지 대여 요청 목록 조회
 *     tags: [PackageRentalRequest]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 나의 패키지 대여 요청 목록 반환
 *       401:
 *         description: 인증 실패
 */
/**
 * @swagger
 * /api/package-rental-requests/pending:
 *   get:
 *     summary: 대기중인 패키지 대여 요청 목록 (관리자)
 *     tags: [PackageRentalRequest]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 대기중인 패키지 대여 요청 목록 반환
 *       401:
 *         description: 인증 실패
 *       403:
 *         description: 관리자 권한 필요
 */
// 패키지 대여 요청 생성
router.post('/', authenticate, createPackageRentalRequestController);

// 패키지 대여 요청 취소
router.patch('/:id/cancel', authenticate, cancelPackageRentalRequestController);

// 패키지 대여 요청 승인
router.patch(
  '/:id/approve',
  authenticate,
  adminOnly,
  approvePackageRentalRequestController,
);

// 패키지 대여 요청 거절
router.patch(
  '/:id/reject',
  authenticate,
  adminOnly,
  rejectPackageRentalRequestByAdminController,
);
// 나의 패키지 대여요청 목록 (간단)
router.get('/my', authenticate, getMyPackageRentalRequestsListController);

// 대기중인 패키지 대여요청 목록 (admin 전용)
router.get(
  '/pending',
  authenticate,
  adminOnly,
  getPendingPackageRentalRequestsController,
);

export default router;
