-- CreateEnum
CREATE TYPE "ExceptionSource" AS ENUM ('DEVICE', 'ADMIN');

-- CreateEnum
CREATE TYPE "ExceptionReason" AS ENUM ('DUPLICATE_PUNCH', 'OUT_BEFORE_IN', 'NO_ALLOCATION', 'OUTSIDE_GEOFENCE', 'LOCATION_REQUIRED', 'EMPLOYEE_INACTIVE', 'EMPLOYEE_NOT_FOUND', 'PROJECT_NOT_FOUND', 'DEVICE_INACTIVE', 'MISSING_DEVICE_KEY', 'INVALID_DEVICE_KEY', 'MULTIPLE_ALLOCATIONS', 'INVALID_REQUEST', 'OTHER');

-- CreateTable
CREATE TABLE "AttendanceException" (
    "id" TEXT NOT NULL,
    "source" "ExceptionSource" NOT NULL,
    "reason" "ExceptionReason" NOT NULL,
    "message" TEXT NOT NULL,
    "rawPayload" JSONB,
    "deviceDbId" TEXT,
    "deviceId" TEXT,
    "employeeId" TEXT,
    "projectId" TEXT,
    "busId" TEXT,
    "punchType" "PunchType",
    "authMethod" "AuthMethod",
    "authScore" DOUBLE PRECISION,
    "liveness" DOUBLE PRECISION,
    "identifierType" "IdentifierType",
    "identifierValue" TEXT,
    "punchedAt" TIMESTAMP(3),
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "resolved" BOOLEAN NOT NULL DEFAULT false,
    "resolvedAt" TIMESTAMP(3),
    "resolutionNote" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AttendanceException_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AttendanceException_resolved_createdAt_idx" ON "AttendanceException"("resolved", "createdAt");

-- CreateIndex
CREATE INDEX "AttendanceException_reason_createdAt_idx" ON "AttendanceException"("reason", "createdAt");

-- CreateIndex
CREATE INDEX "AttendanceException_deviceId_createdAt_idx" ON "AttendanceException"("deviceId", "createdAt");

-- CreateIndex
CREATE INDEX "AttendanceException_employeeId_createdAt_idx" ON "AttendanceException"("employeeId", "createdAt");

-- AddForeignKey
ALTER TABLE "AttendanceException" ADD CONSTRAINT "AttendanceException_deviceDbId_fkey" FOREIGN KEY ("deviceDbId") REFERENCES "Device"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AttendanceException" ADD CONSTRAINT "AttendanceException_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AttendanceException" ADD CONSTRAINT "AttendanceException_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AttendanceException" ADD CONSTRAINT "AttendanceException_busId_fkey" FOREIGN KEY ("busId") REFERENCES "Bus"("id") ON DELETE SET NULL ON UPDATE CASCADE;
