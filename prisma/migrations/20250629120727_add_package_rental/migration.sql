/*
  Warnings:

  - The primary key for the `package_items` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `package_id` on the `package_items` table. All the data in the column will be lost.
  - You are about to drop the column `product_id` on the `package_items` table. All the data in the column will be lost.
  - You are about to drop the column `user_id` on the `packages` table. All the data in the column will be lost.
  - Added the required column `packageId` to the `package_items` table without a default value. This is not possible if the table is not empty.
  - Added the required column `productId` to the `package_items` table without a default value. This is not possible if the table is not empty.
  - Added the required column `createdBy` to the `packages` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `packages` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "package_items" DROP CONSTRAINT "package_items_package_id_fkey";

-- DropForeignKey
ALTER TABLE "package_items" DROP CONSTRAINT "package_items_product_id_fkey";

-- DropForeignKey
ALTER TABLE "packages" DROP CONSTRAINT "packages_user_id_fkey";

-- AlterTable
ALTER TABLE "package_items" DROP CONSTRAINT "package_items_pkey",
DROP COLUMN "package_id",
DROP COLUMN "product_id",
ADD COLUMN     "packageId" TEXT NOT NULL,
ADD COLUMN     "productId" TEXT NOT NULL,
ADD CONSTRAINT "package_items_pkey" PRIMARY KEY ("packageId", "productId");

-- AlterTable
ALTER TABLE "packages" DROP COLUMN "user_id",
ADD COLUMN     "createdBy" TEXT NOT NULL,
ADD COLUMN     "isFeatured" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL;

-- CreateTable
CREATE TABLE "PackageRentalRequest" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "packageId" TEXT,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "totalPrice" INTEGER NOT NULL,
    "discount" INTEGER NOT NULL,
    "status" "RequestStatus" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PackageRentalRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PackageRentalRequestItem" (
    "id" TEXT NOT NULL,
    "packageRentalRequestId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "price" INTEGER NOT NULL,
    "finalPrice" INTEGER NOT NULL,
    "status" "RequestStatus" NOT NULL,

    CONSTRAINT "PackageRentalRequestItem_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "packages" ADD CONSTRAINT "packages_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "package_items" ADD CONSTRAINT "package_items_packageId_fkey" FOREIGN KEY ("packageId") REFERENCES "packages"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "package_items" ADD CONSTRAINT "package_items_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PackageRentalRequest" ADD CONSTRAINT "PackageRentalRequest_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PackageRentalRequest" ADD CONSTRAINT "PackageRentalRequest_packageId_fkey" FOREIGN KEY ("packageId") REFERENCES "packages"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PackageRentalRequestItem" ADD CONSTRAINT "PackageRentalRequestItem_packageRentalRequestId_fkey" FOREIGN KEY ("packageRentalRequestId") REFERENCES "PackageRentalRequest"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PackageRentalRequestItem" ADD CONSTRAINT "PackageRentalRequestItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PackageRentalRequestItem" ADD CONSTRAINT "PackageRentalRequestItem_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
