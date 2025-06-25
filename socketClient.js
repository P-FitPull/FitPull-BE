import { io } from 'socket.io-client';

const socket = io('http://127.0.0.1:3000', {
  transports: ['websocket', 'polling'],
});

socket.on('connect', () => {
  // 실제 테스트 시 필요한 userId로 변경
  socket.emit('register', '3c283e3b-84a9-4ac5-af5a-ed5e0d6696bc');
});

socket.on('newNotification', (payload) => {
  console.log('알림 도착:', payload);
});
