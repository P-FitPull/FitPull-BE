import {
  chargeBalance,
  useBalance,
  getPaymentLogs,
} from '../services/payment.service.js';
import { success } from '../utils/responseHandler.js';
import { PAYMENT_MESSAGES } from '../constants/messages.js';

export const chargeBalanceController = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { amount } = req.body;
    const result = await chargeBalance(userId, amount);
    return success(res, PAYMENT_MESSAGES.CHARGE_SUCCESS, {
      balance: result.balance,
    });
  } catch (err) {
    next(err);
  }
};

export const useBalanceController = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { amount } = req.body;
    const result = await useBalance(userId, amount);
    return success(res, PAYMENT_MESSAGES.USE_SUCCESS, {
      balance: result.balance,
    });
  } catch (err) {
    next(err);
  }
};

export const paymentLogsController = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const { type, skip = 0, take = 20 } = req.query;

    const logsResult = await getPaymentLogs(userId, {
      type,
      skip: Number(skip),
      take: Number(take),
    });
    return success(res, PAYMENT_MESSAGES.LOGS_FETCH_SUCCESS, logsResult);
  } catch (err) {
    next(err);
  }
};
