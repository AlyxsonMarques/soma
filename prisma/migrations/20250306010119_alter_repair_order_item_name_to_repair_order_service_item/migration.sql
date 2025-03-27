/*
  Warnings:

  - You are about to drop the `RepairOrderItem` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "RepairOrderItem" DROP CONSTRAINT "RepairOrderItem_baseId_fkey";

-- DropForeignKey
ALTER TABLE "RepairOrderItem" DROP CONSTRAINT "RepairOrderItem_truckModelId_fkey";

-- DropForeignKey
ALTER TABLE "RepairOrderService" DROP CONSTRAINT "RepairOrderService_itemId_fkey";

-- DropTable
DROP TABLE "RepairOrderItem";

-- CreateTable
CREATE TABLE "RepairOrderServiceItem" (
    "id" UUID NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "truckModelId" UUID NOT NULL,
    "value" DECIMAL(10,2) NOT NULL,
    "baseId" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "RepairOrderServiceItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "RepairOrderServiceItem_name_truckModelId_baseId_idx" ON "RepairOrderServiceItem"("name", "truckModelId", "baseId");

-- AddForeignKey
ALTER TABLE "RepairOrderServiceItem" ADD CONSTRAINT "RepairOrderServiceItem_truckModelId_fkey" FOREIGN KEY ("truckModelId") REFERENCES "TruckModel"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RepairOrderServiceItem" ADD CONSTRAINT "RepairOrderServiceItem_baseId_fkey" FOREIGN KEY ("baseId") REFERENCES "Base"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RepairOrderService" ADD CONSTRAINT "RepairOrderService_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "RepairOrderServiceItem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
