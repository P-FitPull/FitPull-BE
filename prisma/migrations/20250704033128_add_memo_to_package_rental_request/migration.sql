/*
  Warnings:

  - You are about to drop the column `discount` on the `PackageRentalRequest` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "PackageRentalRequest" DROP COLUMN "discount",
ADD COLUMN     "memo" TEXT;
