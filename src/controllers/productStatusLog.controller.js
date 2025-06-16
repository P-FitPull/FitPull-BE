import {
  createStatusLog,
  getLogsByProduct,
  updateStatusLog,
  deleteStatusLog,
} from '../services/productStatusLog.service.js';
import { getProductByIdRepo } from '../repositories/product.repository.js';
import { success } from '../utils/responseHandler.js';
import { PRODUCT_STATUS_LOG_MESSAGES } from '../constants/messages.js';
import CustomError from '../utils/customError.js';

const PRODUCT_LOG_TYPES = [
  'PRE_RENTAL',
  'ON_RENTAL',
  'DAMAGE_REPORTED',
  'WITHDRAWN',
  'STORAGE_FEE_NOTICE',
  'ETC',
];

export const createStatusLogController = async (req, res, next) => {
  try {
    const { type, notes, completedRentalId, imageUrls } = req.body;
    const { productId } = req.params;
    const userId = req.user.userId;

    const product = await getProductByIdRepo(productId);
    if (!product) {
      return next(
        new CustomError(
          404,
          'PRODUCT_NOT_FOUND',
          PRODUCT_STATUS_LOG_MESSAGES.PRODUCT_NOT_FOUND,
        ),
      );
    }

    if (product.deletedAt) {
      return next(
        new CustomError(
          400,
          'PRODUCT_DELETED',
          PRODUCT_STATUS_LOG_MESSAGES.DELETED_PRODUCT,
        ),
      );
    }

    if (!PRODUCT_LOG_TYPES.includes(type)) {
      return next(
        new CustomError(
          400,
          'INVALID_LOG_TYPE',
          `올바른 로그타입을 입력하세요: ${PRODUCT_LOG_TYPES.join(', ')}`,
        ),
      );
    }
    // S3에서 업로드된 이미지 URL 추출
    const photoUrls = Array.isArray(imageUrls) ? imageUrls : [];
    if (photoUrls.length > 5) {
      return next(
        new CustomError(
          400,
          'IMAGE_LIMIT_EXCEEDED',
          PRODUCT_STATUS_LOG_MESSAGES.IMAGE_LIMIT_EXCEEDED,
        ),
      );
    }

    const data = {
      userId,
      productId,
      type,
      photoUrls,
      notes,
    };

    if (completedRentalId) {
      data.completedRentalId = completedRentalId;
    }

    const newLog = await createStatusLog(data);

    return success(res, PRODUCT_STATUS_LOG_MESSAGES.STATUS_LOG_CREATED, {
      log: newLog,
    });
  } catch (error) {
    next(error);
  }
};

export const getStatusLogsController = async (req, res, next) => {
  try {
    const { productId } = req.params;

    const product = await getProductByIdRepo(productId);
    if (!product) {
      return next(
        new CustomError(
          404,
          'PRODUCT_NOT_FOUND',
          PRODUCT_STATUS_LOG_MESSAGES.PRODUCT_NOT_FOUND,
        ),
      );
    }

    const logs = await getLogsByProduct(productId);
    return success(res, PRODUCT_STATUS_LOG_MESSAGES.STATUS_LOG_LISTED, {
      logs,
    });
  } catch (error) {
    next(error);
  }
};

export const updateStatusLogController = async (req, res, next) => {
  try {
    const { productId, id } = req.params;
    const { type, notes, completedRentalId, imageUrls } = req.body;

    // 상품 존재 여부 확인
    const product = await getProductByIdRepo(productId);
    if (!product) {
      return next(
        new CustomError(
          404,
          'PRODUCT_NOT_FOUND',
          PRODUCT_STATUS_LOG_MESSAGES.PRODUCT_NOT_FOUND,
        ),
      );
    }

    if (product.deletedAt) {
      return next(
        new CustomError(
          400,
          'PRODUCT_DELETED',
          PRODUCT_STATUS_LOG_MESSAGES.DELETED_PRODUCT,
        ),
      );
    }

    // 로그 타입 유효성 검사
    if (type && !PRODUCT_LOG_TYPES.includes(type)) {
      return next(
        new CustomError(
          400,
          'INVALID_LOG_TYPE',
          `올바른 로그타입을 입력하세요: ${PRODUCT_LOG_TYPES.join(', ')}`,
        ),
      );
    }

    // 이미지 URL 처리
    const photoUrls = Array.isArray(imageUrls) ? imageUrls : [];

    // 수정할 데이터 구성
    const data = {};
    if (type !== undefined) data.type = type;
    if (notes !== undefined) data.notes = notes;
    if (completedRentalId !== undefined)
      data.completedRentalId = completedRentalId;
    if (photoUrls.length > 0) data.photoUrls = photoUrls;

    if (Object.keys(data).length === 0) {
      return next(
        new CustomError(400, 'NO_UPDATE_DATA', '수정할 데이터가 없습니다.'),
      );
    }

    const updated = await updateStatusLog(id, data);
    return success(res, PRODUCT_STATUS_LOG_MESSAGES.STATUS_LOG_UPDATED, {
      log: updated,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteStatusLogController = async (req, res, next) => {
  try {
    const { id } = req.params;
    await deleteStatusLog(id);
    return success(res, PRODUCT_STATUS_LOG_MESSAGES.STATUS_LOG_DELETED);
  } catch (error) {
    next(error);
  }
};
