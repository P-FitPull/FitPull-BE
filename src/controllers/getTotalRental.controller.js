import {
  getTotalRentalRequestsByUser,
  getTotalRentalRequestsForAdmin,
  getTotalCompletedRentalsByUser,
  getTotalCompletedRentalsForAdmin,
} from '../services/getTotalRental.service.js';
import { success } from '../utils/responseHandler.js';
import {
  RENTAL_REQUEST_MESSAGES,
  COMPLETED_RENTAL_MESSAGES,
} from '../constants/messages.js';

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

// 유저의 통합 완료 대여(단건+패키지) 조회
export const getTotalCompletedRentalsByUserController = async (
  req,
  res,
  next,
) => {
  try {
    const userId = req.user.id;
    const result = await getTotalCompletedRentalsByUser(userId);
    return success(res, COMPLETED_RENTAL_MESSAGES.MY_COMPLETED_RENTALS_LISTED, {
      completedRentals: result,
    });
  } catch (err) {
    next(err);
  }
};

// 어드민 전체 완료 대여(단건+패키지) 조회
export const getTotalCompletedRentalsForAdminController = async (
  _req,
  res,
  next,
) => {
  try {
    const result = await getTotalCompletedRentalsForAdmin();
    return success(
      res,
      COMPLETED_RENTAL_MESSAGES.ALL_COMPLETED_RENTALS_LISTED,
      {
        completedRentals: result,
      },
    );
  } catch (err) {
    next(err);
  }
};
