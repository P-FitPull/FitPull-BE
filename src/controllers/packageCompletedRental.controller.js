import { createPackageCompletedRental } from '../services/packageCompletedRental.service.js';

export const createPackageCompletedRentalController = async (
  req,
  res,
  next,
) => {
  try {
    const { packageRentalRequestId } = req.body;
    const result = await createPackageCompletedRental(packageRentalRequestId);
    res.json({ success: true, data: result });
  } catch (err) {
    console.error(err);
    next(err);
  }
};
