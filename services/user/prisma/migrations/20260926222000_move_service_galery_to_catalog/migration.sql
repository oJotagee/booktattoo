/*
  Service e Galery foram movidos para o catalog-service (banco "catalog").

  ATENÇÃO: esta migration apaga as tabelas. Antes de rodar em um ambiente com
  dados, copie-os para o banco do catalog (com a migration inicial dele já aplicada):

    pg_dump -d user --data-only --column-inserts -t '"Service"' -t '"Galery"' \
      | psql -d catalog

  Appointment.serviceId/galeryId continuam como ids soltos, sem FK.
*/
-- DropForeignKey
ALTER TABLE "Service" DROP CONSTRAINT "Service_userId_fkey";

-- DropForeignKey
ALTER TABLE "Galery" DROP CONSTRAINT "Galery_userId_fkey";

-- DropForeignKey
ALTER TABLE "Galery" DROP CONSTRAINT "Galery_serviceId_fkey";

-- DropForeignKey
ALTER TABLE "Appointment" DROP CONSTRAINT "Appointment_serviceId_fkey";

-- DropForeignKey
ALTER TABLE "Appointment" DROP CONSTRAINT "Appointment_galeryId_fkey";

-- DropTable
DROP TABLE "Service";

-- DropTable
DROP TABLE "Galery";

-- DropEnum
DROP TYPE "GaleryStyle";

