/*
  Warnings:

  - You are about to drop the column `missingPersonId` on the `ActionLog` table. All the data in the column will be lost.
  - You are about to drop the `MissingPerson` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "AdministrativeRequestType" AS ENUM ('BIRTH_CERTIFICATE', 'DEATH_CERTIFICATE', 'RESIDENCE_CERTIFICATE', 'LITERARY_COPY', 'BIRTH_DECLARATION', 'OTHER');

-- CreateEnum
CREATE TYPE "MissingDocumentStatus" AS ENUM ('MISSING', 'FOUND', 'RETURNED', 'ARCHIVED');

-- DropForeignKey
ALTER TABLE "ActionLog" DROP CONSTRAINT "ActionLog_missingPersonId_fkey";

-- DropForeignKey
ALTER TABLE "MissingPerson" DROP CONSTRAINT "MissingPerson_reportedById_fkey";

-- AlterTable
ALTER TABLE "ActionLog" DROP COLUMN "missingPersonId",
ADD COLUMN     "missingDocumentId" TEXT;

-- AlterTable
ALTER TABLE "AdministrativeRequest" ADD COLUMN     "attachments" TEXT[],
ADD COLUMN     "data" JSONB,
ADD COLUMN     "type" "AdministrativeRequestType" NOT NULL DEFAULT 'OTHER';

-- DropTable
DROP TABLE "MissingPerson";

-- DropEnum
DROP TYPE "MissingPersonStatus";

-- CreateTable
CREATE TABLE "MissingDocument" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "photoUrl" TEXT,
    "lastSeenLocation" TEXT,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "status" "MissingDocumentStatus" NOT NULL DEFAULT 'MISSING',
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "reportedById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MissingDocument_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "MissingDocument" ADD CONSTRAINT "MissingDocument_reportedById_fkey" FOREIGN KEY ("reportedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ActionLog" ADD CONSTRAINT "ActionLog_missingDocumentId_fkey" FOREIGN KEY ("missingDocumentId") REFERENCES "MissingDocument"("id") ON DELETE SET NULL ON UPDATE CASCADE;
