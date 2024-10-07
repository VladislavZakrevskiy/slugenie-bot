-- DropForeignKey
ALTER TABLE "Animal" DROP CONSTRAINT "Animal_ownerId_fkey";

-- AlterTable
ALTER TABLE "Animal" ALTER COLUMN "name" DROP NOT NULL,
ALTER COLUMN "ownerId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Animal" ADD CONSTRAINT "Animal_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
