/*
  Warnings:

  - Added the required column `normilized_animal` to the `Animal` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Animal" ADD COLUMN     "normilized_animal" JSONB NOT NULL;
