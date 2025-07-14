import { success } from '../utils/responseHandler.js';
import { PACKAGE_MESSAGES } from '../constants/messages.js';
import {
  createPackageCompletedRental,
  getMyPackageCompletedRentals,
  getAllPackageCompletedRentals,
} from '../services/packageCompletedRental.service.js';

export const createPackageCompletedRentalController = async (
  req,
  res,
  next,
) => {
  try {
    const { packageRentalRequestId } = req.params;
    const result = await createPackageCompletedRental(packageRentalRequestId);
    return success(res, PACKAGE_MESSAGES.PACKAGE_RENTAL_COMPLETED, result);
  } catch (err) {
    next(err);
  }
};

export const getMyPackageCompletedRentalsController = async (
  req,
  res,
  next,
) => {
  try {
    const userId = req.user.id;
    const result = await getMyPackageCompletedRentals(userId);
    return success(
      res,
      PACKAGE_MESSAGES.PACKAGE_RENTAL_COMPLETED_LISTED,
      result,
    );
  } catch (err) {
    next(err);
  }
};

export const getAllPackageCompletedRentalsController = async (
  req,
  res,
  next,
) => {
  try {
    const result = await getAllPackageCompletedRentals();
    return success(
      res,
      PACKAGE_MESSAGES.ALL_PACKAGE_RENTAL_COMPLETED_LISTED,
      result,
    );
  } catch (err) {
    next(err);
  }
};
