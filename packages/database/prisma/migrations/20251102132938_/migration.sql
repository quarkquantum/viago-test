/*
  Warnings:

  - You are about to drop the column `cumulativePrice` on the `stations` table. All the data in the column will be lost.
  - Added the required column `slug` to the `agencies` table without a default value. This is not possible if the table is not empty.
  - Added the required column `startingPrice` to the `stations` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "agencies" ADD COLUMN     "slug" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "stations" DROP COLUMN "cumulativePrice",
ADD COLUMN     "startingPrice" DOUBLE PRECISION NOT NULL;

-- AlterTable
ALTER TABLE "user" ADD COLUMN     "lastSignInAt" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "Profile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "Profile_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Profile_userId_key" ON "Profile"("userId");

-- AddForeignKey
ALTER TABLE "Profile" ADD CONSTRAINT "Profile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
