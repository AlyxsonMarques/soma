/*
  Warnings:

  - You are about to drop the column `photo` on the `RepairOrder` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "RepairOrder" DROP COLUMN "photo";

-- AlterTable
ALTER TABLE "RepairOrderService" ADD COLUMN     "photo" TEXT;
