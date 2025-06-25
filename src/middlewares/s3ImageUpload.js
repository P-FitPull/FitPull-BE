import upload from './upload.js';
import { uploadToS3 } from '../utils/s3.js';
import { MAX_PRODUCT_IMAGES } from '../constants/limits.js';
import CustomError from '../utils/customError.js';

// 여러 장 이미지 업로드 및 S3 저장 미들웨어
export const s3ImageUpload = [
  (req, res, next) => {
    upload.array('images', MAX_PRODUCT_IMAGES)(req, res, function (err) {
      if (err) {
        // multer의 파일 개수 초과 에러 처리
        if (
          err.code === 'LIMIT_UNEXPECTED_FILE' ||
          err.code === 'LIMIT_FILE_COUNT'
        ) {
          // CustomError로 변환
          return next(
            new CustomError(
              400,
              'IMAGE_LIMIT_EXCEEDED',
              '이미지는 최대 5개까지 첨부할 수 있습니다.',
            ),
          );
        }
        return next(err);
      }
      next();
    });
  },
  async (req, res, next) => {
    try {
      const imageUrls = [];
      if (req.files && req.files.length > 0) {
        for (const file of req.files) {
          const url = await uploadToS3(file);
          imageUrls.push(url);
        }
      }
      req.body.imageUrls = imageUrls;
      next();
    } catch (err) {
      next(err);
    }
  },
];
