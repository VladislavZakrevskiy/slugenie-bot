import { RedisService } from 'src/core/redis/redis.service';
import { getRedisKeys } from 'src/core/redis/redisKeys';
import { SessionSceneContext } from 'src/types/Scenes';
import { AnimalService } from '../../animals/animals.service';
import { getDefaultText } from 'src/core/helpers/getDefaultText';
import { Pagination } from '@vladislav_zakrevskiy/telegraf-pagination';
import { Action, Ctx, InjectBot, Update } from 'nestjs-telegraf';
import { Telegraf } from 'telegraf';

@Update()
export class DogSurvey {
  constructor(
    private redis: RedisService,
    private animalService: AnimalService,
    @InjectBot() private bot: Telegraf,
  ) {}

  async getListManager(ctx: SessionSceneContext) {
    const currentIndex = Number(await this.redis.get(getRedisKeys('currentIndex_recs', '', ctx.chat.id)));
    const animals = await this.animalService.getRandomAnimals({ limit: 10 });
    const listManager = new Pagination({
      data: animals,
      rowSize: 2,
      format: (item) => getDefaultText(item),
      onlyNavButtons: true,
      isEnabledDeleteButton: false,
      buttonModeOptions: { isSimpleArray: true },
      inlineCustomButtons: [
        [
          { text: '👎', callback_data: 'dislike', hide: false },
          { text: '👍', callback_data: 'like', hide: false },
        ],
      ],
      messages: { firstPage: 'Это первая страница!', lastPage: 'Это последняя страница!', next: '➡️', prev: '⬅️' },
      pageSize: 1,
      getImage: async (item) => item.image_url[0],
      header: (currentPage, pageSize, total) => `<code>${currentPage}/${total}</code>`,
    });
    return { listManager, currentIndex, animals };
  }

  async handleAnimalRecs(ctx: SessionSceneContext) {
    const { listManager, animals } = await this.getListManager(ctx);

    if (animals.length === 0) {
      await ctx.reply(`Нет собак для опросы(((`);
      return;
    }

    this.redis.delete(getRedisKeys('user_pref', ctx.chat.id));
    listManager.handleActions(this.bot);

    const text = await listManager.text();
    const keyboard = await listManager.keyboard();
    const images = await listManager.images();
    ctx.replyWithPhoto({ url: images[0] }, { caption: text, parse_mode: 'HTML', ...keyboard });
  }

  @Action('like')
  async like(@Ctx() ctx: SessionSceneContext) {
    await ctx.answerCbQuery('Лайк 👍');
  }

  @Action('dislike')
  async dislike(@Ctx() ctx: SessionSceneContext) {
    await ctx.answerCbQuery('Дизлайк 👎');
  }

  async saveUserPreferences(ctx: SessionSceneContext) {
    await this.redis.get<{ id: string; is_like: boolean }[]>(getRedisKeys('user_pref', ctx.chat.id));
  }
}
