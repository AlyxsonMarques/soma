-- DropForeignKey
ALTER TABLE "Base" DROP CONSTRAINT "Base_addressId_fkey";

-- DropForeignKey
ALTER TABLE "RepairOrderService" DROP CONSTRAINT "RepairOrderService_itemId_fkey";

-- AddForeignKey
ALTER TABLE "Base" ADD CONSTRAINT "Base_addressId_fkey" FOREIGN KEY ("addressId") REFERENCES "BaseAddress"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RepairOrderService" ADD CONSTRAINT "RepairOrderService_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "RepairOrderServiceItem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
