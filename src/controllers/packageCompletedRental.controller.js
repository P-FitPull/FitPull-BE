import { createPackageCompletedRental } from '../services/packageCompletedRental.service.js';
import { success } from '../utils/responseHandler.js';
import { PACKAGE_MESSAGES } from '../constants/messages.js';

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
