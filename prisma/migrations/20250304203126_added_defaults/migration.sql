-- AlterTable
ALTER TABLE "RepairOrder" ALTER COLUMN "status" SET DEFAULT 'PENDING';

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "type" SET DEFAULT 'MECHANIC',
ALTER COLUMN "status" SET DEFAULT 'PENDING';
