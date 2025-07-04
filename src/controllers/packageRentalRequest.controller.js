import { createPackageRentalRequest } from '../services/packageRentalRequest.service.js';
import {
  getPackageRentalRequestByIdRepo,
  getMyPackageRentalRequestsRepo,
} from '../repositories/packageRentalRequest.repository.js';
import { success } from '../utils/responseHandler.js';
import { PACKAGE_MESSAGES } from '../constants/messages.js';

export const createPackageRentalRequestController = async (req, res, next) => {
  try {
    const { packageId, startDate, endDate, howToReceive, memo } = req.body;
    const userId = req.user.id;
    const result = await createPackageRentalRequest({
      userId,
      packageId,
      startDate,
      endDate,
      howToReceive,
      memo,
    });
    return success(
      res,
      PACKAGE_MESSAGES.PACKAGE_RENTAL_REQUEST_CREATED,
      result,
    );
  } catch (error) {
    next(error);
  }
};

export const getMyPackageRentalRequestsController = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const result = await getMyPackageRentalRequestsRepo(userId);
    return success(res, PACKAGE_MESSAGES.PACKAGE_RENTAL_REQUEST_LISTED, result);
  } catch (error) {
    next(error);
  }
};

export const getPackageRentalRequestByIdController = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const result = await getPackageRentalRequestByIdRepo(id, userId);
    if (!result)
      return res.status(404).json({ message: '요청 정보를 찾을 수 없습니다.' });
    return success(
      res,
      PACKAGE_MESSAGES.PACKAGE_RENTAL_REQUEST_FETCHED,
      result,
    );
  } catch (error) {
    next(error);
  }
};
