/*
  Warnings:

  - You are about to drop the column `isAvailable` on the `seats` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[licensePlate]` on the table `bus` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `licensePlate` to the `bus` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "bus" ADD COLUMN     "licensePlate" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "seats" DROP COLUMN "isAvailable",
ADD COLUMN     "type" TEXT NOT NULL DEFAULT 'PASSENGER';

-- CreateIndex
CREATE UNIQUE INDEX "bus_licensePlate_key" ON "bus"("licensePlate");
