/*
  Warnings:

  - You are about to drop the column `timeZone` on the `User` table. All the data in the column will be lost.
  - The `status` column on the `User` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'VACATION');

-- AlterTable
ALTER TABLE "Subscription" ALTER COLUMN "plan" SET DEFAULT 'BASIC';

-- AlterTable
ALTER TABLE "User" DROP COLUMN "timeZone",
DROP COLUMN "status",
ADD COLUMN     "status" "UserStatus" NOT NULL DEFAULT 'ACTIVE';
