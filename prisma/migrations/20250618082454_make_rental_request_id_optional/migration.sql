-- DropForeignKey
ALTER TABLE "payment_logs" DROP CONSTRAINT "payment_logs_rental_request_id_fkey";

-- AlterTable
ALTER TABLE "payment_logs" ALTER COLUMN "rental_request_id" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "payment_logs" ADD CONSTRAINT "payment_logs_rental_request_id_fkey" FOREIGN KEY ("rental_request_id") REFERENCES "rental_requests"("id") ON DELETE SET NULL ON UPDATE CASCADE;
