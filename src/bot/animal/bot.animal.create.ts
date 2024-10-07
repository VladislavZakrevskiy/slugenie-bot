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

  @Command('cancel')
  async onCancel(@Ctx() ctx: SessionSceneContext) {
    await ctx.reply('Регистрация животного отменена.');
    await ctx.scene.leave();
  }

  @On('text')
  async onText(@Ctx() ctx: SessionSceneContext) {
    const state = ctx.scene.session.state as Partial<AnimalFormDto>;

    // Шаг 1: Порода
    if (!state.breed) {
      state.breed = ctx.text;
      await ctx.reply('Введите имя животного (или оставьте пустым):');
      return;
    }

    // Шаг 2: Имя
    if (!state.name && state.name !== '') {
      state.name = ctx.text || null;
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
      await ctx.reply('Введите возраст животного:');
      return;
    }

    // Шаг 3: Возраст
    if (!state.age) {
      const ageText = ctx.text;
      switch (ageText) {
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
          await ctx.reply(
            'Выберите возраст собаки кнопкой:',
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

    // Шаг 4: Размер
    if (!state.size) {
      const sizeText = ctx.text;
      switch (sizeText) {
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
          await ctx.reply(
            'Выберите размер собаки кнопкой:',
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

    // Шаг 5: Шерсть
    if (!state.fur) {
      const furText = ctx.text;
      switch (furText) {
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
          await ctx.reply(
            'Выберите длину шерсти собаки кнопкой:',
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

      await ctx.reply('Введите описание собаки:');
      return;
    }

    // Шаг 6: Описание
    if (!state.description) {
      state.description = ctx.text;
      await ctx.reply('Введите адрес, где находится животное:');
      return;
    }

    // Шаг 7: Адрес
    if (!state.adress) {
      state.adress = ctx.text;
      await ctx.reply('Отправьте изображение животного (можно отправить несколько, используйте /done для завершения):');
      return;
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

    await ctx.reply('Изображение загружено. Отправьте еще одно или введите /done для завершения.');
  }

  @Command('done')
  async onDone(@Ctx() ctx: SessionSceneContext) {
    const state = ctx.scene.session.state as AnimalFormDto;
    console.log(state);

    if (state.image_url.length === 0) {
      await ctx.reply('Вы не загрузили ни одного изображения. Пожалуйста, загрузите хотя бы одно.');
      return;
    }

    const animal = await this.animalService.createAnimal(state);
    const images: { type: 'photo'; media: string; parse_mode?: 'HTML'; caption?: string }[] = state.image_url.map(
      (url, i) => ({
        type: 'photo',
        media: url,
        caption: i === 0 ? getDefaultText(animal) : undefined,
        parse_mode: i === 0 ? 'HTML' : undefined,
      }),
    );

    await ctx.telegram.sendMediaGroup(ctx.chat.id, images);

    await ctx.reply('Данные о животном успешно сохранены!');
    await ctx.scene.leave();
  }
}
