/*
  Warnings:

  - The values [PENDING,IN_REVIEW,APPROVED] on the enum `RequestStatus` will be removed. If these variants are still used in the database, this will fail.
  - The values [SUPER_ADMIN,NEIGHBORHOOD_CHIEF] on the enum `Role` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `type` on the `AdministrativeRequest` table. All the data in the column will be lost.
  - You are about to drop the `Document` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `requestTypeId` to the `AdministrativeRequest` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "RequestStatus_new" AS ENUM ('SUBMITTED', 'ASSIGNED', 'IN_PROGRESS', 'PROCESSED', 'VALIDATED', 'AWAITING_PAYMENT', 'COMPLETED', 'REJECTED');
ALTER TABLE "public"."AdministrativeRequest" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "AdministrativeRequest" ALTER COLUMN "status" TYPE "RequestStatus_new" USING ("status"::text::"RequestStatus_new");
ALTER TYPE "RequestStatus" RENAME TO "RequestStatus_old";
ALTER TYPE "RequestStatus_new" RENAME TO "RequestStatus";
DROP TYPE "public"."RequestStatus_old";
ALTER TABLE "AdministrativeRequest" ALTER COLUMN "status" SET DEFAULT 'SUBMITTED';
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "Role_new" AS ENUM ('ADMIN', 'AGENT', 'CITIZEN');
ALTER TABLE "public"."User" ALTER COLUMN "role" DROP DEFAULT;
ALTER TABLE "User" ALTER COLUMN "role" TYPE "Role_new" USING ("role"::text::"Role_new");
ALTER TYPE "Role" RENAME TO "Role_old";
ALTER TYPE "Role_new" RENAME TO "Role";
DROP TYPE "public"."Role_old";
ALTER TABLE "User" ALTER COLUMN "role" SET DEFAULT 'CITIZEN';
COMMIT;

-- DropForeignKey
ALTER TABLE "Document" DROP CONSTRAINT "Document_administrativeRequestId_fkey";

-- AlterTable
ALTER TABLE "AdministrativeRequest" DROP COLUMN "type",
ADD COLUMN     "requestTypeId" TEXT NOT NULL,
ALTER COLUMN "status" SET DEFAULT 'SUBMITTED';

-- AlterTable
ALTER TABLE "Complaint" ADD COLUMN     "departmentId" TEXT;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "departmentId" TEXT;

-- DropTable
DROP TABLE "Document";

-- DropEnum
DROP TYPE "AdministrativeRequestType";

-- CreateTable
CREATE TABLE "Department" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,

    CONSTRAINT "Department_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RequestType" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "departmentId" TEXT NOT NULL,

    CONSTRAINT "RequestType_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AdministrativeDocument" (
    "id" TEXT NOT NULL,
    "documentNumber" TEXT NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "qrCode" TEXT,
    "status" TEXT NOT NULL DEFAULT 'VALID',
    "citizenId" TEXT NOT NULL,
    "agentId" TEXT NOT NULL,
    "requestId" TEXT NOT NULL,
    "issuedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AdministrativeDocument_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Department_name_key" ON "Department"("name");

-- CreateIndex
CREATE UNIQUE INDEX "RequestType_name_key" ON "RequestType"("name");

-- CreateIndex
CREATE UNIQUE INDEX "AdministrativeDocument_documentNumber_key" ON "AdministrativeDocument"("documentNumber");

-- CreateIndex
CREATE UNIQUE INDEX "AdministrativeDocument_qrCode_key" ON "AdministrativeDocument"("qrCode");

-- CreateIndex
CREATE UNIQUE INDEX "AdministrativeDocument_requestId_key" ON "AdministrativeDocument"("requestId");

-- AddForeignKey
ALTER TABLE "RequestType" ADD CONSTRAINT "RequestType_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "Department"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "Department"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AdministrativeRequest" ADD CONSTRAINT "AdministrativeRequest_requestTypeId_fkey" FOREIGN KEY ("requestTypeId") REFERENCES "RequestType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AdministrativeDocument" ADD CONSTRAINT "AdministrativeDocument_citizenId_fkey" FOREIGN KEY ("citizenId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AdministrativeDocument" ADD CONSTRAINT "AdministrativeDocument_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AdministrativeDocument" ADD CONSTRAINT "AdministrativeDocument_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES "AdministrativeRequest"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Complaint" ADD CONSTRAINT "Complaint_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "Department"("id") ON DELETE SET NULL ON UPDATE CASCADE;
