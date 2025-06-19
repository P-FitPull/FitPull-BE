import prisma from '../data-source.js';
import { RENTAL_STATUS } from '../constants/status.js';

export const findProductTitleById = async (productId) => {
  const product = await prisma.product.findUnique({
    where: { id: productId },
    select: { title: true },
  });

  return product?.title ?? '제목 없음';
};

export const findMyRentalRequestsRepo = async (userId) => {
  return await prisma.rentalRequest.findMany({
    where: { userId, deletedAt: null },
    include: {
      product: true,
    },
    orderBy: { createdAt: 'desc' },
  });
};

export const findPendingRequestsRepo = async () => {
  return await prisma.rentalRequest.findMany({
    where: { status: RENTAL_STATUS.PENDING, deletedAt: null },
    include: {
      product: true,
      user: {
        select: { id: true, name: true, phone: true },
      },
    },
    orderBy: { createdAt: 'desc' },
  });
};

export const updateRentalRequestStatusRepo = async (id, status) => {
  return await prisma.rentalRequest.update({
    where: { id },
    data: { status },
  });
};

export const checkRentalDateConflict = async (
  productId,
  startDate,
  endDate,
) => {
  const overlapping = await prisma.rentalRequest.findFirst({
    where: {
      productId,
      status: RENTAL_STATUS.APPROVED,
      OR: [
        {
          startDate: { lte: new Date(endDate) },
          endDate: { gte: new Date(startDate) },
        },
      ],
    },
  });

  return overlapping !== null;
};

export const findRentalRequestSummaryById = async (id) => {
  const request = await prisma.rentalRequest.findUnique({
    where: { id },
    include: {
      product: { select: { title: true } },
      user: { select: { name: true } },
    },
  });

  if (!request) return null;

  return {
    rentalPeriod: `${request.startDate.toISOString().slice(0, 10)} ~ ${request.endDate.toISOString().slice(0, 10)}`,
    productTitle: request.product.title,
    userName: request.user.name,
    status: request.status,
    howToReceive: request.howToReceive,
    memo: request.memo,
  };
};

export const getRentalRequestById = async (id) => {
  return await prisma.rentalRequest.findUnique({
    where: { id },
    include: {
      product: true,
      user: true,
    },
  });
};

export const findActiveRentalByProductId = async (productId) => {
  return await prisma.rentalRequest.findFirst({
    where: {
      productId,
      status: 'ON_RENTING',
    },
  });
};

export const findActiveRentalForDelete = async (productId, oneMonthLater) => {
  return await prisma.rentalRequest.findFirst({
    where: {
      productId,
      status: {
        in: ['APPROVED', 'ON_RENTING'],
      },
      startDate: {
        lte: oneMonthLater,
      },
    },
  });
};

export const getRentalRequestByIdWithUserAndProduct = async (tx, id) => {
  return await tx.rentalRequest.findUnique({
    where: { id },
    include: { user: true, product: true },
  });
};

export const updateRentalRequestStatusRepoTx = async (tx, id, status) => {
  return await tx.rentalRequest.update({
    where: { id },
    data: { status },
  });
};

export const getLastApprovedRentalEndDate = async (tx, productId) => {
  const latestRental = await tx.rentalRequest.findFirst({
    where: {
      productId,
      status: 'APPROVED',
    },
    orderBy: {
      endDate: 'desc',
    },
    select: {
      endDate: true,
    },
  });

  return latestRental?.endDate ?? new Date(); // 없으면 now 리턴
};
