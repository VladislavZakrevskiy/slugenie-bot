/*
  Warnings:

  - Added the required column `json_settings` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "User" ADD COLUMN     "json_settings" JSONB NOT NULL;
