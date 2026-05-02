/*
  Warnings:

  - You are about to drop the column `tripId` on the `seats` table. All the data in the column will be lost.
  - You are about to drop the column `type` on the `seats` table. All the data in the column will be lost.
  - You are about to drop the `busSeat` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `seatId` to the `bookings` table without a default value. This is not possible if the table is not empty.
  - Added the required column `idBus` to the `seats` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "public"."busSeat" DROP CONSTRAINT "busSeat_idBus_fkey";

-- DropForeignKey
ALTER TABLE "public"."seats" DROP CONSTRAINT "seats_tripId_fkey";

-- DropIndex
DROP INDEX "public"."seats_tripId_number_key";

-- AlterTable
ALTER TABLE "bookings" ADD COLUMN     "seatId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "seats" DROP COLUMN "tripId",
DROP COLUMN "type",
ADD COLUMN     "idBus" TEXT NOT NULL;

-- DropTable
DROP TABLE "public"."busSeat";

-- AddForeignKey
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_seatId_fkey" FOREIGN KEY ("seatId") REFERENCES "seats"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "seats" ADD CONSTRAINT "seats_idBus_fkey" FOREIGN KEY ("idBus") REFERENCES "bus"("id") ON DELETE CASCADE ON UPDATE CASCADE;
