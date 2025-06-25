/*
  Warnings:

  - You are about to drop the column `name` on the `influencer_promos` table. All the data in the column will be lost.
  - Added the required column `title` to the `influencer_promos` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `influencer_promos` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "influencer_promos" DROP COLUMN "name",
ADD COLUMN     "deleted_at" TIMESTAMP(3),
ADD COLUMN     "image_urls" TEXT[],
ADD COLUMN     "snsLinks" TEXT[],
ADD COLUMN     "title" TEXT NOT NULL,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL;
