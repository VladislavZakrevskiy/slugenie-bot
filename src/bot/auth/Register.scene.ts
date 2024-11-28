import { Injectable } from '@nestjs/common';
import { Ctx, Scene, SceneEnter, Command, On } from 'nestjs-telegraf';
import { Scenes } from 'telegraf';
import { UserService } from 'src/users/users.service';
import { ScenesList, SessionSceneContext } from 'src/types/Scenes';
import { Markup } from 'telegraf'; // Импортируем Markup для создания кнопок
import { Role } from '@prisma/client';
import { RedisService } from 'src/core/redis/redis.service';
import { getRedisKeys } from 'src/core/redis/redisKeys';
import { RegisterDto } from 'src/users/dto/RegisterDto';

@Injectable()
@Scene(ScenesList.REGISTER)
export class RegisterScene {
  constructor(
    private readonly userService: UserService,
    private redis: RedisService,
  ) {}

  @SceneEnter()
  async onSceneEnter(@Ctx() ctx: SessionSceneContext) {
    await ctx.reply(`Пожалуйста, введите вашу почту:
При необходимости отмените регистрацию, написав /cancel`);
    ctx.scene.session.state = {}; // Инициализация состояния
  }

  @Command('cancel')
  async onCancel(@Ctx() ctx: Scenes.SceneContext) {
    await ctx.reply('Регистрация отменена.');
    await ctx.scene.leave();
  }

  @On('text')
  async onText(@Ctx() ctx: SessionSceneContext) {
    const state = ctx.scene.session.state as any;

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!state.email) {
      const email = ctx.text;

      if (!emailRegex.test(email)) {
        await ctx.reply('Неверный формат почты. Пожалуйста, введите корректный адрес электронной почты:');
        return;
      }

      state.email = email;
      await ctx.reply('Теперь введите ваше имя:');
    } else if (!state.name) {
      state.name = ctx.text;
      await ctx.reply('Теперь введите вашу фамилию:');
    } else if (!state.surname) {
      state.surname = ctx.text;
      await ctx.reply('Теперь введите ваш номер телефона: ');
    } else if (!state.phone_number) {
      state.phone_number = ctx.text;
      await ctx.reply('Теперь введите ваш адрес:');
    } else if (!state.adress) {
      state.adress = ctx.text;
      await ctx.reply(
        'Теперь выберите вашу роль:',
        Markup.keyboard([[Markup.button.text('Организация')], [Markup.button.text('ФизЛицо')]])
          .resize()
          .oneTime(),
      );
    } else if (!state.role) {
      const roleText = ctx.text;

      if (roleText === 'Организация') {
        state.role = Role.ORGANIZATION;
      } else if (roleText === 'ФизЛицо') {
        state.role = Role.INDIVIDUAL;
      } else {
        await ctx.reply('Пожалуйста, выберите роль: "Организация" или "ФизЛицо".');
        return;
      }

      await ctx.reply('Теперь введите ваш пароль:');
    } else {
      const password = ctx.text;

      if (password.length < 8) {
        await ctx.reply('Пароль должен содержать минимум 8 символов. Попробуйте снова:');
        return;
      }

      const newUser: RegisterDto = {
        email: state.email,
        name: state.name,
        surname: state.surname,
        password: password,
        role: state.role,
        tg_user_id: String(ctx.from.id),
        adress: state.adress,
        phone_number: state.phone_number,
        username: ctx.from.username,
      };

      const registeredUser = await this.userService.registerUser(newUser);
      if (registeredUser) {
        await this.redis.set(getRedisKeys('user', ctx.chat.id), registeredUser.user);
        await this.redis.set(getRedisKeys('user', ctx.chat.id), registeredUser.user.id);

        await ctx.reply('Вы успешно зарегистрированы!');
        await ctx.scene.leave();
      } else {
        await ctx.reply('Ошибка регистрации. Пожалуйста, попробуйте снова.');
        state.email = null; // Сброс состояния для повторного ввода
        await ctx.reply('Пожалуйста, введите вашу почту:');
      }
    }
  }
}
