import prisma from '../data-source.js';

export const createNotificationRepo = async (data) => {
  return await prisma.notification.create({ data });
};

export const getNotificationsByUserRepo = async (userId) => {
  return await prisma.notification.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    take: 10,
  });
};

export const markNotificationAsReadRepo = async (id) => {
  return await prisma.notification.update({
    where: { id },
    data: {
      isRead: true,
      readAt: new Date(),
    },
  });
};

export const deleteReadNotificationsRepo = async (date) => {
  return await prisma.notification.deleteMany({
    where: {
      isRead: true,
      readAt: { lte: date },
    },
  });
};
