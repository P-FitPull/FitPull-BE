import {
  getTotalRentalRequestsByUser,
  getTotalRentalRequestsForAdmin,
} from '../services/getTotalRental.service.js';
import { success } from '../utils/responseHandler.js';
import { RENTAL_REQUEST_MESSAGES } from '../constants/messages.js';

// 유저의 통합 대여 요청 조회
export const getTotalRentalRequestsByUserController = async (
  req,
  res,
  next,
) => {
  try {
    const userId = req.user.id;
    const result = await getTotalRentalRequestsByUser(userId);
    return success(res, RENTAL_REQUEST_MESSAGES.RENTAL_MY_LISTED, {
      rentalRequests: result,
    });
  } catch (err) {
    next(err);
  }
};

// 어드민 전체/상태별 대여요청 통합 조회
export const getTotalRentalRequestsForAdminController = async (
  req,
  res,
  next,
) => {
  try {
    const { status } = req.query;
    const result = await getTotalRentalRequestsForAdmin(status);
    const message = status
      ? `${status} 상태의 대여요청 목록 조회 성공`
      : RENTAL_REQUEST_MESSAGES.RENTAL_REQUEST_LISTED;
    return success(res, message, {
      rentalRequests: result,
    });
  } catch (err) {
    next(err);
  }
};
