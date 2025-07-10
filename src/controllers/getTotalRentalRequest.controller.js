import { getTotalRentalRequestsByUser } from '../services/getTotalRentalRequest.service.js';
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
