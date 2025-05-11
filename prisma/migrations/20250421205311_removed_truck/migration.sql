/*
  Warnings:

  - You are about to drop the column `truckModelId` on the `RepairOrderServiceItem` table. All the data in the column will be lost.
  - You are about to drop the `TruckModel` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_BaseToUser` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "RepairOrderServiceItem" DROP CONSTRAINT "RepairOrderServiceItem_truckModelId_fkey";

-- DropForeignKey
ALTER TABLE "_BaseToUser" DROP CONSTRAINT "_BaseToUser_A_fkey";

-- DropForeignKey
ALTER TABLE "_BaseToUser" DROP CONSTRAINT "_BaseToUser_B_fkey";

-- DropIndex
DROP INDEX "RepairOrderServiceItem_name_truckModelId_baseId_idx";

-- AlterTable
ALTER TABLE "RepairOrderServiceItem" DROP COLUMN "truckModelId";

-- DropTable
DROP TABLE "TruckModel";

-- DropTable
DROP TABLE "_BaseToUser";

-- CreateIndex
CREATE INDEX "RepairOrderServiceItem_name_baseId_idx" ON "RepairOrderServiceItem"("name", "baseId");
