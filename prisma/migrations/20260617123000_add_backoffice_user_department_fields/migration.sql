-- AlterTable
ALTER TABLE "Department"
ADD COLUMN "isActive" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN "managerId" TEXT;

-- AlterTable
ALTER TABLE "User"
ADD COLUMN "address" TEXT,
ADD COLUMN "assignedAt" TIMESTAMP(3),
ADD COLUMN "employeeId" TEXT,
ADD COLUMN "jobTitle" TEXT,
ADD COLUMN "nationalId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "User_nationalId_key" ON "User"("nationalId");

-- CreateIndex
CREATE UNIQUE INDEX "User_employeeId_key" ON "User"("employeeId");

-- AddForeignKey
ALTER TABLE "Department"
ADD CONSTRAINT "Department_managerId_fkey"
FOREIGN KEY ("managerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
