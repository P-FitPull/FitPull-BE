import { Server } from 'socket.io';

let io;

export const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
    },
  });

  io.on('connection', (socket) => {
    socket.on('register', (userId) => {
      socket.join(userId);
    });

    socket.on('disconnect', () => {
      // 연결 종료 시 별도 처리 필요시만 작성
    });
  });
};

export const getIO = () => {
  if (!io) throw new Error('Socket.IO 초기화 안됨');
  return io;
};
