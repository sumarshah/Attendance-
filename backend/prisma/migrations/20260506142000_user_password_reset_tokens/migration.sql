-- Additive migration: store password reset token hash + expiry (single-use).
-- No data is deleted or modified.

ALTER TABLE "User" ADD COLUMN "resetTokenHash" TEXT;
ALTER TABLE "User" ADD COLUMN "resetTokenExpiry" TIMESTAMP(3);

