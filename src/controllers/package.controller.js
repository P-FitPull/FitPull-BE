import {
  createPackage,
  getPackageById,
  getAllPackages,
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
    console.log(error);
    next(error);
  }
};

export const getPackageByIdController = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await getPackageById(id);
    return success(res, PACKAGE_MESSAGES.PACKAGE_FETCHED, result);
  } catch (error) {
    next(error);
  }
};

export const getAllPackagesController = async (req, res, next) => {
  try {
    const result = await getAllPackages();
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
