import {
  getPlatformBalance,
  getPlatformSummary,
  getPlatformLogs,
  addPlatformDeposit,
} from '../services/platform.service.js';
import { success } from '../utils/responseHandler.js';
import { PLATFORM_MESSAGES } from '../constants/messages.js';

export const getPlatformBalanceController = async (req, res, next) => {
  try {
    const result = await getPlatformBalance();
    return success(res, PLATFORM_MESSAGES.PLATFORM_BALANCE_GET_SUCCESS, result);
  } catch (err) {
    next(err);
  }
};

export const getPlatformSummaryController = async (req, res, next) => {
  try {
    const result = await getPlatformSummary();
    return success(res, PLATFORM_MESSAGES.PLATFORM_SUMMARY_GET_SUCCESS, result);
  } catch (err) {
    next(err);
  }
};

export const getPlatformLogsController = async (req, res, next) => {
  try {
    const { type, skip = 0, take = 20, startDate, endDate } = req.query;
    const result = await getPlatformLogs({
      type,
      skip: Number(skip),
      take: Number(take),
      startDate,
      endDate,
    });
    return success(res, PLATFORM_MESSAGES.PLATFORM_LOGS_GET_SUCCESS, result);
  } catch (err) {
    next(err);
  }
};

export const addPlatformDepositController = async (req, res, next) => {
  try {
    const { amount, memo } = req.body;
    const result = await addPlatformDeposit({ amount, memo });
    return success(res, PLATFORM_MESSAGES.PLATFORM_DEPOSIT_SUCCESS, result);
  } catch (err) {
    next(err);
  }
};
