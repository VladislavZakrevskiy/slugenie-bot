import { Injectable } from '@nestjs/common';
import { Action, Ctx, Update } from 'nestjs-telegraf';
import { RedisService } from 'src/core/redis/redis.service';
import { getRedisKeys } from 'src/core/redis/redisKeys';
import { SessionSceneContext } from 'src/types/Scenes';
import { AnimalService } from '../../animals/animals.service';
import { ListManager } from 'src/core/helpers/ListManager';
import { getDefaultText } from 'src/core/helpers/getDefaultText';
import { $Enums } from '@prisma/client';
import { DogRecommender } from '../../animals/recomendations/DogRecmender';
import { UserService } from 'src/users/users.service';
import { UserPreferences } from 'src/users/types/UserJson';

@Injectable()
@Update()
export class AnimalList {
  constructor(
    private redis: RedisService,
    private animalService: AnimalService,
    private dogRecommender: DogRecommender,
    private userService: UserService,
  ) {}

  async getListManager(ctx: SessionSceneContext) {
    const user_id = await this.redis.get(getRedisKeys('user_id', ctx.chat.id));
    const user = await this.userService.getUserById(user_id);
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const json_settings = user?.preferences as UserPreferences;
    const user_preferences = json_settings ? json_settings : { breed: {}, size: {}, age: {}, fur: {} };

    const currentIndex = Number(await this.redis.get(getRedisKeys('currentIndex_animallist', 'list', ctx.chat.id)));
    const animals = await this.animalService.getAllAnimals({
      status: $Enums.AnimalStatus.AVAILABLE,
      notPublicaterId: user_id,
    });
    const rec_animals = this.dogRecommender.recommend(animals, user_preferences);
    const listManager = new ListManager(
      this.redis,
      rec_animals,
      {
        getText: (animal) => getDefaultText(animal),
        getImage: async (order) => order.image_url[0],
      },
      ctx,
      'currentIndex_animallist',
      'list',
    );

    return { listManager, currentIndex, animals: rec_animals };
  }

  async handleList(ctx: SessionSceneContext) {
    const { listManager, animals } = await this.getListManager(ctx);

    if (animals.length === 0) {
      await ctx.reply(`Бездомных животных нет!
Но если вы найдете бродягу, то добавляйте по команде /animal`);
      return;
    }

    listManager.sendInitialMessage();
  }

  // List
  @Action('next_currentIndex_animallist_list')
  public async onNextAnimal(@Ctx() ctx: SessionSceneContext): Promise<void> {
    console.log('next');
    const { currentIndex, listManager, animals } = await this.getListManager(ctx);

    if (currentIndex < animals.length - 1) {
      await this.redis.set(getRedisKeys('currentIndex_animallist', 'list', ctx.chat.id), currentIndex + 1);
      await listManager.editMessage();
    } else {
      await ctx.answerCbQuery('Нет следующего элемента');
    }
  }

  @Action('prev_currentIndex_animallist_list')
  public async onPrevAnimal(@Ctx() ctx: SessionSceneContext): Promise<void> {
    console.log('prev');
    const { currentIndex, listManager } = await this.getListManager(ctx);

    if (currentIndex > 0) {
      await this.redis.set(getRedisKeys('currentIndex_animallist', 'list', ctx.chat.id), currentIndex - 1);
      await listManager.editMessage();
    } else {
      await ctx.answerCbQuery('Нет предыдущего элемента');
    }
  }
}
