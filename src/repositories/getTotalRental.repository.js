import prisma from '../data-source.js';

// 유저의 단건/패키지 대여 요청을 모두 조회
export const getTotalRentalRequestsByUserRepo = async (userId) => {
  // 단건 대여 요청
  const rentalRequests = await prisma.rentalRequest.findMany({
    where: { userId, deletedAt: null },
    include: { product: true },
    orderBy: { createdAt: 'desc' },
  });

  // 패키지 대여 요청
  const packageRentalRequests = await prisma.packageRentalRequest.findMany({
    where: { userId },
    include: { package: true, user: true },
    orderBy: { createdAt: 'desc' },
  });

  return { rentalRequests, packageRentalRequests };
};

// 어드민용: 전체/상태별 대여요청 쿼리로 조회
export const getTotalRentalRequestsForAdminRepo = async (status) => {
  // 단건 대여 요청
  const rentalRequests = await prisma.rentalRequest.findMany({
    where: {
      ...(status ? { status } : {}),
      deletedAt: null,
    },
    include: { product: true, user: true },
    orderBy: { createdAt: 'desc' },
  });

  // 패키지 대여 요청
  const packageRentalRequests = await prisma.packageRentalRequest.findMany({
    where: status ? { status } : {},
    include: { package: true, user: true },
    orderBy: { createdAt: 'desc' },
  });

  return { rentalRequests, packageRentalRequests };
};

// 유저의 단건/패키지 완료 대여를 모두 조회
export const getTotalCompletedRentalsByUserRepo = async (userId) => {
  // 단건 완료 대여
  const completedRentals = await prisma.completedRental.findMany({
    where: { userId, deletedAt: null },
    include: { product: true },
    orderBy: { createdAt: 'desc' },
  });

  // 패키지 완료 대여
  const packageCompletedRentals = await prisma.packageCompletedRental.findMany({
    where: { userId },
    include: { package: true },
    orderBy: { createdAt: 'desc' },
  });

  return { completedRentals, packageCompletedRentals };
};

// 어드민용: 전체 단건/패키지 완료 대여 쿼리로 조회
export const getTotalCompletedRentalsForAdminRepo = async () => {
  // 단건 완료 대여
  const completedRentals = await prisma.completedRental.findMany({
    where: { deletedAt: null },
    include: { product: true, user: true },
    orderBy: { createdAt: 'desc' },
  });

  // 패키지 완료 대여
  const packageCompletedRentals = await prisma.packageCompletedRental.findMany({
    include: { package: true, user: true },
    orderBy: { createdAt: 'desc' },
  });

  return { completedRentals, packageCompletedRentals };
};
