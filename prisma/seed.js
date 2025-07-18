import { PrismaClient } from '@prisma/client';
import { DEFAULT_CATEGORY_NAME } from '../src/constants/category.js';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
dotenv.config();

const prisma = new PrismaClient();

const ADMIN_EMAIL = 'admin@fitpull.com';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
const ADMIN_NAME = '김어드민';
const ADMIN_PHONE = '01026678832';

const INFLUENCER_NAME = '김인플루언서';
const INFLUENCER_PHONE = '01026678832';
const INFLUENCER_EMAIL = 'influencer@fitpull.com';
const INFLUENCER_PASSWORD = process.env.ADMIN_PASSWORD;

async function main() {
  // 이미 "기타" 카테고리가 있으면 추가하지 않음
  const exists = await prisma.category.findFirst({
    where: { name: DEFAULT_CATEGORY_NAME },
  });

  if (!exists) {
    await prisma.category.create({
      data: {
        name: DEFAULT_CATEGORY_NAME,
        description: '기본 카테고리 (기타)',
      },
    });
    console.log(`카테고리 "${DEFAULT_CATEGORY_NAME}"가 생성되었습니다.`);
  } else {
    console.log(`카테고리 "${DEFAULT_CATEGORY_NAME}"가 이미 존재합니다.`);
  }

  // 관리자 계정 seeding
  const adminUser = await prisma.user.findFirst({
    where: { role: 'ADMIN' },
  });

  if (!adminUser) {
    // 1. User 생성
    const newAdminUser = await prisma.user.create({
      data: {
        name: ADMIN_NAME,
        phone: ADMIN_PHONE,
        role: 'ADMIN',
      },
    });

    // 2. Account 생성 (User와 연결)
    const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 10);
    await prisma.account.create({
      data: {
        provider: 'LOCAL',
        email: ADMIN_EMAIL,
        passwordHash: hashedPassword,
        userId: newAdminUser.id,
      },
    });

    console.log('관리자 계정(User + Account)이 생성되었습니다.');
  } else {
    console.log('관리자 계정이 이미 존재합니다.');
  }

  // 인플루언서 계정 seeding
  const influencerUser = await prisma.user.findFirst({
    where: {
      phone: INFLUENCER_PHONE,
      role: 'INFLUENCER',
    },
  });

  if (!influencerUser) {
    // 1. User 생성
    const newInfluencerUser = await prisma.user.create({
      data: {
        name: INFLUENCER_NAME,
        phone: INFLUENCER_PHONE,
        role: 'INFLUENCER',
        verifiedPhone: true,
      },
    });

    // 2. Account 생성 (User와 연결)
    const hashedPassword = await bcrypt.hash(INFLUENCER_PASSWORD, 10);
    await prisma.account.create({
      data: {
        provider: 'LOCAL',
        email: INFLUENCER_EMAIL,
        passwordHash: hashedPassword,
        userId: newInfluencerUser.id,
      },
    });

    console.log('인플루언서 계정(User + Account)이 생성되었습니다.');
  } else {
    console.log('인플루언서 계정이 이미 존재합니다.');
  }

  // PlatformAccount seeding
  const platformAccount = await prisma.platformAccount.findFirst();
  if (!platformAccount) {
    await prisma.platformAccount.create({
      data: { balance: 0 },
    });
    console.log('PlatformAccount(회사 계정)가 balance 0으로 생성되었습니다.');
  } else {
    console.log('PlatformAccount(회사 계정)가 이미 존재합니다.');
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
