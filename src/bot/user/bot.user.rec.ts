import { Injectable } from '@nestjs/common';
import { Ctx, Action } from 'nestjs-telegraf';
import { ListManager } from 'src/core/helpers/ListManager';
import { RedisService } from 'src/core/redis/redis.service';
import { getRedisKeys } from 'src/core/redis/redisKeys';
import { SessionSceneContext } from 'src/types/Scenes';
import { AnimalService } from '../../animals/animals.service';
import { getDefaultText } from 'src/core/helpers/getDefaultText';

@Injectable()
export class DogSurvey {
  constructor(
    private redis: RedisService,
    private animalService: AnimalService,
  ) {}

  async getListManager(ctx: SessionSceneContext) {
    const currentIndex = Number(await this.redis.get(getRedisKeys('currentIndex_recs', '', ctx.chat.id)));
    const animals = await this.animalService.getRandomAnimals({ limit: 10 });
    const listManager = new ListManager(
      this.redis,
      animals,
      {
        getText: (animal) => getDefaultText(animal),
        getImage: async (order) => order.image_url[0],
        extraButtons: [
          [
            { callback_data: 'like', text: '👍' },
            { callback_data: 'dislike', text: '👎' },
          ],
        ],
      },
      ctx,
      'currentIndex_animal',
      '',
    );

    return { listManager, currentIndex, animals };
  }

  async handleAnimalRecs(ctx: SessionSceneContext) {
    const { listManager, animals } = await this.getListManager(ctx);

    if (animals.length === 0) {
      await ctx.reply(`Нет собак для опросы(((`);
      return;
    }

    this.redis.delete(getRedisKeys('user_pref', ctx.chat.id));
    listManager.sendInitialMessage();
  }

  @Action('like')
  async onLike(@Ctx() ctx: SessionSceneContext) {
    const { animals, currentIndex, listManager } = await this.getListManager(ctx);
    if (currentIndex < animals.length - 1) {
      await this.redis.set(getRedisKeys('currentIndex_animal', 'list', ctx.chat.id), currentIndex + 1);
      const currentDog = animals[currentIndex];
      this.redis.addToList(getRedisKeys('user_pref', ctx.chat.id), { id: currentDog.id, is_like: true });
      await ctx.answerCbQuery('Вы выбрали "Нравится"');
      await listManager.editMessage();
    } else {
      await this.saveUserPreferences(ctx);
    }
  }

  @Action('dislike')
  async onDislike(@Ctx() ctx: SessionSceneContext) {
    const { animals, currentIndex, listManager } = await this.getListManager(ctx);
    if (currentIndex < animals.length - 1) {
      await this.redis.set(getRedisKeys('currentIndex_animal', 'list', ctx.chat.id), currentIndex + 1);
      const currentDog = animals[currentIndex];
      this.redis.addToList(getRedisKeys('user_pref', ctx.chat.id), { id: currentDog.id, is_like: false });
      await ctx.answerCbQuery('Вы выбрали "Нравится"');
      await listManager.editMessage();
    } else {
      await this.saveUserPreferences(ctx);
    }
  }

  async saveUserPreferences(ctx: SessionSceneContext) {
    const user_pref = await this.redis.get<{ id: string; is_like: boolean }[]>(getRedisKeys('user_pref', ctx.chat.id));
    console.log(user_pref);
  }
}
