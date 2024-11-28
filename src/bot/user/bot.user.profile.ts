import { Injectable } from '@nestjs/common';
import { Action, Ctx, InjectBot, Update } from 'nestjs-telegraf';
import { UserService } from '../../users/users.service';
import { AnimalService } from '../../animals/animals.service';
import { SessionSceneContext } from 'src/types/Scenes';
import { $Enums } from '@prisma/client';
import { RedisService } from 'src/core/redis/redis.service';
import { getRedisKeys } from 'src/core/redis/redisKeys';
import { getDefaultText } from 'src/core/helpers/getDefaultText';
import { getTelegramImage } from 'src/core/helpers/getTelegramImage';
import { Pagination } from '@vladislav_zakrevskiy/telegraf-pagination';
import { Telegraf } from 'telegraf';

@Injectable()
@Update()
export class UserProfileService {
  constructor(
    private userService: UserService,
    private animalService: AnimalService,
    private redis: RedisService,
    @InjectBot() private bot: Telegraf,
  ) {}

  // ListManager and some data
  async getListManager(ctx: SessionSceneContext, type: $Enums.AnimalStatus) {
    const currentIndex = Number(await this.redis.get(getRedisKeys('currentIndex_animal', type, ctx.chat.id)));
    const user_id = await this.redis.get(getRedisKeys('user_id', ctx.chat.id));
    const animals = await this.animalService.getAllAnimals({ status: type, publicaterId: user_id });
    const listManager = new Pagination({
      data: animals,
      rowSize: 2,
      format: (item) => getDefaultText(item),
      onlyNavButtons: true,
      isEnabledDeleteButton: false,
      inlineCustomButtons: null,
      messages: { firstPage: 'Это первая страница!', lastPage: 'Это последняя страница!', next: '➡️', prev: '⬅️' },
      pageSize: 1,
      getImage: async (item) => item.image_url[0],
      header: (currentPage, pageSize, total) => `<code>${currentPage}/${total}</code>`,
    });

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

    listManager.handleActions(this.bot);

    const text = await listManager.text();
    const keyboard = await listManager.keyboard();
    const images = await listManager.images();
    ctx.replyWithPhoto({ url: images[0] }, { caption: text, parse_mode: 'HTML', ...keyboard });
  }

  @Action('candidate_animals')
  async getCandidateAnimals(@Ctx() ctx: SessionSceneContext) {
    const { listManager, animals } = await this.getListManager(ctx, $Enums.AnimalStatus.AVAILABLE);

    if (animals.length === 0) {
      await ctx.reply(`У вас нет животных(
Но вы можете выбрать! Введите /animal_list`);
      return;
    }

    listManager.handleActions(this.bot);

    const text = await listManager.text();
    const keyboard = await listManager.keyboard();
    const images = await listManager.images();
    ctx.replyWithPhoto({ url: images[0] }, { caption: text, parse_mode: 'HTML', ...keyboard });
  }
}
