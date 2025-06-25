import cron from 'node-cron';
import { deleteReadNotificationsRepo } from '../repositories/notification.repository.js';

cron.schedule('0 3 * * *', async () => {
  const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);
  await deleteReadNotificationsRepo(threeDaysAgo);
  console.log('3일 이상 읽음 처리된 알림 자동 삭제 완료');
});

// //테스트용함수 isread true고 3일 지났으면 삭제
// const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);
// deleteReadNotificationsRepo(threeDaysAgo).then(() => {
//   console.log("3일 지난 읽음 알림 삭제");
// });
