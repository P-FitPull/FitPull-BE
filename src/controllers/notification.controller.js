import {
  createNotification,
  getMyNotifications,
  markAsRead,
} from '../services/notification.service.js';
import { NOTIFICATION_MESSAGES } from '../constants/messages.js';

export const sendTestNotification = async (req, res, next) => {
  try {
    const { userId, type, message, url } = req.body;

    if (!userId || !type || !message) {
      return res.status(400).json({ error: 'userId, type, message 필수' });
    }

    const result = await createNotification({ userId, type, message, url });
    return res
      .status(200)
      .json({
        success: true,
        message: NOTIFICATION_MESSAGES.SEND_SUCCESS,
        notification: result,
      });
  } catch (err) {
    next(err);
  }
};

export const getNotificationList = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const notifications = await getMyNotifications(userId);
    return res
      .status(200)
      .json({
        success: true,
        message: NOTIFICATION_MESSAGES.FETCH_SUCCESS,
        notifications,
      });
  } catch (err) {
    next(err);
  }
};

export const markNotificationRead = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updated = await markAsRead(id);
    return res.status(200).json({
      success: true,
      message: NOTIFICATION_MESSAGES.MARK_READ_SUCCESS,
      notification: updated,
    });
  } catch (err) {
    next(err);
  }
};
