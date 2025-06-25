import { getIO } from '../sockets/socket.js';

export const sendNotification = (userId, payload) => {
  const io = getIO();
  io.to(userId).emit('newNotification', payload); // 해당 유저에게만 emit
};
