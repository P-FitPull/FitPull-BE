import express from 'express';
import {
  completeRentalController,
  getMyCompletedRentalsController,
  getAllCompletedRentalsController,
} from '../controllers/completedRental.controller.js';
import { authenticate } from '../middlewares/auth.js';
import { adminOnly } from '../middlewares/adminOnly.js';

/**
 * @swagger
 * tags:
 *   name: CompletedRental
 *   description: 대여 완료 처리 관련 API
 */

/**
 * @swagger
 * /api/completed-rentals/{id}/complete:
 *   post:
 *     summary: 관리자 수동 대여 완료 처리
 *     tags: [CompletedRental]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: rentalRequest ID
 *         schema:
 *           type: string
 *     responses:
 *       201:
 *         description: 대여 완료 처리 성공
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
 *                     completedRental:
 *                       type: object
 *                       properties:
 *                         completedRentalId:
 *                           type: string
 *                         rentalRequestId:
 *                           type: string
 *                         productTitle:
 *                           type: string
 *                         userName:
 *                           type: string
 *                         userPhone:
 *                           type: string
 *                         rentalPeriod:
 *                           type: string
 *                         totalPrice:
 *                           type: number
 *       400:
 *         description: 유효하지 않은 요청(승인되지 않은 대여 등)
 *       404:
 *         description: 대여 요청 없음
 */

/**
 * @swagger
 * /api/completed-rentals/me:
 *   get:
 *     summary: 내 완료된 대여 조회
 *     tags: [CompletedRental]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 완료된 대여 목록 반환
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
 *                     completedRentals:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           completedRentalId:
 *                             type: string
 *                           rentalRequestId:
 *                             type: string
 *                           productTitle:
 *                             type: string
 *                           rentalPeriod:
 *                             type: string
 *                           totalPrice:
 *                             type: number
 */

/**
 * @swagger
 * /api/completed-rentals:
 *   get:
 *     summary: 관리자 전체 완료 대여 조회
 *     tags: [CompletedRental]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 전체 완료 대여 목록 반환
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
 *                     completedRentals:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           completedRentalId:
 *                             type: string
 *                           rentalRequestId:
 *                             type: string
 *                           productTitle:
 *                             type: string
 *                           userName:
 *                             type: string
 *                           userPhone:
 *                             type: string
 *                           rentalPeriod:
 *                             type: string
 *                           totalPrice:
 *                             type: number
 */

const router = express.Router();
// 내 대여완료 조회
router.get('/me', authenticate, getMyCompletedRentalsController);
// 어드민 대여완료 전체 조회
router.get('/', authenticate, adminOnly, getAllCompletedRentalsController);
// 어드민 대여 완료 처리
router.post('/:id/complete', authenticate, adminOnly, completeRentalController);

export default router;
