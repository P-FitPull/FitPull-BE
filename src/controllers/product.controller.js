import {
  createProduct,
  getAllProducts,
  getProductById,
  getProductsByUser,
  updateProduct,
  deleteProduct,
  getWaitingProducts,
  approveProduct,
  rejectProduct,
} from '../services/product.service.js';
import { PRODUCT_MESSAGES } from '../constants/messages.js';
import { success } from '../utils/responseHandler.js';
import CustomError from '../utils/customError.js';

export const createProductController = async (req, res, next) => {
  try {
    const product = await createProduct(req.body, req.user);
    return success(res, PRODUCT_MESSAGES.PRODUCT_CREATED, product);
  } catch (error) {
    next(error);
  }
};

export const getAllProductsController = async (req, res, next) => {
  try {
    const { skip, take, categoryId } = req.query;
    const products = await getAllProducts({
      skip: skip ? Number(skip) : undefined,
      take: take ? Number(take) : undefined,
      categoryId,
    });
    return success(res, PRODUCT_MESSAGES.PRODUCT_LISTED, products);
  } catch (error) {
    next(error);
  }
};

export const getProductByIdController = async (req, res, next) => {
  try {
    const product = await getProductById(req.params.id);
    return success(res, PRODUCT_MESSAGES.PRODUCT_DETAIL, product);
  } catch (error) {
    if (error.code === 'PRODUCT_NOT_FOUND') {
      return next(error);
    }
    next(error);
  }
};

export const getProductsMeController = async (req, res, next) => {
  try {
    if (!req.user || !req.user.id) {
      return next(
        new CustomError(401, 'AUTH_REQUIRED', PRODUCT_MESSAGES.AUTH_REQUIRED),
      );
    }
    const products = await getProductsByUser(req.user.id);
    if (!products || products.length === 0) {
      return next(
        new CustomError(
          404,
          'PRODUCT_NOT_FOUND',
          PRODUCT_MESSAGES.PRODUCT_NOT_FOUND,
        ),
      );
    }
    return success(res, PRODUCT_MESSAGES.PRODUCT_LISTED, { products });
  } catch (error) {
    next(error);
  }
};

export const updateProductController = async (req, res, next) => {
  try {
    const { id } = req.params;
    const productData = req.body;
    const user = req.user;

    // 데이터 타입 변환
    if (productData.allowPurchase !== undefined) {
      productData.allowPurchase =
        productData.allowPurchase === true ||
        productData.allowPurchase === 'true';
    }
    if (productData.purchasePrice !== undefined) {
      productData.purchasePrice = Number(productData.purchasePrice);
    }
    if (productData.price !== undefined) {
      productData.price = Number(productData.price);
    }

    // 이미지 URL 처리
    let currentImageUrls = [];
    if (typeof productData.imageUrls === 'string') {
      currentImageUrls = productData.imageUrls
        ? productData.imageUrls.split(',')
        : [];
    } else if (Array.isArray(productData.imageUrls)) {
      currentImageUrls = productData.imageUrls;
    }

    // 새로 업로드된 이미지 추가
    if (req.files && Array.isArray(req.files)) {
      const newImageUrls = req.files.map((file) => file.location);
      currentImageUrls = [...currentImageUrls, ...newImageUrls];
    }

    // 빈 값 제거 후 최종 이미지 URL 배열 설정
    productData.imageUrls = currentImageUrls.filter(Boolean);

    // categoryId 빈 문자열 처리
    if (productData.categoryId === '') {
      productData.categoryId = undefined;
    }

    const updatedProduct = await updateProduct(id, productData, user);
    return success(res, PRODUCT_MESSAGES.PRODUCT_UPDATED, {
      product: updatedProduct,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteProductController = async (req, res, next) => {
  try {
    const { id } = req.params;
    const user = req.user;

    await deleteProduct(id, user);
    return success(res, PRODUCT_MESSAGES.PRODUCT_DELETED);
  } catch (error) {
    next(error);
  }
};

export const getWaitingProductsController = async (_req, res, next) => {
  try {
    const products = await getWaitingProducts();
    return success(res, PRODUCT_MESSAGES.PRODUCT_WAITING_LISTED, { products });
  } catch (error) {
    next(error);
  }
};

export const approveProductController = async (req, res, next) => {
  try {
    const result = await approveProduct(req.params.id);
    return success(res, PRODUCT_MESSAGES.PRODUCT_APPROVED, result);
  } catch (error) {
    next(error);
  }
};

export const rejectProductController = async (req, res, next) => {
  try {
    const result = await rejectProduct(req.params.id);
    return success(res, PRODUCT_MESSAGES.PRODUCT_REJECTED, result);
  } catch (error) {
    next(error);
  }
};
