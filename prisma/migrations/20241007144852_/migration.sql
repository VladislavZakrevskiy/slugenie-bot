/*
  Warnings:

  - Added the required column `publicaterId` to the `Animal` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Animal" ADD COLUMN     "publicaterId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "Animal" ADD CONSTRAINT "Animal_publicaterId_fkey" FOREIGN KEY ("publicaterId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
