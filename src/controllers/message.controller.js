import {
  sendMessage,
  getReceivedMessages,
  getSentMessages,
  markMessageRead,
  markAllMessagesRead,
  deleteMessage,
} from '../services/message.service.js';
import { success } from '../utils/responseHandler.js';
import { MESSAGE_RESPONSES } from '../constants/messages.js';

export const sendMessageController = async (req, res, next) => {
  try {
    const { id: senderId, role: senderRole } = req.user;
    const { receiverId, content, productId } = req.body;
    const result = await sendMessage({
      senderId,
      receiverId,
      content,
      productId,
      senderRole,
    });
    return success(res, MESSAGE_RESPONSES.SEND_SUCCESS, result);
  } catch (error) {
    next(error);
  }
};

export const getReceivedMessagesController = async (req, res, next) => {
  try {
    const { id: userId, role: userRole } = req.user;
    const messages = await getReceivedMessages(userId, userRole);
    return success(res, MESSAGE_RESPONSES.FETCH_SUCCESS, messages);
  } catch (error) {
    next(error);
  }
};

export const getSentMessagesController = async (req, res, next) => {
  try {
    const { id: userId, role: userRole } = req.user;
    const messages = await getSentMessages(userId, userRole);
    return success(res, MESSAGE_RESPONSES.FETCH_SUCCESS, messages);
  } catch (error) {
    next(error);
  }
};

export const markMessageReadController = async (req, res, next) => {
  try {
    const { id: userId, role: userRole } = req.user;
    const { id: messageId } = req.params;
    await markMessageRead(messageId, userId, userRole);
    return success(res, MESSAGE_RESPONSES.MARK_READ);
  } catch (error) {
    next(error);
  }
};

export const markAllMessagesReadController = async (req, res, next) => {
  try {
    const { id: userId, role: userRole } = req.user;
    await markAllMessagesRead(userId, userRole);
    return success(res, MESSAGE_RESPONSES.MARK_READ);
  } catch (error) {
    next(error);
  }
};

export const deleteMessageController = async (req, res, next) => {
  try {
    const { id: userId, role: userRole } = req.user;
    const { id: messageId } = req.params;
    await deleteMessage(messageId, userId, userRole);
    return success(res, MESSAGE_RESPONSES.DELETE_SUCCESS);
  } catch (error) {
    next(error);
  }
};
