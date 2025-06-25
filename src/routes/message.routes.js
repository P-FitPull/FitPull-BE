import express from 'express';
import {
  sendMessageController,
  getReceivedMessagesController,
  getSentMessagesController,
  markMessageReadController,
  markAllMessagesReadController,
  deleteMessageController,
} from '../controllers/message.controller.js';
import { authenticate } from '../middlewares/auth.js';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Message
 *   description: 문의/답변(Q&A) 메시지 API
 */

/**
 * @swagger
 * /api/messages/send:
 *   post:
 *     summary: 메시지 전송 (문의/답변)
 *     tags: [Message]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - receiverId
 *               - content
 *             properties:
 *               receiverId:
 *                 type: string
 *                 description: 수신자(ADMIN 또는 USER) ID
 *               content:
 *                 type: string
 *                 description: 메시지 내용
 *               productId:
 *                 type: string
 *                 description: (선택) 관련 상품 ID
 *     responses:
 *       200:
 *         description: 메시지 전송 완료
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
 *       400:
 *         description: 잘못된 입력(필수값 누락 등)
 *       403:
 *         description: 권한 없음
 *       404:
 *         description: 상품 없음
 */
/**
 * @swagger
 * /api/messages/received:
 *   get:
 *     summary: 받은 메시지 목록 조회
 *     tags: [Message]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 받은 메시지 목록 반환
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
 *       403:
 *         description: 권한 없음
 */
/**
 * @swagger
 * /api/messages/sent:
 *   get:
 *     summary: 보낸 메시지 목록 조회
 *     tags: [Message]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 보낸 메시지 목록 반환
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
 *       403:
 *         description: 권한 없음
 */
/**
 * @swagger
 * /api/messages/{id}/read:
 *   patch:
 *     summary: 메시지 단건 읽음 처리
 *     tags: [Message]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: 메시지 ID
 *     responses:
 *       200:
 *         description: 읽음 처리 완료
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
 *         description: 메시지 없음
 */

/**
 * @swagger
 * /api/messages/read-all:
 *   patch:
 *     summary: 받은 메시지 전체 읽음 처리
 *     tags: [Message]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 전체 읽음 처리 완료
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
/**
 * @swagger
 * /api/messages/{id}:
 *   delete:
 *     summary: 메시지 삭제 (soft delete)
 *     tags: [Message]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: 메시지 ID
 *     responses:
 *       200:
 *         description: 메시지 삭제 완료
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
 *         description: 메시지 없음
 */

//메세지 전송
router.post('/send', authenticate, sendMessageController);

//받은 메세지 목록 조회
router.get('/received', authenticate, getReceivedMessagesController);

//보낸 메세지 목록 조회
router.get('/sent', authenticate, getSentMessagesController);

//메세지 단건 읽음 처리
router.patch('/:id/read', authenticate, markMessageReadController);

//메세지 전체 읽음 처리
router.patch('/read-all', authenticate, markAllMessagesReadController);

//메세지 삭제
router.delete('/:id', authenticate, deleteMessageController);

export default router;
