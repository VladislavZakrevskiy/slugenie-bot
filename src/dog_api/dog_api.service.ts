import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { RedisService } from 'src/core/redis/redis.service';

@Injectable()
export class DogApiService {
  constructor(
    private http: HttpService,
    private redis: RedisService,
  ) {}

  async getBreeds(): Promise<string[]> {
    const cache = await this.redis.get<string[]>('breed_cache');
    if (cache) {
      return cache;
    } else {
      const breeds = await this.http.axiosRef.get<void, { name: string }[]>('https://api.thedogapi.com/v1/breeds', {
        headers: { 'x-api-key': process.env.DOG_API_ACCESS_TOKEN },
      });
      await this.redis.set('breed_cache', breeds, 60 * 60 * 24 * 7);
      return breeds.map(({ name }) => name);
    }
  }
}
