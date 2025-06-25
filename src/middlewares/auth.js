import { verifyAccessToken } from '../utils/jwt.js';
import { findUserById } from '../repositories/user.repository.js';

export const authenticate = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer')) {
    return res.status(401).json({ message: '인증 토큰이 필요합니다.' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = verifyAccessToken(token);
    const user = await findUserById(decoded.userId);
    if (!user) {
      return res
        .status(401)
        .json({ message: '탈퇴했거나 존재하지 않는 유저입니다.' });
    }
    req.user = {
      ...decoded,
      ...user,
    };
    next();
  } catch (err) {
    console.error('JWT 인증 에러:', err);
    return res.status(401).json({ message: '유효하지 않은 토큰입니다.' });
  }
};
