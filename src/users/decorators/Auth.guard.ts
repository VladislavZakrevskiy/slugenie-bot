import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { RedisService } from 'src/core/redis/redis.service';
import { getRedisKeys } from 'src/core/redis/redisKeys';
import { SessionSceneContext } from 'src/types/Scenes';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private redis: RedisService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const ctx = context.switchToHttp().getRequest<SessionSceneContext>();
    const userId = await this.redis.get(getRedisKeys('user_id', ctx.chat.id));

    if (!userId) {
      await ctx.reply('Сначала вам нужно авторизоваться с помощью команды /login.');
      return false;
    }

    return true;
  }
}
