/* eslint-disable no-unused-vars */
import {
  signup,
  login,
  rejoinRequest,
  rejoinVerify,
  verifyPhoneAndUpdateUser,
  ensurePhoneExistsForVerification,
  logout,
  sendPasswordResetCode,
  verifyCodeAndChangePassword,
} from '../services/auth.service.js';
import { getRefreshToken, setRefreshToken } from '../utils/redis.js';
import { verifyRefreshToken } from '../utils/jwt.js';
import { generateTokens } from '../utils/jwt.js';
import { success } from '../utils/responseHandler.js';
import { AUTH_MESSAGES } from '../constants/messages.js';
import {
  sendVerificationCode,
  verifyCode,
} from '../utils/phoneVerification.js';
import CustomError from '../utils/customError.js';

export const signupController = async (req, res, next) => {
  try {
    const user = await signup(req.body);
    // 서비스에서 반환된 refreshToken을 쿠키로 전달
    res.cookie('refreshToken', user.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7일
      path: '/',
    });
    return success(res, AUTH_MESSAGES.SIGNUP_SUCCESS, {
      id: user.id,
      name: user.name,
      accessToken: user.accessToken,
    });
  } catch (error) {
    next(error);
  }
};

export const loginController = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const result = await login({ email, password });
    // 서비스에서 반환된 refreshToken을 쿠키로 전달
    res.cookie('refreshToken', result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7일
      path: '/',
    });
    return success(res, result.message, {
      id: result.id,
      name: result.name,
      accessToken: result.accessToken,
    });
  } catch (error) {
    next(error);
  }
};

export const logoutController = async (req, res, next) => {
  try {
    const userId = req.user?.userId;
    await logout(userId);
    res.clearCookie('refreshToken', { path: '/' });
    return success(res, AUTH_MESSAGES.LOGOUT_SUCCESS);
  } catch (error) {
    next(error);
  }
};

// refreshToken 재발급
export const refreshTokenController = async (req, res, next) => {
  try {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) {
      return next(
        new CustomError(
          401,
          'REFRESH_TOKEN_REQUIRED',
          AUTH_MESSAGES.REFRESH_TOKEN_REQUIRED,
        ),
      );
    }
    let decoded;
    try {
      decoded = verifyRefreshToken(refreshToken);
    } catch (err) {
      return next(
        new CustomError(
          401,
          'INVALID_REFRESH_TOKEN',
          AUTH_MESSAGES.INVALID_REFRESH_TOKEN,
        ),
      );
    }
    const userId = decoded.userId;
    const savedToken = await getRefreshToken(userId);
    if (!savedToken || savedToken !== refreshToken) {
      return next(
        new CustomError(
          401,
          'INVALID_REFRESH_TOKEN',
          AUTH_MESSAGES.INVALID_REFRESH_TOKEN,
        ),
      );
    }
    const { exp, iat, ...cleanedPayload } = decoded;
    const { accessToken, refreshToken: newRefreshToken } =
      generateTokens(cleanedPayload);
    res.cookie('refreshToken', newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: '/',
    });
    await setRefreshToken(userId, newRefreshToken);
    return success(res, AUTH_MESSAGES.REFRESH_TOKEN_SUCCESS, { accessToken });
  } catch (error) {
    next(error);
  }
};

// 탈퇴 계정 재가입: 인증코드 발송
export const rejoinRequestController = async (req, res, next) => {
  try {
    const { email } = req.body;
    await rejoinRequest(email);
    return success(res, '인증 코드가 이메일로 전송되었습니다.');
  } catch (error) {
    next(error);
  }
};

// 탈퇴 계정 재가입: 인증코드 검증 및 계정 복구
export const rejoinVerifyController = async (req, res, next) => {
  try {
    const { email, code, password } = req.body;
    const user = await rejoinVerify({ email, code, password });

    // 토큰 발급 및 쿠키 세팅 (회원가입/로그인과 동일)
    res.cookie('refreshToken', user.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7일
      path: '/',
    });
    return success(res, AUTH_MESSAGES.REJOIN_SUCCESS, {
      id: user.id,
      name: user.name,
      accessToken: user.accessToken,
    });
  } catch (error) {
    next(error);
  }
};

export const socialCallbackController = async (req, res, next) => {
  try {
    const user = req.user;
    const { accessToken, refreshToken } = generateTokens({
      userId: user.id,
      accountId: user.accountId,
      email: user.email,
      role: user.role,
    });

    await setRefreshToken(user.id, refreshToken);

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: '/',
    });

    // provider에 따라 메시지 선택
    const providerMsgMap = {
      KAKAO: AUTH_MESSAGES.KAKAO_LOGIN_SUCCESS,
      GOOGLE: AUTH_MESSAGES.GOOGLE_LOGIN_SUCCESS,
      NAVER: AUTH_MESSAGES.NAVER_LOGIN_SUCCESS,
    };
    const msg = providerMsgMap[user.provider] || AUTH_MESSAGES.LOGIN_SUCCESS;

    return success(res, msg, {
      id: user.id,
      name: user.name,
      accessToken,
    });
  } catch (err) {
    next(err);
  }
};

// 인증번호 요청
export const requestPhoneCodeController = async (req, res, next) => {
  try {
    const { phone } = req.body;

    if (!phone) {
      throw new CustomError(
        400,
        'PHONE_REQUIRED',
        AUTH_MESSAGES.PHONE_REQUIRED,
      );
    }

    await ensurePhoneExistsForVerification(phone);
    await sendVerificationCode(phone);

    res.status(200).json({ message: '인증번호가 전송되었습니다.' });
  } catch (err) {
    next(err);
  }
};

// 인증번호 검증
export const verifyPhoneCodeController = async (req, res, next) => {
  try {
    const { phone, code } = req.body;
    if (!phone || !code) {
      throw new CustomError(400, 'INVALID_INPUT', AUTH_MESSAGES.INVALID_INPUT);
    }

    await verifyCode(phone, code);

    await verifyPhoneAndUpdateUser(phone);

    res.status(200).json({ message: '인증이 완료되었습니다.' });
  } catch (err) {
    next(err);
  }
};

export const passwordResetRequestController = async (req, res, next) => {
  try {
    const { email } = req.body;
    await sendPasswordResetCode(email);
    return success(res, AUTH_MESSAGES.PASSWORD_RESET_CODE_SENT);
  } catch (error) {
    next(error);
  }
};

export const passwordResetVerifyController = async (req, res, next) => {
  try {
    const { email, code, newPassword, newPasswordCheck } = req.body;
    await verifyCodeAndChangePassword({
      email,
      code,
      newPassword,
      newPasswordCheck,
    });
    return success(res, AUTH_MESSAGES.PASSWORD_RESET_SUCCESS);
  } catch (error) {
    console.log(error);
    next(error);
  }
};
