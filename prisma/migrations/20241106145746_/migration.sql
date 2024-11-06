-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ORGANIZATION', 'INDIVIDUAL');

-- CreateEnum
CREATE TYPE "AnimalStatus" AS ENUM ('AVAILABLE', 'ADOPTED');

-- CreateEnum
CREATE TYPE "Permission" AS ENUM ('SUPER_ADMIN', 'ADMIN', 'USER');

-- CreateEnum
CREATE TYPE "Fur" AS ENUM ('SHORT', 'MEDIUM', 'LONG', 'NO');

-- CreateEnum
CREATE TYPE "Age" AS ENUM ('PUPPY', 'YOUNG', 'ADULT', 'SENIOR');

-- CreateEnum
CREATE TYPE "Size" AS ENUM ('VERY_BIG', 'BIG', 'MEDIUM', 'SMALL', 'VERY_SMALL');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "tg_user_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "surname" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "adress" TEXT NOT NULL,
    "phone_number" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'INDIVIDUAL',
    "permission" "Permission" NOT NULL,
    "is_notifications" BOOLEAN NOT NULL DEFAULT true,
    "preferences" JSON,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Animal" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "breed" TEXT,
    "age" "Age" NOT NULL,
    "size" "Size" NOT NULL,
    "fur" "Fur" NOT NULL,
    "adress" TEXT NOT NULL,
    "description" TEXT,
    "image_url" TEXT[],
    "ownerId" TEXT,
    "publicaterId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" "AnimalStatus" NOT NULL DEFAULT 'AVAILABLE',
    "normilized_animal" JSONB NOT NULL,

    CONSTRAINT "Animal_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- AddForeignKey
ALTER TABLE "Animal" ADD CONSTRAINT "Animal_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Animal" ADD CONSTRAINT "Animal_publicaterId_fkey" FOREIGN KEY ("publicaterId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
