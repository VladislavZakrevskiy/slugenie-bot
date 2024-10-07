/*
  Warnings:

  - Added the required column `permission` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "Permission" AS ENUM ('SUPER_ADMIN', 'ADMIN', 'USER');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "permission" "Permission" NOT NULL;
