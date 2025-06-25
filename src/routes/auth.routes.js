import express from 'express';
import {
  signupController,
  loginController,
  logoutController,
  refreshTokenController,
  rejoinRequestController,
  rejoinVerifyController,
  socialCallbackController,
  requestPhoneCodeController,
  verifyPhoneCodeController,
  passwordResetRequestController,
  passwordResetVerifyController,
} from '../controllers/auth.controller.js';
import passport from '../configs/passport.js';

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: 인증 관련 API
 */

/**
 * @swagger
 * /api/auth/signup:
 *   post:
 *     summary: 회원가입
 *     description: 이메일, 비밀번호, 이름, 휴대폰 번호로 회원가입을 진행합니다.
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *               - passwordCheck
 *               - name
 *               - phone
 *             properties:
 *               email:
 *                 type: string
 *                 example: user@example.com
 *               password:
 *                 type: string
 *                 example: password123
 *               passwordCheck:
 *                 type: string
 *                 example: password123
 *               name:
 *                 type: string
 *                 example: 홍길동
 *               phone:
 *                 type: string
 *                 example: "01012345678"
 *     responses:
 *       201:
 *         description: 회원가입 성공
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
 *                     name:
 *                       type: string
 *                     accessToken:
 *                       type: string
 *       400:
 *         description: 잘못된 입력(비밀번호 불일치 등)
 *       409:
 *         description: 이미 존재하는 이메일/휴대폰 또는 탈퇴 계정
 */

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: 로그인
 *     description: 이메일과 비밀번호로 로그인합니다.
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 example: user@example.com
 *               password:
 *                 type: string
 *                 example: password123
 *     responses:
 *       200:
 *         description: 로그인 성공
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
 *                     name:
 *                       type: string
 *                     accessToken:
 *                       type: string
 *       401:
 *         description: 비밀번호 불일치
 *       404:
 *         description: 존재하지 않는 계정
 */

/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     summary: 로그아웃
 *     description: refreshToken 쿠키를 삭제하여 로그아웃합니다.
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: 로그아웃 성공
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
 * /api/auth/refresh:
 *   post:
 *     summary: accessToken 재발급
 *     description: refreshToken 쿠키를 이용해 accessToken을 재발급합니다.
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: accessToken 재발급 성공
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
 *                     accessToken:
 *                       type: string
 *       401:
 *         description: refreshToken이 없거나 유효하지 않음
 */

/**
 * @swagger
 * /api/auth/rejoin/request:
 *   post:
 *     summary: 탈퇴 계정 재가입 인증코드 요청
 *     description: 탈퇴한 계정의 이메일로 인증코드를 전송합니다.
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 example: user@example.com
 *     responses:
 *       200:
 *         description: 인증 코드 전송 성공
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
 *         description: 탈퇴한 계정이 아님
 */

/**
 * @swagger
 * /api/auth/rejoin/verify:
 *   post:
 *     summary: 탈퇴 계정 재가입 인증코드 검증 및 계정 복구
 *     description: 인증코드와 새 비밀번호를 입력하여 탈퇴한 계정을 복구합니다.
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - code
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 example: user@example.com
 *               code:
 *                 type: string
 *                 example: "123456"
 *               password:
 *                 type: string
 *                 example: "새비밀번호"
 *     responses:
 *       200:
 *         description: 계정 복구 및 로그인 성공
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
 *                     name:
 *                       type: string
 *                     accessToken:
 *                       type: string
 *       400:
 *         description: 인증코드 불일치, 비밀번호 오류 등
 *       404:
 *         description: 계정 없음
 */

/**
 * @swagger
 * /api/auth/kakao:
 *   get:
 *     summary: 카카오 소셜 로그인 시작
 *     description: 카카오 인증 페이지로 리다이렉트합니다.
 *     tags: [Auth]
 *     responses:
 *       302:
 *         description: 카카오 인증 페이지로 리다이렉트
 */

/**
 * @swagger
 * /api/auth/kakao/callback:
 *   get:
 *     summary: 카카오 소셜 로그인 콜백
 *     description: 카카오 인증 후 콜백. JWT 토큰 반환.
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: 로그인 성공 (JWT 토큰 등 반환)
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
 *                     name:
 *                       type: string
 *                     accessToken:
 *                       type: string
 *       401:
 *         description: 로그인 실패
 */

/**
 * @swagger
 * /api/auth/google:
 *   get:
 *     summary: 구글 소셜 로그인 시작
 *     description: 구글 인증 페이지로 리다이렉트합니다.
 *     tags: [Auth]
 *     responses:
 *       302:
 *         description: 구글 인증 페이지로 리다이렉트
 */

