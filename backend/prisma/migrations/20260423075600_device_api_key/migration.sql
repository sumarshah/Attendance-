-- AlterTable
ALTER TABLE "Device" ADD COLUMN     "apiKeyHash" TEXT,
ADD COLUMN     "lastSeenAt" TIMESTAMP(3);
