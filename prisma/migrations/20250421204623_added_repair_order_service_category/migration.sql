/*
  Warnings:

  - Added the required column `category` to the `RepairOrderService` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "RepairOrderServiceCategory" AS ENUM ('LABOR', 'MATERIAL');

-- AlterTable
ALTER TABLE "RepairOrderService" ADD COLUMN     "category" "RepairOrderServiceCategory" NOT NULL;
