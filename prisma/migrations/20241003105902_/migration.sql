-- CreateTable
CREATE TABLE "_CandidateAnimals" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_CandidateAnimals_AB_unique" ON "_CandidateAnimals"("A", "B");

-- CreateIndex
CREATE INDEX "_CandidateAnimals_B_index" ON "_CandidateAnimals"("B");

-- AddForeignKey
ALTER TABLE "_CandidateAnimals" ADD CONSTRAINT "_CandidateAnimals_A_fkey" FOREIGN KEY ("A") REFERENCES "Animal"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CandidateAnimals" ADD CONSTRAINT "_CandidateAnimals_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
