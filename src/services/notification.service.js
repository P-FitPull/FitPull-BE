/* eslint-disable no-unused-vars */
import {
  createNotificationRepo,
  getNotificationsByUserRepo,
  markNotificationAsReadRepo,
} from '../repositories/notification.repository.js';
import { findUserById } from '../repositories/user.repository.js';
import { sendNotification } from '../utils/notify.js';
import CustomError from '../utils/customError.js';
import { NOTIFICATION_MESSAGES } from '../constants/messages.js';

// 알림 생성 및 실시간 전송
const VALID_TYPES = [
  'SYSTEM',
  'APPROVAL',
  'RENTAL_STATUS',
  'CHAT',
  'FEE',
  'REVIEW',
  'PURCHASE',
  'PURCHASE_CANCEL',
  'ETC',
];

export const createNotification = async ({
  userId,
  type,
  message,
  url,
  productId,
  rentalRequestId,
}) => {
  // userId 체크
  const user = await findUserById(userId);
  if (!user) {
    throw new CustomError(
      404,
      'USER_NOT_FOUND',
      NOTIFICATION_MESSAGES.USER_NOT_FOUND,
    );
  }
  // type 체크
  if (!VALID_TYPES.includes(type)) {
    throw new CustomError(
      400,
      'INVALID_NOTIFICATION_TYPE',
      NOTIFICATION_MESSAGES.INVALID_TYPE,
    );
  }
  // message 체크
  if (!message) {
    throw new CustomError(
      400,
      'INVALID_MESSAGE',
      NOTIFICATION_MESSAGES.INVALID_MESSAGE,
    );
  }

  const notification = await createNotificationRepo({
    userId,
    type,
    message,
    url,
    productId,
    rentalRequestId,
  });

  sendNotification(userId, {
    id: notification.id,
    type,
    message,
    url,
    createdAt: notification.createdAt,
  });

  return notification;
};

export const getMyNotifications = async (userId) => {
  const notifications = await getNotificationsByUserRepo(userId);
  return notifications.map((notification) => {
    const result = {
      id: notification.id,
      type: notification.type,
      message: notification.message,
      url: notification.url,
      isRead: notification.isRead,
      createdAt: notification.createdAt,
      userId: notification.userId,
      productId: notification.productId,
    };
    if (notification.rentalRequestId)
      result.rentalRequestId = notification.rentalRequestId;
    if (notification.reviewId) result.reviewId = notification.reviewId;
    if (notification.messageId) result.messageId = notification.messageId;
    if (notification.productStatusLogId)
      result.productStatusLogId = notification.productStatusLogId;
    if (notification.readAt) result.readAt = notification.readAt;
    return result;
  });
};

export const markAsRead = async (id) => {
  try {
    const updated = await markNotificationAsReadRepo(id);
    if (!updated) {
      throw new CustomError(
        404,
        'NOTIFICATION_NOT_FOUND',
        NOTIFICATION_MESSAGES.NOTIFICATION_NOT_FOUND,
      );
    }
    const result = {
      id: updated.id,
      type: updated.type,
      message: updated.message,
      url: updated.url,
      isRead: updated.isRead,
      createdAt: updated.createdAt,
      userId: updated.userId,
      productId: updated.productId,
    };
    if (updated.rentalRequestId)
      result.rentalRequestId = updated.rentalRequestId;
    if (updated.reviewId) result.reviewId = updated.reviewId;
    if (updated.messageId) result.messageId = updated.messageId;
    if (updated.productStatusLogId)
      result.productStatusLogId = updated.productStatusLogId;
    if (updated.readAt) result.readAt = updated.readAt;
    return result;
  } catch (err) {
    throw new CustomError(
      404,
      'NOTIFICATION_NOT_FOUND',
      NOTIFICATION_MESSAGES.NOTIFICATION_NOT_FOUND,
    );
  }
};
