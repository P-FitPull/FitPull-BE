/*
  Warnings:

  - You are about to drop the column `createdBy` on the `packages` table. All the data in the column will be lost.
  - Added the required column `userId` to the `packages` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "packages" DROP CONSTRAINT "packages_createdBy_fkey";

-- AlterTable
ALTER TABLE "packages" DROP COLUMN "createdBy",
ADD COLUMN     "userId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "packages" ADD CONSTRAINT "packages_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
