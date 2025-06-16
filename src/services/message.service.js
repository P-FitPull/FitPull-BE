import {
  createMessage,
  findReceivedMessages,
  findSentMessages,
  markAsRead,
  markAllAsRead,
  softDeleteMessage,
  getAdminId,
} from '../repositories/message.repository.js';
import CustomError from '../utils/customError.js';
import { MESSAGE_RESPONSES } from '../constants/messages.js';
import { getProductByIdRepo } from '../repositories/product.repository.js';
import { createNotification } from './notification.service.js';
import { NOTIFICATION_MESSAGES } from '../constants/messages.js';
import { findUserById } from '../repositories/user.repository.js';

//메세지 전송
export const sendMessage = async ({
  senderId,
  receiverId,
  content,
  productId,
  senderRole,
}) => {
  if (!content || !receiverId) {
    throw new CustomError(
      400,
      'INVALID_MESSAGE',
      MESSAGE_RESPONSES.INVALID_MESSAGE,
    );
  }

  // productId 유효성 체크
  if (productId) {
    const product = await getProductByIdRepo(productId);
    if (!product) {
      throw new CustomError(
        400,
        'PRODUCT_NOT_FOUND',
        MESSAGE_RESPONSES.PRODUCT_NOT_FOUND,
      );
    }
  }

  let adminId;
  try {
    adminId = await getAdminId();
  } catch {
    throw new CustomError(
      500,
      'ADMIN_NOT_FOUND',
      MESSAGE_RESPONSES.ADMIN_NOT_FOUND,
    );
  }

  // USER → ADMIN만 허용
  if (senderRole === 'USER') {
    if (receiverId !== adminId) {
      throw new CustomError(403, 'FORBIDDEN', MESSAGE_RESPONSES.FORBIDDEN);
    }
  }
  // ADMIN → USER만 허용
  else if (senderRole === 'ADMIN') {
    const user = await findUserById(receiverId);
    if (!user || user.role !== 'USER') {
      throw new CustomError(403, 'FORBIDDEN', MESSAGE_RESPONSES.FORBIDDEN_USER);
    }
  } else {
    throw new CustomError(403, 'FORBIDDEN', MESSAGE_RESPONSES.FORBIDDEN_ADMIN);
  }

  const message = await createMessage({
    senderId,
    receiverId,
    content,
    productId,
  });

  // === 운영자가 유저에게 보낼 때만 알림 생성 ===
  if (senderRole === 'ADMIN') {
    await createNotification({
      userId: receiverId,
      type: 'CHAT',
      message: NOTIFICATION_MESSAGES.ADMIN_MESSAGE,
      url: `/messages/${message.id}`,
      messageId: message.id,
      productId: productId || undefined,
    });
  }

  return { id: message.id };
};

//받은 목록조회
export const getReceivedMessages = async (userId, userRole) => {
  let adminId;
  try {
    adminId = await getAdminId();
  } catch {
    throw new CustomError(
      500,
      'ADMIN_NOT_FOUND',
      MESSAGE_RESPONSES.ADMIN_NOT_FOUND,
    );
  }
  let messages = await findReceivedMessages(userId);
  if (userRole === 'USER') {
    messages = messages.filter((msg) => msg.sender.id === adminId);
  } else if (userRole === 'ADMIN') {
    messages = messages.filter((msg) => msg.sender.id !== adminId); // ADMIN이 보낸 메시지는 제외
  } else {
    throw new CustomError(403, 'FORBIDDEN', MESSAGE_RESPONSES.FORBIDDEN_ADMIN);
  }
  return messages;
};

// 보낸목록조회
export const getSentMessages = async (userId, userRole) => {
  let adminId;
  try {
    adminId = await getAdminId();
  } catch {
    throw new CustomError(
      500,
      'ADMIN_NOT_FOUND',
      MESSAGE_RESPONSES.ADMIN_NOT_FOUND,
    );
  }
  let messages = await findSentMessages(userId);
  if (userRole === 'USER') {
    messages = messages.filter((msg) => msg.receiver.id === adminId);
  } else if (userRole === 'ADMIN') {
    messages = messages.filter((msg) => msg.receiver.id !== adminId); // ADMIN이 보낸 메시지는 제외
  } else {
    throw new CustomError(403, 'FORBIDDEN', MESSAGE_RESPONSES.FORBIDDEN_ADMIN);
  }
  return messages;
};

// 단건읽음하기
export const markMessageRead = async (messageId, userId) => {
  const result = await markAsRead(messageId, userId);
  if (result.count === 0) {
    throw new CustomError(
      404,
      'MESSAGE_NOT_FOUND',
      MESSAGE_RESPONSES.MESSAGE_NOT_FOUND,
    );
  }
  return;
};

// 전체읽음하기
export const markAllMessagesRead = async (userId) => {
  await markAllAsRead(userId);
  return;
};

export const deleteMessage = async (messageId, userId) => {
  const result = await softDeleteMessage(messageId, userId);
  if (result.count === 0) {
    throw new CustomError(
      404,
      'MESSAGE_NOT_FOUND',
      MESSAGE_RESPONSES.MESSAGE_NOT_FOUND,
    );
  }
  return;
};
