import express from 'express';
import { authenticate } from '../middlewares/auth.js';
import { adminOnly } from '../middlewares/adminOnly.js';
import {
  createPackageCompletedRentalController,
  getMyPackageCompletedRentalsController,
  getAllPackageCompletedRentalsController,
} from '../controllers/packageCompletedRental.controller.js';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: PackageCompletedRental
 *   description: 패키지 대여 완료 관련 API
 */

/**
 * @swagger
 * /api/package-completed-rental/my:
 *   get:
 *     summary: 나의 패키지 대여완료 목록 조회
 *     tags: [PackageCompletedRental]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 나의 패키지 대여완료 목록 반환
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
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       packageCompletedRentalId:
 *                         type: string
 *                       packageRentalRequestId:
 *                         type: string
 *                       packageTitle:
 *                         type: string
 *                       rentalPeriod:
 *                         type: string
 *                       totalPrice:
 *                         type: number
 *       401:
 *         description: 인증 실패
 */
/**
 * @swagger
 * /api/package-completed-rental:
 *   get:
 *     summary: 전체 패키지 대여완료 목록 조회 (관리자)
 *     tags: [PackageCompletedRental]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 전체 패키지 대여완료 목록 반환
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
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       packageCompletedRentalId:
 *                         type: string
 *                       packageRentalRequestId:
 *                         type: string
 *                       packageTitle:
 *                         type: string
 *                       userName:
 *                         type: string
 *                       userPhone:
 *                         type: string
 *                       rentalPeriod:
 *                         type: string
 *                       totalPrice:
 *                         type: number
 *       401:
 *         description: 인증 실패
 *       403:
 *         description: 관리자 권한 필요
 */
/**
 * @swagger
 * /api/package-completed-rental/{packageRentalRequestId}:
 *   post:
 *     summary: 패키지 대여완료 생성 (관리자)
 *     tags: [PackageCompletedRental]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: packageRentalRequestId
 *         required: true
 *         schema:
 *           type: string
 *         description: 패키지 대여요청 ID
 *     responses:
 *       200:
 *         description: 패키지 대여완료 생성 성공
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
 *       400:
 *         description: 잘못된 요청
 *       401:
 *         description: 인증 실패
 *       403:
 *         description: 관리자 권한 필요
 *       404:
 *         description: 요청 없음
 */

// 내 패키지 대여완료 조회 (유저)
router.get('/my', authenticate, getMyPackageCompletedRentalsController);

// 전체 패키지 대여완료 조회 (관리자)
router.get(
  '/',
  authenticate,
  adminOnly,
  getAllPackageCompletedRentalsController,
);

// 패키지 대여 완료 생성 (관리자)
router.post(
  '/:packageRentalRequestId',
  authenticate,
  adminOnly,
  createPackageCompletedRentalController,
);

export default router;
