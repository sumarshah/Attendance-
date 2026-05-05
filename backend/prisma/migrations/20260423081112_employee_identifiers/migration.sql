-- CreateEnum
CREATE TYPE "IdentifierType" AS ENUM ('FACE_ID', 'FINGER_ID', 'DEVICE_USER_ID');

-- CreateTable
CREATE TABLE "EmployeeIdentifier" (
    "id" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "identifierType" "IdentifierType" NOT NULL,
    "identifierValue" TEXT NOT NULL,
    "vendor" TEXT,
    "deviceDbId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EmployeeIdentifier_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "EmployeeIdentifier_employeeId_idx" ON "EmployeeIdentifier"("employeeId");

-- CreateIndex
CREATE INDEX "EmployeeIdentifier_identifierType_identifierValue_idx" ON "EmployeeIdentifier"("identifierType", "identifierValue");

-- AddForeignKey
ALTER TABLE "EmployeeIdentifier" ADD CONSTRAINT "EmployeeIdentifier_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmployeeIdentifier" ADD CONSTRAINT "EmployeeIdentifier_deviceDbId_fkey" FOREIGN KEY ("deviceDbId") REFERENCES "Device"("id") ON DELETE SET NULL ON UPDATE CASCADE;
