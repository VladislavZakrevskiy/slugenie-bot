import { Injectable } from '@nestjs/common';
import { Command, Ctx, Update } from 'nestjs-telegraf';
import { RedisService } from 'src/core/redis/redis.service';
import { getRedisKeys } from 'src/core/redis/redisKeys';
import { ScenesList, SessionSceneContext } from 'src/types/Scenes';

@Injectable()
@Update()
export class BotUserService {
  constructor(private redis: RedisService) {}

  @Command('login')
  async handleLogin(@Ctx() ctx: SessionSceneContext) {
    ctx.scene.enter(ScenesList.LOGIN);
  }

  @Command('register')
  async handleRegister(@Ctx() ctx: SessionSceneContext) {
    ctx.scene.enter(ScenesList.REGISTER);
  }

  @Command('logout')
  async handleLogout(@Ctx() ctx: SessionSceneContext) {
    await this.redis.delete(getRedisKeys('user', ctx.from.id));
    await ctx.reply('Вы успешно вышли из системы.');
  }
}
