import { Module } from '@nestjs/common';
import { AnimalService } from './animals.service';
import { PrismaService } from 'src/core/prisma/prisma.service';
import { DogNormalizer } from './recomendations/DogNormalizer';
import { RedisService } from 'src/core/redis/redis.service';

@Module({
  providers: [AnimalService, PrismaService, DogNormalizer, RedisService],
  exports: [AnimalService],
})
export class AnimalModule {}
