/*
  Warnings:

  - You are about to drop the column `inDataset` on the `Animal` table. All the data in the column will be lost.
  - You are about to drop the `Survey` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_CandidateAnimals` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Survey" DROP CONSTRAINT "Survey_animalId_fkey";

-- DropForeignKey
ALTER TABLE "Survey" DROP CONSTRAINT "Survey_userId_fkey";

-- DropForeignKey
ALTER TABLE "_CandidateAnimals" DROP CONSTRAINT "_CandidateAnimals_A_fkey";

-- DropForeignKey
ALTER TABLE "_CandidateAnimals" DROP CONSTRAINT "_CandidateAnimals_B_fkey";

-- AlterTable
ALTER TABLE "Animal" DROP COLUMN "inDataset";

-- DropTable
DROP TABLE "Survey";

-- DropTable
DROP TABLE "_CandidateAnimals";

-- CreateTable
CREATE TABLE "Candidate" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "animalId" TEXT NOT NULL,

    CONSTRAINT "Candidate_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Candidate" ADD CONSTRAINT "Candidate_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Candidate" ADD CONSTRAINT "Candidate_animalId_fkey" FOREIGN KEY ("animalId") REFERENCES "Animal"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
