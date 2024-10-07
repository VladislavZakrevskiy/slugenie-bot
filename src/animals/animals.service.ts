import { Injectable } from '@nestjs/common';
import { Animal, $Enums } from '@prisma/client';
import { PrismaService } from 'src/core/prisma/prisma.service';
import { AnimalFormDto } from './dto/AnimalFornDto';
import { DogNormalizer } from './recomendations/DogNormalizer';

@Injectable()
export class AnimalService {
  constructor(
    private readonly prisma: PrismaService,
    private dogNormalizer: DogNormalizer,
  ) {}

  async createAnimal(data: AnimalFormDto): Promise<Animal> {
    const dogNormalizedData = await this.dogNormalizer.normalize({
      age: data.age,
      breed: data.breed,
      fur: data.fur,
      photo: data.image_url[0],
      size: data.size,
    });

    return this.prisma.animal.create({
      data: {
        ...data,
        normilized_animal: dogNormalizedData,
      },
    });
  }

  async getAnimalById(id: string): Promise<Animal | null> {
    return this.prisma.animal.findUnique({
      where: { id },
    });
  }

  // Получение всех животных
  async getAllAnimals({
    status,
    limit,
    skip,
    ownerId,
  }: {
    status?: $Enums.AnimalStatus;
    ownerId?: string;
    limit?: number;
    skip?: number;
  }): Promise<Animal[]> {
    return this.prisma.animal.findMany({
      take: limit,
      skip,
      where: { status, ownerId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getRandomAnimals({ limit = 10 }: { limit: number }): Promise<Animal[]> {
    return await this.prisma.$queryRaw`SELECT * FROM public."Animal" BY RANDOM() LIMIT ${limit}`;
  }

  // Обновление животного
  async updateAnimal(id: string, data: Partial<Animal>): Promise<Animal> {
    return this.prisma.animal.update({
      where: { id },
      data,
    });
  }

  // Удаление животного
  async deleteAnimal(id: string): Promise<Animal> {
    return this.prisma.animal.delete({
      where: { id },
    });
  }
}
