-- AlterTable
ALTER TABLE "payment_logs" ADD COLUMN     "completedRentalId" TEXT,
ADD COLUMN     "packageCompletedRentalId" TEXT;

-- AlterTable
ALTER TABLE "platform_payment_logs" ADD COLUMN     "completedRentalId" TEXT,
ADD COLUMN     "packageCompletedRentalId" TEXT;

-- AddForeignKey
ALTER TABLE "payment_logs" ADD CONSTRAINT "payment_logs_packageCompletedRentalId_fkey" FOREIGN KEY ("packageCompletedRentalId") REFERENCES "package_completed_rentals"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payment_logs" ADD CONSTRAINT "payment_logs_completedRentalId_fkey" FOREIGN KEY ("completedRentalId") REFERENCES "completed_rentals"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "platform_payment_logs" ADD CONSTRAINT "platform_payment_logs_packageCompletedRentalId_fkey" FOREIGN KEY ("packageCompletedRentalId") REFERENCES "package_completed_rentals"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "platform_payment_logs" ADD CONSTRAINT "platform_payment_logs_completedRentalId_fkey" FOREIGN KEY ("completedRentalId") REFERENCES "completed_rentals"("id") ON DELETE SET NULL ON UPDATE CASCADE;
