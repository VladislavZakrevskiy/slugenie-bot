import { Injectable } from '@nestjs/common';
import { Ctx, Scene, SceneEnter, Command, On } from 'nestjs-telegraf';
import { Scenes } from 'telegraf';
import { RedisService } from 'src/core/redis/redis.service';
import { getRedisKeys } from 'src/core/redis/redisKeys';
import { ScenesList, SessionSceneContext } from 'src/types/Scenes';
import { UserService } from 'src/users/users.service';

@Injectable()
@Scene(ScenesList.LOGIN)
export class LoginScene {
  constructor(
    private readonly userService: UserService,
    private redis: RedisService,
  ) {}

  @SceneEnter()
  async onSceneEnter(@Ctx() ctx: SessionSceneContext) {
    await ctx.reply(`Пожалуйста, введите вашу почту:
При небходимости отменить авторизацию напишите /cancel`);
    ctx.scene.session.state = {};
  }

  @Command('cancel')
  async onCancel(@Ctx() ctx: Scenes.SceneContext) {
    await ctx.reply('Авторизация отменена.');
    await ctx.scene.leave();
  }

  @On('text')
  async onText(@Ctx() ctx: SessionSceneContext) {
    const state = ctx.scene.session.state as any;

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!state.login) {
      const email = ctx.text;

      if (!emailRegex.test(email)) {
        await ctx.reply('Неверный формат почты. Пожалуйста, введите корректный адрес электронной почты:');
        return;
      }

      state.login = email;
      await ctx.reply('Теперь введите ваш пароль:');
    } else {
      const password = ctx.text;

      if (password.length < 8) {
        await ctx.reply('Пароль должен содержать минимум 8 символов. Попробуйте снова:');
        return;
      }

      const user = await this.userService.validateUser(state.login, password);
      if (user) {
        await this.redis.set(getRedisKeys('user', ctx.chat.id), user.candidate);
        await this.redis.set(getRedisKeys('user_id', ctx.chat.id), user.candidate.id);

        await ctx.reply('Вы успешно авторизовались!');
        await ctx.scene.leave();
      } else {
        await ctx.reply('Неверный логин или пароль, попробуйте снова.');
        state.login = null;
        await ctx.reply('Пожалуйста, введите вашу почту:');
      }
    }
  }
}
