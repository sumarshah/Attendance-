-- CreateEnum
CREATE TYPE "AuthMethod" AS ENUM ('FACE', 'FINGER');

-- AlterTable
ALTER TABLE "AttendancePunch" ADD COLUMN     "authMethod" "AuthMethod",
ADD COLUMN     "authScore" DOUBLE PRECISION,
ADD COLUMN     "liveness" DOUBLE PRECISION;
