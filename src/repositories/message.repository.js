import prisma from '../data-source.js';

export const createMessage = ({ senderId, receiverId, content, productId }) => {
  return prisma.message.create({
    data: {
      content,
      senderId,
      receiverId,
      productId,
    },
  });
};

export const findReceivedMessages = (userId) => {
  return prisma.message.findMany({
    where: {
      receiverId: userId,
      deletedAt: null,
    },
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      content: true,
      isRead: true,
      sender: {
        select: { id: true, name: true },
      },
      product: {
        select: { id: true, title: true },
      },
    },
  });
};

export const findSentMessages = (userId) => {
  return prisma.message.findMany({
    where: {
      senderId: userId,
      deletedAt: null,
    },
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      content: true,
      isRead: true,
      receiver: {
        select: { id: true, name: true },
      },
      product: {
        select: { id: true, title: true },
      },
    },
  });
};

// 단건 읽음 처리 (본인이 receiver인 경우만)
export const markAsRead = (messageId, userId) => {
  return prisma.message.updateMany({
    where: {
      id: messageId,
      receiverId: userId,
      deletedAt: null,
    },
    data: {
      isRead: true,
    },
  });
};

export const markAllAsRead = (userId) => {
  return prisma.message.updateMany({
    where: {
      receiverId: userId,
      isRead: false,
      deletedAt: null,
    },
    data: {
      isRead: true,
    },
  });
};

export const softDeleteMessage = (messageId, userId) => {
  return prisma.message.updateMany({
    where: {
      id: messageId,
      OR: [{ senderId: userId }, { receiverId: userId }],
      deletedAt: null,
    },
    data: {
      deletedAt: new Date(),
    },
  });
};

//관리자 찾기
export const getAdminId = async () => {
  const admin = await prisma.user.findFirst({ where: { role: 'ADMIN' } });
  if (!admin) throw new Error('ADMIN_NOT_FOUND');
  return admin.id;
};
