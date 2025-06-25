import { sendSMS } from './sms.js';
import redis from './redis.js';
import { setPhoneCode, getPhoneCode, deletePhoneCode } from './redis.js';
import CustomError from '../utils/customError.js';
import { AUTH_MESSAGES } from '../constants/messages.js';

export const sendVerificationCode = async (phone) => {
  const existingCode = await redis.get(`phoneCode:${phone}`);
  if (existingCode) {
    throw new CustomError(
      429,
      'TOO_MANY_REQUESTS',
      AUTH_MESSAGES.TOO_MANY_REQUESTS,
    );
  }

  const code = String(Math.floor(100000 + Math.random() * 900000));
  await setPhoneCode(phone, code);
  await sendSMS(
    phone,
    `[fitpulloverflow] 인증번호는 ${code}입니다. (3분 이내 입력)`,
  );
};

export const verifyCode = async (phone, inputCode) => {
  const savedCode = await getPhoneCode(phone);

  if (!savedCode) {
    throw new CustomError(400, 'EXPIRED_CODE', AUTH_MESSAGES.EXPIRED_CODE);
  }

  if (savedCode !== inputCode) {
    throw new CustomError(400, 'INVALID_CODE', AUTH_MESSAGES.INVALID_CODE);
  }

  await deletePhoneCode(phone);
  return true;
};
