import {
  getPlatformBalanceRepo,
  getPlatformSummaryRepo,
  getPlatformLogsRepo,
  addPlatformDepositRepo,
} from '../repositories/platformRepository.js';
import CustomError from '../utils/customError.js';
import { PLATFORM_MESSAGES } from '../constants/messages.js';

export const getPlatformBalance = async () => {
  const balance = await getPlatformBalanceRepo();
  if (balance === undefined || balance === null) {
    throw new CustomError(
      500,
      'PLATFORM_BALANCE_ERROR',
      PLATFORM_MESSAGES.PLATFORM_BALANCE_ERROR,
    );
  }
  return { balance };
};

export const getPlatformSummary = async () => {
  const summary = await getPlatformSummaryRepo();
  const balance = await getPlatformBalanceRepo();
  if (!summary || balance === undefined || balance === null) {
    throw new CustomError(
      500,
      'PLATFORM_SUMMARY_ERROR',
      PLATFORM_MESSAGES.PLATFORM_SUMMARY_ERROR,
    );
  }
  return { ...summary, balance };
};

export const getPlatformLogs = async ({
  type,
  skip = 0,
  take = 20,
  startDate,
  endDate,
} = {}) => {
  const { logs, total } = await getPlatformLogsRepo({
    type,
    skip,
    take,
    startDate,
    endDate,
  });
  if (!logs) {
    throw new CustomError(
      500,
      'PLATFORM_LOGS_ERROR',
      PLATFORM_MESSAGES.PLATFORM_LOGS_ERROR,
    );
  }
  return { logs, total };
};

export const addPlatformDeposit = async ({ amount, memo }) => {
  if (!amount || typeof amount !== 'number' || amount <= 0) {
    throw new CustomError(
      400,
      'INVALID_AMOUNT',
      PLATFORM_MESSAGES.INVALID_AMOUNT,
    );
  }
  const result = await addPlatformDepositRepo({ amount, memo });
  if (!result) {
    throw new CustomError(
      500,
      'PLATFORM_DEPOSIT_ERROR',
      PLATFORM_MESSAGES.PLATFORM_DEPOSIT_ERROR,
    );
  }
  return result;
};
