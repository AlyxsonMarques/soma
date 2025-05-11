/*
  Warnings:

  - You are about to drop the column `category` on the `RepairOrderService` table. All the data in the column will be lost.
  - You are about to drop the `RepairOrderServiceItem` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Base" DROP CONSTRAINT "Base_addressId_fkey";

-- DropForeignKey
ALTER TABLE "RepairOrderService" DROP CONSTRAINT "RepairOrderService_itemId_fkey";

-- DropForeignKey
ALTER TABLE "RepairOrderServiceItem" DROP CONSTRAINT "RepairOrderServiceItem_baseId_fkey";

-- AlterTable
ALTER TABLE "RepairOrderService" DROP COLUMN "category";

-- DropTable
DROP TABLE "RepairOrderServiceItem";

-- DropEnum
DROP TYPE "RepairOrderServiceCategory";

-- CreateTable
CREATE TABLE "RepairOrderItem" (
    "id" UUID NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "truckModelId" UUID NOT NULL,
    "value" DECIMAL(10,2) NOT NULL,
    "baseId" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "RepairOrderItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TruckModel" (
    "id" UUID NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "brand" VARCHAR(255) NOT NULL,
    "year" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "TruckModel_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "RepairOrderItem_name_truckModelId_baseId_idx" ON "RepairOrderItem"("name", "truckModelId", "baseId");

-- CreateIndex
CREATE INDEX "TruckModel_name_brand_year_idx" ON "TruckModel"("name", "brand", "year");

-- AddForeignKey
ALTER TABLE "Base" ADD CONSTRAINT "Base_addressId_fkey" FOREIGN KEY ("addressId") REFERENCES "BaseAddress"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RepairOrderItem" ADD CONSTRAINT "RepairOrderItem_truckModelId_fkey" FOREIGN KEY ("truckModelId") REFERENCES "TruckModel"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RepairOrderItem" ADD CONSTRAINT "RepairOrderItem_baseId_fkey" FOREIGN KEY ("baseId") REFERENCES "Base"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RepairOrderService" ADD CONSTRAINT "RepairOrderService_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "RepairOrderItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;
