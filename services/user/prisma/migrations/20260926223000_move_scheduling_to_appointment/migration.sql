/*
  BookingRequest, Appointment e Reminder foram movidos para o appointment-service
  (banco "appointment").

  ATENÇÃO: esta migration apaga as tabelas. Antes de rodar em um ambiente com
  dados, copie-os para o banco do appointment (com as migrations dele já aplicadas):

    pg_dump -d user --data-only --column-inserts \
      -t '"BookingRequest"' -t '"Appointment"' -t '"Reminder"' | psql -d appointment
*/
-- DropForeignKey
ALTER TABLE "Reminder" DROP CONSTRAINT "Reminder_userId_fkey";

-- DropForeignKey
ALTER TABLE "BookingRequest" DROP CONSTRAINT "BookingRequest_userId_fkey";

-- DropForeignKey
ALTER TABLE "Appointment" DROP CONSTRAINT "Appointment_userId_fkey";

-- DropForeignKey
ALTER TABLE "Appointment" DROP CONSTRAINT "Appointment_bookingRequestId_fkey";

-- DropTable
DROP TABLE "Reminder";

-- DropTable
DROP TABLE "BookingRequest";

-- DropTable
DROP TABLE "Appointment";

-- DropEnum
DROP TYPE "BookingRequestStatus";

-- DropEnum
DROP TYPE "AppointmentStatus";

