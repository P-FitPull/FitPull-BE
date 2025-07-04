-- AlterTable
ALTER TABLE "payment_logs" ADD COLUMN     "package_rental_request_id" TEXT;

-- AddForeignKey
ALTER TABLE "payment_logs" ADD CONSTRAINT "payment_logs_package_rental_request_id_fkey" FOREIGN KEY ("package_rental_request_id") REFERENCES "PackageRentalRequest"("id") ON DELETE SET NULL ON UPDATE CASCADE;
