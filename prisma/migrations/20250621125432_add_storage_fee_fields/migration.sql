/*
  Warnings:

  - The values [FEE] on the enum `NotificationType` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "NotificationType_new" AS ENUM ('SYSTEM', 'APPROVAL', 'RENTAL_STATUS', 'CHAT', 'STORAGE_FEE', 'REVIEW', 'PURCHASE', 'PURCHASE_CANCEL', 'ETC');
ALTER TABLE "notifications" ALTER COLUMN "type" TYPE "NotificationType_new" USING ("type"::text::"NotificationType_new");
ALTER TYPE "NotificationType" RENAME TO "NotificationType_old";
ALTER TYPE "NotificationType_new" RENAME TO "NotificationType";
DROP TYPE "NotificationType_old";
COMMIT;

-- AlterTable
ALTER TABLE "products" ADD COLUMN     "approved_at" TIMESTAMP(3),
ADD COLUMN     "last_rental_completed_at" TIMESTAMP(3);
