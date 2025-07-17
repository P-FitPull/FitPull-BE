import {
  getTotalRentalRequestsByUserRepo,
  getTotalRentalRequestsForAdminRepo,
  getTotalCompletedRentalsByUserRepo,
  getTotalCompletedRentalsForAdminRepo,
} from '../repositories/getTotalRental.repository.js';
import { RENTAL_REQUEST_MESSAGES } from '../constants/messages.js';
import CustomError from '../utils/customError.js';

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

const ALLOWED_REQUEST_STATUS = [
  'PENDING',
  'APPROVED',
  'REJECTED',
  'CANCELED',
  'ON_RENTING',
];

// 어드민용 전체/상태별 대여요청 통합 조회
export const getTotalRentalRequestsForAdmin = async (status) => {
  if (status && !ALLOWED_REQUEST_STATUS.includes(status)) {
    throw new CustomError(
      400,
      'INVALID_STATUS',
      RENTAL_REQUEST_MESSAGES.INVALID_STATUS,
    );
  }

  const { rentalRequests, packageRentalRequests } =
    await getTotalRentalRequestsForAdminRepo(status);

  const rentalList = rentalRequests.map((rentalRequest) => ({
    id: rentalRequest.id,
    type: 'SINGLE',
    rentalPeriod: `${rentalRequest.startDate.toISOString().slice(0, 10)} ~ ${rentalRequest.endDate.toISOString().slice(0, 10)}`,
    title: rentalRequest.product?.title ?? '',
    userName: rentalRequest.user?.name ?? '',
    userPhone: rentalRequest.user?.phone ?? '',
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
    userName: packageRentalRequest.user?.name ?? '',
    userPhone: packageRentalRequest.user?.phone ?? '',
    status: packageRentalRequest.status,
    howToReceive: packageRentalRequest.howToReceive,
    memo: packageRentalRequest.memo,
    totalPrice: packageRentalRequest.totalPrice,
    createdAt: packageRentalRequest.createdAt,
  }));

  const totalList = [...rentalList, ...packageList].sort(
    (a, b) => b.createdAt - a.createdAt,
  );
  return totalList;
};

// 유저의 모든 완료 대여(단건+패키지) 통합 조회
export const getTotalCompletedRentalsByUser = async (userId) => {
  const { completedRentals, packageCompletedRentals } =
    await getTotalCompletedRentalsByUserRepo(userId);

  const singleList = completedRentals.map((rental) => ({
    id: rental.id,
    type: 'SINGLE',
    rentalRequestId: rental.rentalRequestId,
    title: rental.product?.title ?? '',
    rentalPeriod: `${rental.startDate.toISOString().slice(0, 10)} ~ ${rental.endDate.toISOString().slice(0, 10)}`,
    totalPrice: Number(rental.totalPrice),
    createdAt: rental.createdAt,
  }));

  const packageList = packageCompletedRentals.map((rental) => ({
    id: rental.id,
    type: 'PACKAGE',
    packageRentalRequestId: rental.packageRentalRequestId,
    title: rental.package?.title ?? '',
    rentalPeriod: `${rental.startDate.toISOString().slice(0, 10)} ~ ${rental.endDate.toISOString().slice(0, 10)}`,
    totalPrice: Number(rental.totalPrice),
    createdAt: rental.createdAt,
  }));

  // 통합 후 createdAt 기준 내림차순 정렬
  const totalList = [...singleList, ...packageList].sort(
    (a, b) => b.createdAt - a.createdAt,
  );

  return totalList;
};

// 어드민 전체 완료 대여(단건+패키지) 통합 조회
export const getTotalCompletedRentalsForAdmin = async () => {
  const { completedRentals, packageCompletedRentals } =
    await getTotalCompletedRentalsForAdminRepo();

  const singleList = completedRentals.map((rental) => ({
    id: rental.id,
    type: 'SINGLE',
    rentalRequestId: rental.rentalRequestId,
    title: rental.product?.title ?? '',
    userName: rental.user?.name ?? '',
    userPhone: rental.user?.phone ?? '',
    rentalPeriod: `${rental.startDate.toISOString().slice(0, 10)} ~ ${rental.endDate.toISOString().slice(0, 10)}`,
    totalPrice: Number(rental.totalPrice),
    createdAt: rental.createdAt,
  }));

  const packageList = packageCompletedRentals.map((rental) => ({
    id: rental.id,
    type: 'PACKAGE',
    packageRentalRequestId: rental.packageRentalRequestId,
    title: rental.package?.title ?? '',
    userName: rental.user?.name ?? '',
    userPhone: rental.user?.phone ?? '',
    rentalPeriod: `${rental.startDate.toISOString().slice(0, 10)} ~ ${rental.endDate.toISOString().slice(0, 10)}`,
    totalPrice: Number(rental.totalPrice),
    createdAt: rental.createdAt,
  }));

  const totalList = [...singleList, ...packageList].sort(
    (a, b) => b.createdAt - a.createdAt,
  );

  return totalList;
};
