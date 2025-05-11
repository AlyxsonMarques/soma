-- DropForeignKey
ALTER TABLE "Base" DROP CONSTRAINT "Base_addressId_fkey";

-- DropForeignKey
ALTER TABLE "RepairOrder" DROP CONSTRAINT "RepairOrder_baseId_fkey";

-- DropForeignKey
ALTER TABLE "RepairOrderService" DROP CONSTRAINT "RepairOrderService_itemId_fkey";

-- DropForeignKey
ALTER TABLE "RepairOrderService" DROP CONSTRAINT "RepairOrderService_repairOrderId_fkey";

-- DropForeignKey
ALTER TABLE "RepairOrderServiceItem" DROP CONSTRAINT "RepairOrderServiceItem_baseId_fkey";

-- AddForeignKey
ALTER TABLE "Base" ADD CONSTRAINT "Base_addressId_fkey" FOREIGN KEY ("addressId") REFERENCES "BaseAddress"("id") ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RepairOrderServiceItem" ADD CONSTRAINT "RepairOrderServiceItem_baseId_fkey" FOREIGN KEY ("baseId") REFERENCES "Base"("id") ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RepairOrderService" ADD CONSTRAINT "RepairOrderService_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "RepairOrderServiceItem"("id") ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RepairOrderService" ADD CONSTRAINT "RepairOrderService_repairOrderId_fkey" FOREIGN KEY ("repairOrderId") REFERENCES "RepairOrder"("id") ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RepairOrder" ADD CONSTRAINT "RepairOrder_baseId_fkey" FOREIGN KEY ("baseId") REFERENCES "Base"("id") ON DELETE NO ACTION ON UPDATE CASCADE;
