-- CreateEnum
CREATE TYPE "UserType" AS ENUM ('MECHANIC', 'BUDGETIST');

-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('APPROVED', 'REPROVED', 'PENDING');

-- CreateEnum
CREATE TYPE "RepairOrderServiceType" AS ENUM ('PREVENTIVE', 'CORRECTIVE');

-- CreateEnum
CREATE TYPE "RepairOrderServiceStatus" AS ENUM ('PENDING', 'APPROVED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "RepairOrderStatus" AS ENUM ('PENDING', 'REVISION', 'APPROVED', 'PARTIALLY_APPROVED', 'INVOICE_APPROVED', 'CANCELLED');

-- CreateTable
CREATE TABLE "User" (
    "id" UUID NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "cpf" VARCHAR(11) NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "password" TEXT NOT NULL,
    "type" "UserType" NOT NULL,
    "status" "UserStatus" NOT NULL,
    "birthDate" DATE NOT NULL,
    "assistant" BOOLEAN NOT NULL DEFAULT false,
    "observations" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Base" (
    "id" UUID NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "phone" VARCHAR(11) NOT NULL,
    "addressId" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Base_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BaseAddress" (
    "id" UUID NOT NULL,
    "street" VARCHAR(255) NOT NULL,
    "number" INTEGER NOT NULL,
    "complement" VARCHAR(255),
    "neighborhood" VARCHAR(255) NOT NULL,
    "city" VARCHAR(255) NOT NULL,
    "state" VARCHAR(2) NOT NULL,
    "zipCode" VARCHAR(8) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "BaseAddress_pkey" PRIMARY KEY ("id")
);

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

-- CreateTable
CREATE TABLE "RepairOrderService" (
    "id" UUID NOT NULL,
    "itemId" UUID NOT NULL,
    "quantity" SMALLINT NOT NULL,
    "labor" VARCHAR(255) NOT NULL,
    "duration" BIGINT NOT NULL,
    "value" DECIMAL(10,2) NOT NULL,
    "discount" DECIMAL(10,2) NOT NULL,
    "type" "RepairOrderServiceType" NOT NULL,
    "status" "RepairOrderServiceStatus" NOT NULL,
    "repairOrderId" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "RepairOrderService_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RepairOrder" (
    "id" UUID NOT NULL,
    "gcaf" BIGINT NOT NULL,
    "baseId" UUID NOT NULL,
    "plate" VARCHAR(7) NOT NULL,
    "kilometers" INTEGER NOT NULL,
    "status" "RepairOrderStatus" NOT NULL,
    "observations" TEXT,
    "discount" DECIMAL(10,2) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "RepairOrder_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_BaseToUser" (
    "A" UUID NOT NULL,
    "B" UUID NOT NULL,

    CONSTRAINT "_BaseToUser_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_RepairOrderToUser" (
    "A" UUID NOT NULL,
    "B" UUID NOT NULL,

    CONSTRAINT "_RepairOrderToUser_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_cpf_key" ON "User"("cpf");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_email_cpf_idx" ON "User"("email", "cpf");

-- CreateIndex
CREATE INDEX "Base_name_phone_idx" ON "Base"("name", "phone");

-- CreateIndex
CREATE INDEX "BaseAddress_zipCode_city_state_idx" ON "BaseAddress"("zipCode", "city", "state");

-- CreateIndex
CREATE INDEX "RepairOrderItem_name_truckModelId_baseId_idx" ON "RepairOrderItem"("name", "truckModelId", "baseId");

-- CreateIndex
CREATE INDEX "TruckModel_name_brand_year_idx" ON "TruckModel"("name", "brand", "year");

-- CreateIndex
CREATE INDEX "RepairOrderService_itemId_repairOrderId_idx" ON "RepairOrderService"("itemId", "repairOrderId");

-- CreateIndex
CREATE UNIQUE INDEX "RepairOrder_gcaf_key" ON "RepairOrder"("gcaf");

-- CreateIndex
CREATE INDEX "RepairOrder_gcaf_baseId_plate_idx" ON "RepairOrder"("gcaf", "baseId", "plate");

-- CreateIndex
CREATE INDEX "_BaseToUser_B_index" ON "_BaseToUser"("B");

-- CreateIndex
CREATE INDEX "_RepairOrderToUser_B_index" ON "_RepairOrderToUser"("B");

-- AddForeignKey
ALTER TABLE "Base" ADD CONSTRAINT "Base_addressId_fkey" FOREIGN KEY ("addressId") REFERENCES "BaseAddress"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RepairOrderItem" ADD CONSTRAINT "RepairOrderItem_truckModelId_fkey" FOREIGN KEY ("truckModelId") REFERENCES "TruckModel"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RepairOrderItem" ADD CONSTRAINT "RepairOrderItem_baseId_fkey" FOREIGN KEY ("baseId") REFERENCES "Base"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RepairOrderService" ADD CONSTRAINT "RepairOrderService_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "RepairOrderItem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RepairOrderService" ADD CONSTRAINT "RepairOrderService_repairOrderId_fkey" FOREIGN KEY ("repairOrderId") REFERENCES "RepairOrder"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RepairOrder" ADD CONSTRAINT "RepairOrder_baseId_fkey" FOREIGN KEY ("baseId") REFERENCES "Base"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_BaseToUser" ADD CONSTRAINT "_BaseToUser_A_fkey" FOREIGN KEY ("A") REFERENCES "Base"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_BaseToUser" ADD CONSTRAINT "_BaseToUser_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_RepairOrderToUser" ADD CONSTRAINT "_RepairOrderToUser_A_fkey" FOREIGN KEY ("A") REFERENCES "RepairOrder"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_RepairOrderToUser" ADD CONSTRAINT "_RepairOrderToUser_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
