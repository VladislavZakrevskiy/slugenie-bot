/*
  Warnings:

  - Changed the type of `age` on the `Animal` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `fur` on the `Animal` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `size` on the `Animal` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "Fur" AS ENUM ('SHORT', 'MEDIUM', 'LONG');

-- CreateEnum
CREATE TYPE "Age" AS ENUM ('PUPPY', 'YOUNG', 'ADULT', 'SENIOR');

-- CreateEnum
CREATE TYPE "Size" AS ENUM ('VERY_BIG', 'BIG', 'MEDIUM', 'SMALL', 'VERY_SMALL');

-- AlterTable
ALTER TABLE "Animal" DROP COLUMN "age",
ADD COLUMN     "age" "Age" NOT NULL,
DROP COLUMN "fur",
ADD COLUMN     "fur" "Fur" NOT NULL,
DROP COLUMN "size",
ADD COLUMN     "size" "Size" NOT NULL;
