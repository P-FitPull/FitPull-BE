export const influencerOnly = (req, res, next) => {
  if (!req.user || req.user.role !== 'INFLUENCER') {
    return res.status(403).json({ message: '인플루언서 권한이 필요합니다.' });
  }
  next();
};
