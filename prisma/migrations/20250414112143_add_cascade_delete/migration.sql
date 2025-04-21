-- DropForeignKey
ALTER TABLE "RepairOrderService" DROP CONSTRAINT "RepairOrderService_itemId_fkey";

-- DropForeignKey
ALTER TABLE "RepairOrderServiceItem" DROP CONSTRAINT "RepairOrderServiceItem_baseId_fkey";

-- CreateTable
CREATE TABLE "_BaseToUser" (
    "A" UUID NOT NULL,
    "B" UUID NOT NULL,

    CONSTRAINT "_BaseToUser_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_BaseToUser_B_index" ON "_BaseToUser"("B");

-- AddForeignKey
ALTER TABLE "RepairOrderServiceItem" ADD CONSTRAINT "RepairOrderServiceItem_baseId_fkey" FOREIGN KEY ("baseId") REFERENCES "Base"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RepairOrderService" ADD CONSTRAINT "RepairOrderService_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "RepairOrderServiceItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_BaseToUser" ADD CONSTRAINT "_BaseToUser_A_fkey" FOREIGN KEY ("A") REFERENCES "Base"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_BaseToUser" ADD CONSTRAINT "_BaseToUser_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
