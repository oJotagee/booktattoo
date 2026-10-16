-- DropIndex
DROP INDEX "Appointment_galeryId_key";

-- DropIndex
DROP INDEX "Appointment_userId_idx";

-- AlterTable
ALTER TABLE "Appointment" DROP COLUMN "clientContact",
ADD COLUMN     "checkoutSessionId" TEXT,
ADD COLUMN     "clientEmail" TEXT NOT NULL,
ADD COLUMN     "clientPhone" TEXT NOT NULL,
ADD COLUMN     "depositAmount" INTEGER NOT NULL,
ADD COLUMN     "galeryImageUrl" TEXT,
ADD COLUMN     "galeryTitle" TEXT,
ADD COLUMN     "paidAt" TIMESTAMP(3);

-- CreateIndex
CREATE UNIQUE INDEX "Appointment_checkoutSessionId_key" ON "Appointment"("checkoutSessionId");

-- CreateIndex
CREATE INDEX "Appointment_userId_scheduledAt_idx" ON "Appointment"("userId", "scheduledAt");

-- CreateIndex
CREATE INDEX "Appointment_galeryId_idx" ON "Appointment"("galeryId");