/**
 * @swagger
 * /api/auth/google/callback:
 *   get:
 *     summary: 구글 소셜 로그인 콜백
 *     description: 구글 인증 후 콜백. JWT 토큰 반환.
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: 로그인 성공 (JWT 토큰 등 반환)
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
 *                     name:
 *                       type: string
 *                     accessToken:
 *                       type: string
 *       401:
 *         description: 로그인 실패
 */

/**
 * @swagger
 * /api/auth/naver:
 *   get:
 *     summary: 네이버 소셜 로그인 시작
 *     description: 네이버 인증 페이지로 리다이렉트합니다.
 *     tags: [Auth]
 *     responses:
 *       302:
 *         description: 네이버 인증 페이지로 리다이렉트
 */

/**
 * @swagger
 * /api/auth/naver/callback:
 *   get:
 *     summary: 네이버 소셜 로그인 콜백
 *     description: 네이버 인증 후 콜백. JWT 토큰 반환.
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: 로그인 성공 (JWT 토큰 등 반환)
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
 *                     name:
 *                       type: string
 *                     accessToken:
 *                       type: string
 *       401:
 *         description: 로그인 실패
 */

/**
 * @swagger
 * /api/auth/phone/request:
 *   post:
 *     summary: 휴대폰 인증번호 요청
 *     description: 입력한 휴대폰 번호로 인증번호를 전송합니다. 이미 인증된 번호는 요청 불가.
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - phone
 *             properties:
 *               phone:
 *                 type: string
 *                 example: "01012345678"
 *     responses:
 *       200:
 *         description: 인증번호 전송 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       400:
 *         description: 잘못된 요청(휴대폰 번호 누락, 이미 인증된 번호 등)
 *       404:
 *         description: 해당 번호의 유저 없음
 */

/**
 * @swagger
 * /api/auth/phone/verify:
 *   post:
 *     summary: 휴대폰 인증번호 검증
 *     description: 입력한 인증번호가 맞는지 검증하고, 성공 시 해당 유저의 휴대폰 인증 상태를 갱신합니다.
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - phone
 *               - code
 *             properties:
 *               phone:
 *                 type: string
 *                 example: "01012345678"
 *               code:
 *                 type: string
 *                 example: "123456"
 *     responses:
 *       200:
 *         description: 인증 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       400:
 *         description: 인증 실패(만료, 불일치, 잘못된 입력 등)
 */

/**
 * @swagger
 * /api/auth/password/reset/request:
 *   post:
 *     summary: 비밀번호 재설정 인증코드 요청
 *     description: 비밀번호 재설정을 위해 인증코드를 전송합니다.
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 example: user@example.com
 *     responses:
 *       200:
 *         description: 인증 코드 전송 성공
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
 *         description: 존재하지 않는 계정
 */

/**
 * @swagger
 * /api/auth/password/reset/verify:
 *   post:
 *     summary: 비밀번호 재설정 인증코드 검증
 *     description: 비밀번호 재설정을 위해 인증코드를 검증합니다.
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - code
 *             properties:
 *               email:
 *                 type: string
 *                 example: user@example.com
 *               code:
 *                 type: string
 *                 example: "123456"
 *     responses:
 *       200:
 *         description: 인증 성공
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
 *         description: 인증 실패(만료, 불일치, 잘못된 입력 등)
 */

const router = express.Router();
//회원가입
router.post('/signup', signupController);
//로그인
router.post('/login', loginController);
//로그아웃
router.post('/logout', logoutController);
//토큰 재발급
router.post('/refresh', refreshTokenController);
//재가입 요청
router.post('/rejoin/request', rejoinRequestController);
//재가입 인증
router.post('/rejoin/verify', rejoinVerifyController);

// 카카오 로그인 시작
router.get('/kakao', passport.authenticate('kakao'));

// 카카오 로그인 콜백
router.get(
  '/kakao/callback',
  passport.authenticate('kakao', { failureRedirect: '/login', session: false }),
  socialCallbackController,
);

// 구글 로그인 시작
router.get(
  '/google',
  passport.authenticate('google', { scope: ['profile', 'email'] }),
);

// 구글 로그인 콜백
router.get(
  '/google/callback',
  passport.authenticate('google', {
    failureRedirect: '/login',
    session: false,
  }),
  socialCallbackController,
);

// 네이버 로그인 시작
router.get('/naver', passport.authenticate('naver'));

// 네이버 로그인 콜백
router.get(
  '/naver/callback',
  passport.authenticate('naver', { failureRedirect: '/login', session: false }),
  socialCallbackController,
);

// 인증번호 요청
router.post('/phone/request', requestPhoneCodeController);

// 인증번호 검증
router.post('/phone/verify', verifyPhoneCodeController);

// 비밀번호 재설정 인증코드 요청
router.post('/password/reset/request', passwordResetRequestController);

// 비밀번호 재설정 인증코드 검증
router.post('/password/reset/verify', passwordResetVerifyController);

export default router;
