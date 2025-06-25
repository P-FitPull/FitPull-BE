import axios from 'axios';
import crypto from 'crypto';
import { v4 as uuidv4 } from 'uuid';
import dotenv from 'dotenv';
dotenv.config();

const { COOLSMS_API_KEY, COOLSMS_API_SECRET, COOLSMS_SENDER } = process.env;

export const sendSMS = async (to, text) => {
  const url = 'https://api.coolsms.co.kr/messages/v4/send';
  const timestamp = new Date().toISOString();
  const salt = uuidv4();

  const hmac = crypto.createHmac('sha256', COOLSMS_API_SECRET);
  hmac.update(timestamp + salt);
  const signature = hmac.digest('hex');

  try {
    const response = await axios.post(
      url,
      {
        message: {
          to,
          from: COOLSMS_SENDER,
          text,
        },
      },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `HMAC-SHA256 apiKey=${COOLSMS_API_KEY}, date=${timestamp}, salt=${salt}, signature=${signature}`,
        },
      },
    );

    return response.data;
  } catch (error) {
    console.error('SMS 전송 실패:', error?.response?.data || error);
    throw new Error('SMS 전송 중 오류가 발생했습니다.');
  }
};
