-- Additive, safe migration: adds optional IP/port fields for ZKTeco connectivity tests.
-- No data is deleted or modified.

ALTER TABLE "Device" ADD COLUMN "ipAddress" TEXT;
ALTER TABLE "Device" ADD COLUMN "port" INTEGER DEFAULT 4370;

