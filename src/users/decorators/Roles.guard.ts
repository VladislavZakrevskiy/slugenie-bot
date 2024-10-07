import { SetMetadata } from '@nestjs/common';
import { Permission, User } from '@prisma/client';
import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RedisService } from 'src/core/redis/redis.service';
import { SessionSceneContext } from 'src/types/Scenes';
import { getRedisKeys } from 'src/core/redis/redisKeys';

export const ROLES_KEY = 'roles';
export const Roles = (...roles: Permission[]) => SetMetadata(ROLES_KEY, roles);

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private redis: RedisService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const roles = this.reflector.get<Permission[]>(ROLES_KEY, context.getHandler());
    if (!roles) {
      return true;
    }

    const ctx = context.switchToHttp().getRequest<SessionSceneContext>();
    const user = await this.redis.get<User>(getRedisKeys('user', ctx.chat.id));

    if (!user) {
      await ctx.reply('Сначала вам нужно авторизоваться с помощью команды /login.');
      return false;
    }

    const isRoleCorrect = roles.includes(user.permission);

    if (!isRoleCorrect) {
      await ctx.reply('У вас нет доступа!');
      return false;
    }
    return true;
  }
}
