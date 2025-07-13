-- AlterTable
ALTER TABLE "PackageRentalRequestItem" ADD COLUMN     "rental_request_id" TEXT;

-- AddForeignKey
ALTER TABLE "PackageRentalRequestItem" ADD CONSTRAINT "PackageRentalRequestItem_rental_request_id_fkey" FOREIGN KEY ("rental_request_id") REFERENCES "rental_requests"("id") ON DELETE SET NULL ON UPDATE CASCADE;
