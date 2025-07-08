/*
  Warnings:

  - Made the column `how_to_receive` on table `PackageRentalRequest` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "PackageRentalRequest" ALTER COLUMN "how_to_receive" SET NOT NULL;
