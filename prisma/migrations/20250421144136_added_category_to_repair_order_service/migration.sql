/*
  Warnings:

  - You are about to drop the column `truckModelId` on the `RepairOrderServiceItem` table. All the data in the column will be lost.
  - You are about to drop the `TruckModel` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `category` to the `RepairOrderService` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "RepairOrderServiceCategory" AS ENUM ('LABOR', 'MATERIAL');

-- DropForeignKey
ALTER TABLE "RepairOrderServiceItem" DROP CONSTRAINT "RepairOrderServiceItem_truckModelId_fkey";

-- DropIndex
DROP INDEX "RepairOrderServiceItem_name_truckModelId_baseId_idx";

-- AlterTable
ALTER TABLE "RepairOrderService" ADD COLUMN     "category" "RepairOrderServiceCategory" NOT NULL;

-- AlterTable
ALTER TABLE "RepairOrderServiceItem" DROP COLUMN "truckModelId";

-- DropTable
DROP TABLE "TruckModel";

-- CreateIndex
CREATE INDEX "RepairOrderServiceItem_name_baseId_idx" ON "RepairOrderServiceItem"("name", "baseId");
