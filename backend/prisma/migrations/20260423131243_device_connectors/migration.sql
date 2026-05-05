-- CreateEnum
CREATE TYPE "ConnectorType" AS ENUM ('GENERIC_WEBHOOK', 'ZKTECO_ADMS', 'ZKTECO_PULL', 'HIKVISION_ISAPI', 'BIOTIME_API', 'ANDROID_TABLET');

-- CreateTable
CREATE TABLE "DeviceConnector" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "ConnectorType" NOT NULL,
    "apiKeyHash" TEXT,
    "status" BOOLEAN NOT NULL DEFAULT true,
    "config" JSONB,
    "lastSeenAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DeviceConnector_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "DeviceConnector_type_idx" ON "DeviceConnector"("type");

-- CreateIndex
CREATE INDEX "DeviceConnector_status_createdAt_idx" ON "DeviceConnector"("status", "createdAt");
