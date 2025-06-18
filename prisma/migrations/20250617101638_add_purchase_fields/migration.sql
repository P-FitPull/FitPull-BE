-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "ProductStatus" ADD VALUE 'PURCHASE_RESERVED';
ALTER TYPE "ProductStatus" ADD VALUE 'SOLD';

-- AlterTable
ALTER TABLE "products" ADD COLUMN     "purchase_price" INTEGER,
ADD COLUMN     "purchase_reserved_at" TIMESTAMP(3),
ADD COLUMN     "purchase_reserved_user_id" TEXT;

-- AddForeignKey
ALTER TABLE "products" ADD CONSTRAINT "products_purchase_reserved_user_id_fkey" FOREIGN KEY ("purchase_reserved_user_id") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
