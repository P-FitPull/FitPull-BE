import {
  createPackage,
  getPackage,
  getPackages,
  updatePackage,
  deletePackage,
} from '../services/package.service.js';
import { success } from '../utils/responseHandler.js';
import { PACKAGE_MESSAGES } from '../constants/messages.js';

export const createPackageController = async (req, res, next) => {
  try {
    const { title, description, productIds, isFeatured, discountRate } =
      req.body;
    const createdBy = req.user.id;
    const result = await createPackage({
      title,
      description,
      productIds,
      createdBy,
      isFeatured,
      discountRate,
    });
    return success(res, PACKAGE_MESSAGES.PACKAGE_CREATED, result);
  } catch (error) {
    next(error);
  }
};

export const getPackageController = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await getPackage(id);
    return success(res, PACKAGE_MESSAGES.PACKAGE_FETCHED, result);
  } catch (error) {
    next(error);
  }
};

export const getPackagesController = async (req, res, next) => {
  try {
    const result = await getPackages();
    return success(res, PACKAGE_MESSAGES.PACKAGE_LIST_FETCHED, result);
  } catch (error) {
    next(error);
  }
};

export const updatePackageController = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await updatePackage(id, req.body);
    return success(res, PACKAGE_MESSAGES.PACKAGE_UPDATED, result);
  } catch (error) {
    next(error);
  }
};

export const deletePackageController = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await deletePackage(id);
    return success(res, PACKAGE_MESSAGES.PACKAGE_DELETED, result);
  } catch (error) {
    next(error);
  }
};
