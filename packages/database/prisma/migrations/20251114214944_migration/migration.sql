/*
  Warnings:

  - You are about to drop the column `idAgence` on the `bus` table. All the data in the column will be lost.
  - Added the required column `agencyId` to the `bus` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "public"."bus" DROP CONSTRAINT "bus_idAgence_fkey";

-- AlterTable
ALTER TABLE "agencies" ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'ACTIVE';

-- AlterTable
ALTER TABLE "bus" DROP COLUMN "idAgence",
ADD COLUMN     "agencyId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "bus" ADD CONSTRAINT "bus_agencyId_fkey" FOREIGN KEY ("agencyId") REFERENCES "agencies"("id") ON DELETE CASCADE ON UPDATE CASCADE;
