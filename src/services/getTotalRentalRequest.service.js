import { getTotalRentalRequestsByUserRepo } from '../repositories/getTotalRentalRequest.repository.js';

// 유저의 모든 대여 요청(단건+패키지) 통합 조회
export const getTotalRentalRequestsByUser = async (userId) => {
  const { rentalRequests, packageRentalRequests } =
    await getTotalRentalRequestsByUserRepo(userId);

  // 공통 포맷으로 변환
  const rentalList = rentalRequests.map((rentalRequest) => ({
    id: rentalRequest.id,
    type: 'SINGLE',
    rentalPeriod: `${rentalRequest.startDate.toISOString().slice(0, 10)} ~ ${rentalRequest.endDate.toISOString().slice(0, 10)}`,
    title: rentalRequest.product?.title ?? '',
    status: rentalRequest.status,
    howToReceive: rentalRequest.howToReceive,
    memo: rentalRequest.memo,
    totalPrice: rentalRequest.totalPrice,
    createdAt: rentalRequest.createdAt,
  }));

  const packageList = packageRentalRequests.map((packageRentalRequest) => ({
    id: packageRentalRequest.id,
    type: 'PACKAGE',
    rentalPeriod: `${packageRentalRequest.startDate.toISOString().slice(0, 10)} ~ ${packageRentalRequest.endDate.toISOString().slice(0, 10)}`,
    title: packageRentalRequest.package?.title ?? '',
    status: packageRentalRequest.status,
    howToReceive: packageRentalRequest.howToReceive,
    memo: packageRentalRequest.memo,
    totalPrice: packageRentalRequest.totalPrice,
    createdAt: packageRentalRequest.createdAt,
  }));

  // 통합 후 createdAt 기준 내림차순 정렬
  const totalList = [...rentalList, ...packageList].sort(
    (a, b) => b.createdAt - a.createdAt,
  );

  return totalList;
};
