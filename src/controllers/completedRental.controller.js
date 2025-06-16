import {
  completeRental,
  getMyCompletedRentals,
  getAllCompletedRentals,
} from '../services/completedRental.service.js';
import { success } from '../utils/responseHandler.js';
import { COMPLETED_RENTAL_MESSAGES } from '../constants/messages.js';

export const completeRentalController = async (req, res, next) => {
  try {
    const rentalRequestId = req.params.id;
    const completed = await completeRental(rentalRequestId);
    return success(res, COMPLETED_RENTAL_MESSAGES.RENTAL_COMPLETED, {
      completedRental: completed,
    });
  } catch (err) {
    next(err);
  }
};

export const getMyCompletedRentalsController = async (req, res, next) => {
  try {
    const result = await getMyCompletedRentals(req.user.id);
    return success(res, COMPLETED_RENTAL_MESSAGES.MY_COMPLETED_RENTALS_LISTED, {
      completedRentals: result,
    });
  } catch (err) {
    next(err);
  }
};

export const getAllCompletedRentalsController = async (_req, res, next) => {
  try {
    const result = await getAllCompletedRentals();
    return success(
      res,
      COMPLETED_RENTAL_MESSAGES.ALL_COMPLETED_RENTALS_LISTED,
      { completedRentals: result },
    );
  } catch (err) {
    next(err);
  }
};
