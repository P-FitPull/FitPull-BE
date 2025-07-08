-- AlterTable
ALTER TABLE "rental_requests" ADD COLUMN     "package_rental_request_id" TEXT;

-- AddForeignKey
ALTER TABLE "rental_requests" ADD CONSTRAINT "rental_requests_package_rental_request_id_fkey" FOREIGN KEY ("package_rental_request_id") REFERENCES "PackageRentalRequest"("id") ON DELETE SET NULL ON UPDATE CASCADE;
