-- CreateEnum
CREATE TYPE "BookingOfferStatus" AS ENUM ('PENDING', 'PAID', 'WITHDRAWN');

-- AlterEnum
ALTER TYPE "BookingRequestMessageAuthor" ADD VALUE 'SYSTEM';

-- DropIndex
DROP INDEX "Appointment_bookingRequestId_key";

-- AlterTable
ALTER TABLE "Appointment" ADD COLUMN     "bookingOfferId" TEXT;

-- CreateTable
CREATE TABLE "BookingOffer" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "scheduledAt" TIMESTAMP(3) NOT NULL,
    "duration" INTEGER NOT NULL,
    "price" INTEGER NOT NULL,
    "depositAmount" INTEGER NOT NULL,
    "status" "BookingOfferStatus" NOT NULL DEFAULT 'PENDING',
    "appointmentId" TEXT,
    "paidAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "bookingRequestId" TEXT NOT NULL,

    CONSTRAINT "BookingOffer_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "BookingOffer_bookingRequestId_status_idx" ON "BookingOffer"("bookingRequestId", "status");

-- CreateIndex
CREATE INDEX "Appointment_bookingRequestId_idx" ON "Appointment"("bookingRequestId");

-- CreateIndex
CREATE INDEX "Appointment_bookingOfferId_status_idx" ON "Appointment"("bookingOfferId", "status");

-- AddForeignKey
ALTER TABLE "BookingOffer" ADD CONSTRAINT "BookingOffer_bookingRequestId_fkey" FOREIGN KEY ("bookingRequestId") REFERENCES "BookingRequest"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Appointment" ADD CONSTRAINT "Appointment_bookingOfferId_fkey" FOREIGN KEY ("bookingOfferId") REFERENCES "BookingOffer"("id") ON DELETE SET NULL ON UPDATE CASCADE;

