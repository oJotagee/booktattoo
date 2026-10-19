-- AlterTable
ALTER TABLE "Appointment" ADD COLUMN     "refundId" TEXT,
ADD COLUMN     "refundedAt" TIMESTAMP(3);

-- CreateIndex
CREATE UNIQUE INDEX "Appointment_refundId_key" ON "Appointment"("refundId");
