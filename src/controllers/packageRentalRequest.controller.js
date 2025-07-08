import { success } from '../utils/responseHandler.js';
import { PACKAGE_MESSAGES } from '../constants/messages.js';
import {
  getMyPackageRentalRequests,
  getPendingPackageRentalRequests,
  approvePackageRentalRequest,
  rejectPackageRentalRequestByAdmin,
  createPackageRentalRequest,
  cancelPackageRentalRequest,
} from '../services/packageRentalRequest.service.js';

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

export const cancelPackageRentalRequestController = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const result = await cancelPackageRentalRequest(id, userId);
    return success(
      res,
      PACKAGE_MESSAGES.PACKAGE_RENTAL_REQUEST_CANCELED,
      result,
    );
  } catch (error) {
    console.log(error);
    next(error);
  }
};

export const approvePackageRentalRequestController = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await approvePackageRentalRequest(id);
    return success(
      res,
      PACKAGE_MESSAGES.PACKAGE_RENTAL_REQUEST_APPROVED,
      result,
    );
  } catch (error) {
    console.log(error);
    next(error);
  }
};

export const rejectPackageRentalRequestByAdminController = async (
  req,
  res,
  next,
) => {
  try {
    const { id } = req.params;
    const result = await rejectPackageRentalRequestByAdmin(id);
    return success(
      res,
      PACKAGE_MESSAGES.PACKAGE_RENTAL_REQUEST_REJECTED,
      result,
    );
  } catch (error) {
    next(error);
  }
};

export const getMyPackageRentalRequestsListController = async (
  req,
  res,
  next,
) => {
  try {
    const userId = req.user.id;
    const result = await getMyPackageRentalRequests(userId);
    return success(res, PACKAGE_MESSAGES.PACKAGE_RENTAL_REQUEST_LISTED, result);
  } catch (error) {
    next(error);
  }
};

export const getPendingPackageRentalRequestsController = async (
  req,
  res,
  next,
) => {
  try {
    const result = await getPendingPackageRentalRequests();
    return success(res, PACKAGE_MESSAGES.PACKAGE_RENTAL_REQUEST_LISTED, result);
  } catch (error) {
    next(error);
  }
};
