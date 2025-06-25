import express from 'express';
import {
  getMyProfile,
  updateMyProfile,
  deleteMyAccount,
} from '../controllers/user.controller.js';
import { authenticate } from '../middlewares/auth.js';

/**
 * @swagger
 * tags:
 *   name: User
 *   description: 내 정보 관리 API
 */

/**
 * @swagger
 * /api/users/me:
 *   get:
 *     summary: 내 정보 조회
 *     description: 내 프로필 정보를 반환합니다.
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 내 프로필 반환
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
 *                     user:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                         name:
 *                           type: string
 *                         phone:
 *                           type: string
 *                         verifiedPhone:
 *                           type: boolean
 *                         balance:
 *                           type: number
 *       404:
 *         description: 유저를 찾을 수 없음
 */

/**
 * @swagger
 * /api/users/me:
 *   patch:
 *     summary: 내 정보 수정
 *     description: 이름, 휴대폰, 계좌정보 등을 수정합니다. 휴대폰 번호 변경 시 중복 체크 및 인증상태 초기화.
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: 홍길동
 *               phone:
 *                 type: string
 *                 example: "01012345678"
 *     responses:
 *       200:
 *         description: 수정된 프로필 반환
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
 *                     user:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                         name:
 *                           type: string
 *                         phone:
 *                           type: string
 *                         verifiedPhone:
 *                           type: boolean
 *       400:
 *         description: 잘못된 입력(필수값 누락 등)
 *       409:
 *         description: 이미 존재하는 휴대폰 번호
 *       404:
 *         description: 유저를 찾을 수 없음
 */

/**
 * @swagger
 * /api/users/me:
 *   delete:
 *     summary: 회원 탈퇴
 *     description: 내 계정을 탈퇴(soft delete)합니다.
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 회원 탈퇴 완료
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
 *         description: 유저를 찾을 수 없음
 */

const router = express.Router();
//내정보조회
router.get('/me', authenticate, getMyProfile);
//내정보수정
router.patch('/me', authenticate, updateMyProfile);
//회원탈퇴
router.delete('/me', authenticate, deleteMyAccount);

export default router;
