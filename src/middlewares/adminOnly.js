export const adminOnly = (req, res, next) => {
  if (!req.user || req.user.role !== 'ADMIN') {
    return res.status(403).json({ message: '관리자 권한이 필요합니다.' });
  }
  next();
};
