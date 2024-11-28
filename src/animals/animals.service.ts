import { Injectable } from '@nestjs/common';
import { Animal, $Enums, User, Prisma } from '@prisma/client';
import { PrismaService } from 'src/core/prisma/prisma.service';
import { AnimalFormDto } from './dto/AnimalFornDto';
import { DogNormalizer, NormalizedDogChar } from './recomendations/DogNormalizer';
import { RedisService } from 'src/core/redis/redis.service';
import { getRedisKeys } from 'src/core/redis/redisKeys';
import { UserPreferences } from 'src/users/types/UserJson';
import { sigmoid } from 'src/core/helpers/sigmoid';

@Injectable()
export class AnimalService {
  constructor(
    private readonly prisma: PrismaService,
    private redis: RedisService,
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
    const user_id = await this.redis.get(getRedisKeys('user_id', data.publicaterId));
    delete data.publicaterId;

    console.log(user_id);
    return this.prisma.animal.create({
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      data: {
        ...data,
        publicaterId: user_id,
        normilized_animal: JSON.stringify(dogNormalizedData),
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
    publicaterId,
    notPublicaterId,
    notOwnerId,
  }: {
    status?: $Enums.AnimalStatus;
    ownerId?: string;
    limit?: number;
    skip?: number;
    publicaterId?: string;
    notPublicaterId?: string;
    notOwnerId?: string;
  }): Promise<Animal[]> {
    return this.prisma.animal.findMany({
      take: limit,
      skip,
      where: {
        status,
        ownerId: { equals: ownerId, not: notOwnerId },
        publicaterId: { not: notPublicaterId, equals: publicaterId },
      },
      orderBy: { createdAt: 'desc' },
      include: { publicater: true },
    });
  }

  async getRandomAnimals({ limit = 10 }: { limit: number }): Promise<Animal[]> {
    return await this.prisma.animal.findMany({ take: limit });
  }

  async getRecomendAnimal(user: User) {
    const animals = await this.prisma.animal.findMany();
    const bestAnimal: { score: number; animal: Animal | null } = { score: -1000, animal: null };
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const userPreference = user.preferences as UserPreferences;
    for (const candidateAnimal of animals) {
      let score = 0;
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      const animalChar = candidateAnimal.normilized_animal as NormalizedDogChar;
      if (userPreference.fur[animalChar.breed]) {
        score += sigmoid(
          ((animalChar.age - userPreference.age[animalChar.breed]) ** 2 +
            (animalChar.age - userPreference.age[animalChar.breed]) ** 2 +
            (animalChar.age - userPreference.age[animalChar.breed]) ** 2) **
            0.5,
        );
      }
      if (bestAnimal.score < score) {
        bestAnimal.score = score;
        bestAnimal.animal = candidateAnimal;
      }
    }
    return bestAnimal.animal as Animal;
  }

  // Обновление животного
  async updateAnimal(
    id: string,
    data: {
      id?: Prisma.StringFieldUpdateOperationsInput | string;
      name?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
      breed?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
      age?: Prisma.EnumAgeFieldUpdateOperationsInput | $Enums.Age;
      size?: Prisma.EnumSizeFieldUpdateOperationsInput | $Enums.Size;
      fur?: Prisma.EnumFurFieldUpdateOperationsInput | $Enums.Fur;
      adress?: Prisma.StringFieldUpdateOperationsInput | string;
      description?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
      image_url?: Prisma.AnimalUpdateimage_urlInput | string[];
      createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
      status?: Prisma.EnumAnimalStatusFieldUpdateOperationsInput | $Enums.AnimalStatus;
      normilized_animal?: Prisma.JsonNullValueInput | Prisma.InputJsonValue;
      owner?: Prisma.UserUpdateOneWithoutAnimalsNestedInput;
      publicater?: Prisma.UserUpdateOneRequiredWithoutPublicated_animalsNestedInput;
    },
  ): Promise<Animal> {
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
