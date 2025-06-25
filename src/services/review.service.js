import {
  createReviewRepo,
  getReviewByIdRepo,
  getReviewsByProductIdRepo,
  checkOneRentalOneReviewRepo,
  getCompletedRentalByUserRepo,
  updateReviewRepo,
  deleteReviewRepo,
} from '../repositories/review.repository.js';
import { REVIEW_MESSAGES } from '../constants/messages.js';
import { findProductByIdRepo } from '../repositories/product.repository.js';
import CustomError from '../utils/customError.js';
import { createNotification } from './notification.service.js';
import { NOTIFICATION_MESSAGES } from '../constants/messages.js';

// 이름 마스킹 함수
export function maskName(name) {
  if (!name) return '';
  if (name.length <= 1) return '*';
  return name[0] + '*'.repeat(name.length - 1);
}

export const createReview = async (
  user,
  { rating, comment, imageUrls, completedRentalId, productId },
) => {
  const ratingInt = Number(rating);
  if (!completedRentalId || !productId || !ratingInt) {
    throw new CustomError(
      400,
      'RENTAL_NOT_FOUND',
      REVIEW_MESSAGES.RENTAL_NOT_FOUND,
    );
  }
  if (ratingInt < 1 || ratingInt > 5) {
    throw new CustomError(
      400,
      'INVALID_RATING',
      REVIEW_MESSAGES.INVALID_RATING,
    );
  }
  if (imageUrls && imageUrls.length > 3) {
    throw new CustomError(
      400,
      'IMAGE_LIMIT_EXCEEDED',
      REVIEW_MESSAGES.IMAGE_LIMIT_EXCEEDED,
    );
  }
  // 이미 리뷰 작성했는지 체크
  const exists = await checkOneRentalOneReviewRepo(user.id, completedRentalId);
  if (exists) {
    throw new CustomError(
      400,
      'ALREADY_REVIEWED',
      REVIEW_MESSAGES.ALREADY_REVIEWED,
    );
  }
  // 본인 대여건인지 확인
  const rental = await getCompletedRentalByUserRepo(user.id, completedRentalId);
  if (!rental) {
    throw new CustomError(
      403,
      'ONLY_COMPLETED_RENTAL',
      REVIEW_MESSAGES.ONLY_COMPLETED_RENTAL,
    );
  }
  const product = await findProductByIdRepo(productId);
  if (!product || product.deletedAt) {
    throw new CustomError(
      404,
      'PRODUCT_NOT_FOUND',
      REVIEW_MESSAGES.PRODUCT_NOT_FOUND,
    );
  }

  const review = await createReviewRepo({
    rating: ratingInt,
    comment,
    imageUrls: imageUrls || [],
    userId: user.id,
    completedRentalId,
    productId,
  });

  // === 알림 생성 및 소켓 전송 ===
  if (product && product.ownerId && product.ownerId !== user.id) {
    await createNotification({
      userId: product.ownerId,
      type: 'REVIEW',
      message: `${NOTIFICATION_MESSAGES.REVIEW_CREATED} [${product.title}]`,
      url: `/products/${productId}`,
      productId,
      reviewId: review.id,
    });
  }

  return review;
};

export const getReviewsByProduct = async (productId) => {
  // 상품 존재 여부 체크
  const product = await findProductByIdRepo(productId);
  if (!product || product.deletedAt) {
    throw new CustomError(
      404,
      'PRODUCT_NOT_FOUND',
      REVIEW_MESSAGES.PRODUCT_NOT_FOUND,
    );
  }
  // 마스킹 유저명만 반환 ex) 유승엽 -> 유**
  const reviews = await getReviewsByProductIdRepo(productId);
  return reviews.map((review) => ({
    rating: review.rating,
    comment: review.comment ? review.comment.slice(0, 15) : '',
    user: { name: maskName(review.user?.name) },
  }));
};

export const getReviewById = async (id) => {
  return await getReviewByIdRepo(id);
};

export const updateReview = async (
  user,
  id,
  { rating, comment, imageUrls },
) => {
  const review = await getReviewByIdRepo(id);
  if (!review || review.deletedAt) {
    throw new CustomError(
      404,
      'REVIEW_NOT_FOUND',
      REVIEW_MESSAGES.REVIEW_NOT_FOUND,
    );
  }
  if (review.userId !== user.id && user.role !== 'ADMIN') {
    throw new CustomError(
      403,
      'ONLY_OWN_REVIEW',
      REVIEW_MESSAGES.ONLY_OWN_REVIEW,
    );
  }
  let ratingInt;
  if (rating !== undefined) {
    ratingInt = Number(rating);
    if (isNaN(ratingInt) || ratingInt < 1 || ratingInt > 5) {
      throw new CustomError(
        400,
        'INVALID_RATING',
        REVIEW_MESSAGES.INVALID_RATING,
      );
    }
  }
  if (imageUrls && imageUrls.length > 3) {
    throw new CustomError(
      400,
      'IMAGE_LIMIT_EXCEEDED',
      REVIEW_MESSAGES.IMAGE_LIMIT_EXCEEDED,
    );
  }
  return await updateReviewRepo(id, {
    ...(rating !== undefined && { rating: ratingInt }),
    ...(comment !== undefined && { comment }),
    ...(imageUrls !== undefined && { imageUrls }),
  });
};

export const deleteReview = async (user, id) => {
  const review = await getReviewByIdRepo(id);
  if (!review || review.deletedAt) {
    throw new CustomError(
      404,
      'REVIEW_NOT_FOUND',
      REVIEW_MESSAGES.REVIEW_NOT_FOUND,
    );
  }
  if (review.userId !== user.id && user.role !== 'ADMIN') {
    throw new CustomError(
      403,
      'ONLY_OWN_DELETE',
      REVIEW_MESSAGES.ONLY_OWN_DELETE,
    );
  }
  return await deleteReviewRepo(id);
};
