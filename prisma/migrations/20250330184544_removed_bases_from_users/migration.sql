/*
  Warnings:

  - You are about to drop the `_BaseToUser` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "_BaseToUser" DROP CONSTRAINT "_BaseToUser_A_fkey";

-- DropForeignKey
ALTER TABLE "_BaseToUser" DROP CONSTRAINT "_BaseToUser_B_fkey";

-- DropTable
DROP TABLE "_BaseToUser";
