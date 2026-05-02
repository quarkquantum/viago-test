/*
  Warnings:

  - You are about to drop the column `passengerEmail` on the `bookings` table. All the data in the column will be lost.
  - You are about to drop the column `passengerName` on the `bookings` table. All the data in the column will be lost.
  - You are about to drop the column `passengerPhone` on the `bookings` table. All the data in the column will be lost.
  - You are about to drop the column `totalPrice` on the `bookings` table. All the data in the column will be lost.
  - You are about to drop the column `isActive` on the `trips` table. All the data in the column will be lost.
  - Added the required column `passengerId` to the `bookings` table without a default value. This is not possible if the table is not empty.
  - Added the required column `total` to the `bookings` table without a default value. This is not possible if the table is not empty.
  - Added the required column `departureTime` to the `stations` table without a default value. This is not possible if the table is not empty.
  - Added the required column `busId` to the `trips` table without a default value. This is not possible if the table is not empty.
  - Added the required column `status` to the `trips` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "bookings" DROP COLUMN "passengerEmail",
DROP COLUMN "passengerName",
DROP COLUMN "passengerPhone",
DROP COLUMN "totalPrice",
ADD COLUMN     "passengerId" TEXT NOT NULL,
ADD COLUMN     "total" DOUBLE PRECISION NOT NULL;

-- AlterTable
ALTER TABLE "stations" ADD COLUMN     "departureTime" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "trips" DROP COLUMN "isActive",
ADD COLUMN     "busId" TEXT NOT NULL,
ADD COLUMN     "status" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "tickets" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "passengerId" TEXT NOT NULL,
    "bookingId" TEXT NOT NULL,
    "seatId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ISSUED',

    CONSTRAINT "tickets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "seats" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "number" INTEGER NOT NULL,
    "isAvailable" BOOLEAN NOT NULL DEFAULT true,
    "type" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "tripId" TEXT NOT NULL,

    CONSTRAINT "seats_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "agencies" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "ownerId" TEXT NOT NULL,

    CONSTRAINT "agencies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bus" (
    "id" TEXT NOT NULL,
    "maxPlaces" INTEGER NOT NULL,
    "idAgence" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "bus_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "busSeat" (
    "id" TEXT NOT NULL,
    "idBus" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'voyager',
    "status" TEXT NOT NULL DEFAULT 'libre',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "busSeat_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "tickets_bookingId_key" ON "tickets"("bookingId");

-- CreateIndex
CREATE UNIQUE INDEX "tickets_seatId_key" ON "tickets"("seatId");

-- CreateIndex
CREATE UNIQUE INDEX "seats_tripId_number_key" ON "seats"("tripId", "number");

-- AddForeignKey
ALTER TABLE "trips" ADD CONSTRAINT "trips_busId_fkey" FOREIGN KEY ("busId") REFERENCES "bus"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_passengerId_fkey" FOREIGN KEY ("passengerId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tickets" ADD CONSTRAINT "tickets_passengerId_fkey" FOREIGN KEY ("passengerId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tickets" ADD CONSTRAINT "tickets_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "bookings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tickets" ADD CONSTRAINT "tickets_seatId_fkey" FOREIGN KEY ("seatId") REFERENCES "seats"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "seats" ADD CONSTRAINT "seats_tripId_fkey" FOREIGN KEY ("tripId") REFERENCES "trips"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "agencies" ADD CONSTRAINT "agencies_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bus" ADD CONSTRAINT "bus_idAgence_fkey" FOREIGN KEY ("idAgence") REFERENCES "agencies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "busSeat" ADD CONSTRAINT "busSeat_idBus_fkey" FOREIGN KEY ("idBus") REFERENCES "bus"("id") ON DELETE CASCADE ON UPDATE CASCADE;
