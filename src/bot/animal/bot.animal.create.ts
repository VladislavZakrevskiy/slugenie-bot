import { Injectable } from '@nestjs/common';
import { Ctx, Scene, SceneEnter, Command, On } from 'nestjs-telegraf';
import { AnimalService } from 'src/animals/animals.service';
import { ScenesList, SessionSceneContext } from 'src/types/Scenes';
import { AnimalFormDto } from '../../animals/dto/AnimalFornDto';
import { getDefaultText } from 'src/core/helpers/getDefaultText';
import { Markup } from 'telegraf';
import { $Enums } from '@prisma/client';

@Injectable()
@Scene(ScenesList.ANIMAL_FORM)
export class AnimalFormScene {
  constructor(private readonly animalService: AnimalService) {}

  @SceneEnter()
  async onSceneEnter(@Ctx() ctx: SessionSceneContext) {
    await ctx.reply('Введите породу животного:');
    ctx.scene.session.state = {};
  }

  @Command('animal_done')
  async onDone(@Ctx() ctx: SessionSceneContext) {
    const state = ctx.scene.session.state as AnimalFormDto;

    // Проверка наличия изображений
    if (!state.image_url || state.image_url.length === 0) {
      await ctx.reply('Вы не загрузили ни одного изображения. Пожалуйста, загрузите хотя бы одно.');
      return;
    }

    // Создание животного в базе
    const { message_id } = await ctx.reply('Загрузка, подождите ⌚');
    const animal = await this.animalService.createAnimal({
      ...state,
      publicaterId: String(ctx.chat.id),
    });
    await ctx.deleteMessage(message_id);
    await ctx.replyWithPhoto({ url: state.image_url[0] }, { caption: getDefaultText(animal), parse_mode: 'HTML' });

    await ctx.reply('Данные о животном успешно сохранены!');
    await ctx.scene.leave();
  }

  @Command('cancel')
  async onCancel(@Ctx() ctx: SessionSceneContext) {
    await ctx.reply('Регистрация животного отменена.');
    await ctx.scene.leave();
  }

  @On('text')
  async onText(@Ctx() ctx: SessionSceneContext) {
    const state = ctx.scene.session.state as Partial<AnimalFormDto>;
    const text = ctx.text;

    // Шаг 1: Проверка породы
    if (!state.breed) {
      if (text.length < 2) {
        await ctx.reply('Название породы должно содержать хотя бы 2 символа. Попробуйте снова:');
        return;
      }
      state.breed = text;
      await ctx.reply('Введите имя животного:');
      return;
    }

    // Шаг 2: Проверка имени
    if (state.name === undefined) {
      state.name = text || null;
      await ctx.reply(
        'Выберите возраст собаки:',
        Markup.keyboard([
          [Markup.button.text('Щенок')],
          [Markup.button.text('Молодой/ая')],
          [Markup.button.text('Взрослый/ая')],
          [Markup.button.text('Старый/ая')],
        ])
          .resize()
          .oneTime(),
      );
      return;
    }

    // Шаг 3: Проверка возраста
    if (!state.age) {
      switch (text) {
        case 'Щенок':
          state.age = $Enums.Age.PUPPY;
          break;
        case 'Молодой/ая':
          state.age = $Enums.Age.YOUNG;
          break;
        case 'Взрослый/ая':
          state.age = $Enums.Age.ADULT;
          break;
        case 'Старый/ая':
          state.age = $Enums.Age.SENIOR;
          break;
        default:
          await ctx.reply('Пожалуйста, выберите возраст из предложенных вариантов.');
          return;
      }

      await ctx.reply(
        'Выберите размер собаки:',
        Markup.keyboard([
          [Markup.button.text('Очень большая')],
          [Markup.button.text('Большая')],
          [Markup.button.text('Средняя')],
          [Markup.button.text('Маленькая')],
          [Markup.button.text('Очень маленькая')],
        ])
          .resize()
          .oneTime(),
      );
      return;
    }

    // Шаг 4: Проверка размера
    if (!state.size) {
      switch (text) {
        case 'Очень большая':
          state.size = $Enums.Size.VERY_BIG;
          break;
        case 'Большая':
          state.size = $Enums.Size.BIG;
          break;
        case 'Средняя':
          state.size = $Enums.Size.MEDIUM;
          break;
        case 'Маленькая':
          state.size = $Enums.Size.SMALL;
          break;
        case 'Очень маленькая':
          state.size = $Enums.Size.VERY_SMALL;
          break;
        default:
          await ctx.reply('Пожалуйста, выберите размер из предложенных вариантов.');
          return;
      }

      await ctx.reply(
        'Выберите длину шерсти собаки:',
        Markup.keyboard([
          [Markup.button.text('Длинная')],
          [Markup.button.text('Средняя')],
          [Markup.button.text('Короткая')],
          [Markup.button.text('Нет')],
        ])
          .resize()
          .oneTime(),
      );
      return;
    }

    // Шаг 5: Проверка длины шерсти
    if (!state.fur) {
      switch (text) {
        case 'Длинная':
          state.fur = $Enums.Fur.LONG;
          break;
        case 'Средняя':
          state.fur = $Enums.Fur.MEDIUM;
          break;
        case 'Короткая':
          state.fur = $Enums.Fur.SHORT;
          break;
        case 'Нет':
          state.fur = $Enums.Fur.NO;
          break;
        default:
          await ctx.reply('Пожалуйста, выберите длину шерсти из предложенных вариантов.');
          return;
      }

      await ctx.reply('Введите описание собаки:');
      return;
    }

    // Шаг 6: Проверка описания
    if (!state.description) {
      if (text.length < 5) {
        await ctx.reply('Описание должно содержать хотя бы 5 символов.');
        return;
      }
      state.description = text;
      await ctx.reply('Введите адрес, где находится животное:');
      return;
    }

    // Шаг 7: Проверка адреса
    if (!state.adress) {
      if (text.length < 10) {
        await ctx.reply('Адрес должен содержать хотя бы 10 символов.');
        return;
      }
      state.adress = text;
      await ctx.reply(
        'Отправьте изображение животного (можно отправить несколько, используйте /animal_done для завершения):',
      );
    }
  }

  // Обработка изображений
  @On('photo')
  async onPhoto(@Ctx() ctx: SessionSceneContext) {
    const state = ctx.scene.session.state as Partial<AnimalFormDto>;

    if (!state.image_url) {
      state.image_url = [];
    }

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const fileId = ctx.message.photo[ctx.message.photo.length - 1].file_id;
    const fileUrl = await ctx.telegram.getFileLink(fileId);

    state.image_url.push(fileUrl.toString());

    await ctx.reply(
      'Изображение загружено. Отправьте еще одно чтобы заменить или введите /animal_done для завершения.',
    );
  }
}
