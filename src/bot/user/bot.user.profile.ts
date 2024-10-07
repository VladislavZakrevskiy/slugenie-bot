import { Injectable } from '@nestjs/common';
import { Action, Ctx, Update } from 'nestjs-telegraf';
import { UserService } from '../../users/users.service';
import { AnimalService } from '../../animals/animals.service';
import { SessionSceneContext } from 'src/types/Scenes';
import { $Enums } from '@prisma/client';
import { RedisService } from 'src/core/redis/redis.service';
import { getRedisKeys } from 'src/core/redis/redisKeys';
import { ListManager } from 'src/core/helpers/ListManager';
import { getDefaultText } from 'src/core/helpers/getDefaultText';
import { getTelegramImage } from 'src/core/helpers/getTelegramImage';

@Injectable()
@Update()
export class UserProfileService {
  constructor(
    private userService: UserService,
    private animalService: AnimalService,
    private redis: RedisService,
  ) {}

  // ListManager and some data
  async getListManager(ctx: SessionSceneContext, type: $Enums.AnimalStatus) {
    const currentIndex = Number(await this.redis.get(getRedisKeys('currentIndex_animal', type, ctx.chat.id)));
    const user_id = await this.redis.get(getRedisKeys('user_id', ctx.chat.id));
    const animals = await this.animalService.getAllAnimals({ status: type, ownerId: user_id });
    const listManager = new ListManager(
      this.redis,
      animals,
      {
        getText: (animal) => getDefaultText(animal),
        getImage: async (order) => order.image_url[0],
      },
      ctx,
      'currentIndex_animal',
      type,
    );

    return { listManager, currentIndex, animals };
  }

  // Profile
  async handleProfile(ctx: SessionSceneContext) {
    console.log('profile');
    const user_id = await this.redis.get(getRedisKeys('user_id', ctx.chat.id));
    const user = await this.userService.getUserById(user_id);
    const photo_url = await getTelegramImage(ctx, ctx.from.id);

    ctx.sendPhoto(
      { url: photo_url.toString() },
      {
        caption: getDefaultText(user),
        parse_mode: 'HTML',
        reply_markup: {
          inline_keyboard: [
            [{ callback_data: 'my_animals', text: 'Мои животные' }],
            [{ callback_data: 'candidate_animals', text: 'Выбранные животные' }],
          ],
        },
      },
    );
  }

  @Action('my_animals')
  async getMyAnimals(@Ctx() ctx: SessionSceneContext) {
    const { listManager, animals } = await this.getListManager(ctx, $Enums.AnimalStatus.ADOPTED);

    if (animals.length === 0) {
      await ctx.reply(`У вас нет животных(
Но вы можете выбрать! Введите /animal_list`);
      return;
    }

    listManager.sendInitialMessage();
  }

  @Action('candidate_animals')
  async getCandidateAnimals(@Ctx() ctx: SessionSceneContext) {
    const { listManager, animals } = await this.getListManager(ctx, $Enums.AnimalStatus.AVAILABLE);

    if (animals.length === 0) {
      await ctx.reply(`У вас нет животных(
Но вы можете выбрать! Введите /animal_list`);
      return;
    }

    listManager.sendInitialMessage();
  }

  // TODO Next/prev
}
