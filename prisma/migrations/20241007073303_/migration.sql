/*
  Warnings:

  - Added the required column `fur` to the `Animal` table without a default value. This is not possible if the table is not empty.
  - Added the required column `size` to the `Animal` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Animal" ADD COLUMN     "fur" INTEGER NOT NULL,
ADD COLUMN     "size" TEXT NOT NULL;
