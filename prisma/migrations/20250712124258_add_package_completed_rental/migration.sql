-- AlterTable
ALTER TABLE "completed_rentals" ADD COLUMN     "packageCompletedRentalId" TEXT;

-- CreateTable
CREATE TABLE "package_completed_rentals" (
    "id" TEXT NOT NULL,
    "start_date" TIMESTAMP(3) NOT NULL,
    "end_date" TIMESTAMP(3) NOT NULL,
    "total_price" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),
    "user_id" TEXT NOT NULL,
    "package_id" TEXT,
    "package_rental_request_id" TEXT NOT NULL,
    "return_method" "ReturnMethod" NOT NULL DEFAULT 'DELIVERY',
    "is_returned" BOOLEAN NOT NULL DEFAULT false,
    "returned_at" TIMESTAMP(3),

    CONSTRAINT "package_completed_rentals_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "package_completed_rentals_package_rental_request_id_key" ON "package_completed_rentals"("package_rental_request_id");

-- AddForeignKey
ALTER TABLE "completed_rentals" ADD CONSTRAINT "completed_rentals_packageCompletedRentalId_fkey" FOREIGN KEY ("packageCompletedRentalId") REFERENCES "package_completed_rentals"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "package_completed_rentals" ADD CONSTRAINT "package_completed_rentals_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "package_completed_rentals" ADD CONSTRAINT "package_completed_rentals_package_id_fkey" FOREIGN KEY ("package_id") REFERENCES "packages"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "package_completed_rentals" ADD CONSTRAINT "package_completed_rentals_package_rental_request_id_fkey" FOREIGN KEY ("package_rental_request_id") REFERENCES "PackageRentalRequest"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
