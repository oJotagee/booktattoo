-- BookingRequest nunca foi exposto por nenhuma rota, então a tabela está vazia:
-- as colunas novas nascem NOT NULL sem default e o enum de status é recriado.

-- AlterTable
ALTER TABLE "BookingRequest" DROP COLUMN "status";

-- DropEnum
DROP TYPE "BookingRequestStatus";

-- CreateEnum
CREATE TYPE "BookingRequestStatus" AS ENUM ('OPEN', 'CLOSED');

-- CreateEnum
CREATE TYPE "BookingRequestMessageAuthor" AS ENUM ('ARTIST', 'CLIENT');

-- DropIndex
DROP INDEX "BookingRequest_userId_idx";

-- AlterTable
ALTER TABLE "BookingRequest" DROP COLUMN "clientContact",
DROP COLUMN "message",
ADD COLUMN     "clientEmail" TEXT NOT NULL,
ADD COLUMN     "clientPhone" TEXT NOT NULL,
ADD COLUMN     "status" "BookingRequestStatus" NOT NULL DEFAULT 'OPEN',
ADD COLUMN     "lastMessageAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "closedAt" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "BookingRequestMessage" (
    "id" TEXT NOT NULL,
    "author" "BookingRequestMessageAuthor" NOT NULL,
    "body" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "bookingRequestId" TEXT NOT NULL,

    CONSTRAINT "BookingRequestMessage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "BookingRequest_userId_status_lastMessageAt_idx" ON "BookingRequest"("userId", "status", "lastMessageAt");

-- CreateIndex
CREATE INDEX "BookingRequest_clientEmail_idx" ON "BookingRequest"("clientEmail");

-- CreateIndex
CREATE INDEX "BookingRequest_clientPhone_idx" ON "BookingRequest"("clientPhone");

-- CreateIndex
CREATE INDEX "BookingRequestMessage_bookingRequestId_createdAt_idx" ON "BookingRequestMessage"("bookingRequestId", "createdAt");

-- AddForeignKey
ALTER TABLE "BookingRequestMessage" ADD CONSTRAINT "BookingRequestMessage_bookingRequestId_fkey" FOREIGN KEY ("bookingRequestId") REFERENCES "BookingRequest"("id") ON DELETE CASCADE ON UPDATE CASCADE;
