import swaggerJSDoc from 'swagger-jsdoc';
import dotenv from 'dotenv';

dotenv.config();

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Fitpull Overflow API Docs',
      version: '1.0.0',
      description: '핏풀 오버플로우 MVP API 문서입니다.',
    },
    servers: [
      {
        url: process.env.SWAGGER_SERVER_URL || 'http://localhost:3000',
      },
    ],
    tags: [
      { name: 'Auth', description: '인증 관련 API' },
      { name: 'User', description: '내 정보 관리 API' },
      { name: 'Product', description: '상품 관련 API' },
      { name: 'Category', description: '카테고리 관련 API' },
      { name: 'RentalRequest', description: '상품 대여 요청 관련 API' },
      { name: 'CompletedRental', description: '대여 완료 처리 관련 API' },
      { name: 'ProductStatusLog', description: '상품 상태 로그 관련 API' },
      { name: 'Review', description: '리뷰 관련 API' },
      { name: 'Message', description: '문의/답변(Q&A) 메시지 API' },
      { name: 'Notification', description: '알림 관련 API' },
      { name: 'AI', description: 'AI 기능 관련 API' },
      { name: 'Payment', description: '가상 잔고 충전/차감 API' },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
    security: [{ bearerAuth: [] }],
  },
  apis: ['./src/routes/*.js'],
};

const swaggerSpec = swaggerJSDoc(options);
export default swaggerSpec;
