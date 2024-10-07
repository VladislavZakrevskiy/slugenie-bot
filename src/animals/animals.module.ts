import { Module } from '@nestjs/common';
import { AnimalService } from './animals.service';
import { PrismaService } from 'src/core/prisma/prisma.service';

@Module({
  providers: [AnimalService, PrismaService],
  exports: [AnimalService],
})
export class AnimalModule {}
