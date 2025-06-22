import cron from 'node-cron';
import { findProductsForStorageFee } from '../services/product.service.js';
import { chargeStorageFee } from '../services/payment.service.js';
import { createNotification } from '../services/notification.service.js';
import { NOTIFICATION_MESSAGES } from '../constants/messages.js';
import { STORAGE_FEE_CHECK_DAYS } from '../constants/policy.js';

cron.schedule('0 0 * * *', async () => {
  console.log('보관료 정산 스케줄러 실행');
  try {
    const products = await findProductsForStorageFee(STORAGE_FEE_CHECK_DAYS);

    if (products.length === 0) {
      console.log('보관료 부과 대상 상품이 없습니다.');
      return;
    }

    console.log(`보관료 부과 대상 상품 ${products.length}건 처리 시작`);

    for (const product of products) {
      try {
        await chargeStorageFee(
          product.owner.id,
          product.id,
          product.price,
          product.title,
        );

        await createNotification({
          userId: product.owner.id,
          type: 'STORAGE_FEE',
          message: `[${product.title}] ${NOTIFICATION_MESSAGES.STORAGE_FEE_CHARGED}`,
          url: `/products/${product.id}`,
          productId: product.id,
        });

        console.log(
          `'${product.title}' (ID: ${product.id}) 상품 보관료 정산 완료.`,
        );
      } catch (error) {
        console.error(
          `'${product.title}' (ID: ${product.id}) 상품 보관료 정산 실패:`,
          error,
        );
      }
    }
    console.log('보관료 정산 스케줄러 실행 완료');
  } catch (error) {
    console.error('보관료 정산 스케줄러 실행 중 오류 발생:', error);
  }
});
