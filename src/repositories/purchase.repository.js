// 상품 정보 조회
export const getProductByIdForPurchase = async (tx, productId) => {
  return await tx.product.findUnique({
    where: { id: productId },
    include: { owner: true },
  });
};

// 누적 대여금액 조회
export const getCompletedRentalTotalByUser = async (tx, productId, userId) => {
  const rentals = await tx.completedRental.findMany({
    where: { productId, userId },
  });
  return rentals.reduce((sum, rental) => sum + rental.totalPrice, 0);
};
