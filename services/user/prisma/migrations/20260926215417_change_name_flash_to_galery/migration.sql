/*
  Warnings:

  - You are about to drop the column `flashId` on the `Appointment` table. All the data in the column will be lost.
  - You are about to drop the `Flash` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[galeryId]` on the table `Appointment` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "GaleryStyle" AS ENUM ('TRADICIONAL', 'JAPONES', 'BLACKWORK', 'FINELINE', 'NEOTRADICIONAL', 'CHICANO', 'REALISMO', 'MINIMALISTA');

-- DropForeignKey
ALTER TABLE "Appointment" DROP CONSTRAINT "Appointment_flashId_fkey";

-- DropForeignKey
ALTER TABLE "Appointment" DROP CONSTRAINT "Appointment_serviceId_fkey";

-- DropForeignKey
ALTER TABLE "Flash" DROP CONSTRAINT "Flash_serviceId_fkey";

-- DropForeignKey
ALTER TABLE "Flash" DROP CONSTRAINT "Flash_userId_fkey";

-- AlterTable
ALTER TABLE "Appointment" DROP COLUMN "flashId",
ADD COLUMN     "galeryId" TEXT,
ALTER COLUMN "serviceId" DROP NOT NULL;

-- DropTable
DROP TABLE "Flash";

-- DropEnum
DROP TYPE "FlashStyle";

-- CreateTable
CREATE TABLE "Galery" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "size" TEXT,
    "price" INTEGER NOT NULL,
    "style" "GaleryStyle",
    "available" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,
    "serviceId" TEXT NOT NULL,

    CONSTRAINT "Galery_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Appointment_galeryId_key" ON "Appointment"("galeryId");

-- AddForeignKey
ALTER TABLE "Galery" ADD CONSTRAINT "Galery_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Galery" ADD CONSTRAINT "Galery_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "Service"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Appointment" ADD CONSTRAINT "Appointment_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "Service"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Appointment" ADD CONSTRAINT "Appointment_galeryId_fkey" FOREIGN KEY ("galeryId") REFERENCES "Galery"("id") ON DELETE SET NULL ON UPDATE CASCADE;
