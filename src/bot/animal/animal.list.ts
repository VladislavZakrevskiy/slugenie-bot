import { Injectable } from '@nestjs/common';
import { Action, Ctx, InjectBot, Update } from 'nestjs-telegraf';
import { RedisService } from 'src/core/redis/redis.service';
import { getRedisKeys } from 'src/core/redis/redisKeys';
import { SessionSceneContext } from 'src/types/Scenes';
import { AnimalService } from '../../animals/animals.service';
import { $Enums, Animal } from '@prisma/client';
import { DogRecommender } from '../../animals/recomendations/DogRecmender';
import { UserService } from 'src/users/users.service';
import { UserPreferences } from 'src/users/types/UserJson';
import { getDefaultText } from 'src/core/helpers/getDefaultText';
import { Telegraf } from 'telegraf';
import { Pagination } from '@vladislav_zakrevskiy/telegraf-pagination';

@Injectable()
@Update()
export class AnimalList {
  constructor(
    private redis: RedisService,
    private animalService: AnimalService,
    private dogRecommender: DogRecommender,
    private userService: UserService,
    @InjectBot() private bot: Telegraf,
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
    const listManager = new Pagination<Animal>({
      data: rec_animals,
      rowSize: 2,
      format: (item) => getDefaultText(item, false),
      buttonModeOptions: { title: 'Забрать', titleKey: 'bring' },
      onlyNavButtons: true,
      isEnabledDeleteButton: false,
      inlineCustomButtons: [
        [{ callback_data: (currentAnimal) => 'bring:' + currentAnimal.id, text: 'Забрать!', hide: false }],
      ],
      messages: { firstPage: 'Это первая страница!', lastPage: 'Это последняя страница!', next: '➡️', prev: '⬅️' },
      pageSize: 1,
      getImage: async (item) => item.image_url[0],
      header: (currentPage, pageSize, total) => `<code>${currentPage}/${total}</code>`,
    });

    return { listManager, currentIndex, animals: rec_animals };
  }

  async handleList(ctx: SessionSceneContext) {
    const { listManager, animals } = await this.getListManager(ctx);

    if (animals.length === 0) {
      await ctx.reply(`Бездомных животных нет!
Но если вы найдете бродягу, то добавляйте по команде /animal`);
      return;
    }

    listManager.handleActions(this.bot);

    const text = await listManager.text();
    const keyboard = await listManager.keyboard();
    const images = await listManager.images();
    ctx.replyWithPhoto({ url: images[0] }, { caption: text, parse_mode: 'HTML', ...keyboard });
  }

  @Action(RegExp('bring:(.+)'))
  async bringAnimal(@Ctx() ctx: SessionSceneContext) {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const animal_id = (ctx.callbackQuery.data as string).split(':')[1];
    const animal = this.animalService.getAnimalById(animal_id);
    const user_id = await this.redis.get(getRedisKeys('user_id', ctx.from.id));
    const user = await this.userService.getUserById(user_id);

    await this.userService.updateUser(user_id, {
      ...user,
      animals: { connect: { id: animal_id } },
    });

    await this.animalService.updateAnimal(animal_id, { ...animal, owner: { connect: { id: user_id } } });
  }
}
