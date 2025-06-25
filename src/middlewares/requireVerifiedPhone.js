import CustomError from '../utils/customError.js';
import { AUTH_MESSAGES } from '../constants/messages.js';

const requireVerifiedPhone = (req, res, next) => {
  if (!req.user || !req.user.verifiedPhone) {
    throw new CustomError(
      403,
      'PHONE_NOT_VERIFIED',
      AUTH_MESSAGES.PHONE_NOT_VERIFIED,
    );
  }
  next();
};

export default requireVerifiedPhone;
