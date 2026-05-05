-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "PermissionKey" ADD VALUE 'ATTENDANCE';
ALTER TYPE "PermissionKey" ADD VALUE 'TIMESHEETS';
ALTER TYPE "PermissionKey" ADD VALUE 'PROJECTS';
ALTER TYPE "PermissionKey" ADD VALUE 'BUSES';
ALTER TYPE "PermissionKey" ADD VALUE 'DEVICES';
ALTER TYPE "PermissionKey" ADD VALUE 'ALLOCATIONS';
ALTER TYPE "PermissionKey" ADD VALUE 'EXCEPTIONS';
ALTER TYPE "PermissionKey" ADD VALUE 'CORRECTIONS';
