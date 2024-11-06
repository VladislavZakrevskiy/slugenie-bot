import { RedisModule } from '@nestjs-modules/ioredis';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { TelegrafModule } from 'nestjs-telegraf';
import { session } from 'telegraf';
import { UserModule } from './users/users.module';
import { AnimalModule } from './animals/animals.module';
import { BotStartService } from './bot/bot.start';
import { LoginScene } from './bot/auth/Login.scene';
import { RegisterScene } from './bot/auth/Register.scene';
import { RedisService } from './core/redis/redis.service';
import { AuthGuard } from './users/decorators/Auth.guard';
import { RolesGuard } from './users/decorators/Roles.guard';
import { AnimalFormScene } from './bot/animal/bot.animal.create';
import { BotUserService } from './bot/user/bot.user.auth';
import { UserProfileService } from './bot/user/bot.user.profile';
import { HttpModule } from '@nestjs/axios';
import { AnimalList } from './bot/animal/animal.list';
import { DogRecommender } from './animals/recomendations/DogRecmender';
import { DogNormalizer } from './animals/recomendations/DogNormalizer';
import { DogSurvey } from './bot/user/bot.user.rec';

@Module({
  imports: [
    ConfigModule.forRoot(),
    TelegrafModule.forRoot({
      token: process.env.TELEGRAM_BOT_TOKEN,
      middlewares: [session()],
    }),
    ScheduleModule.forRoot(),
    RedisModule.forRoot({
      type: 'single',
      url: 'redis://localhost:6379',
    }),
    HttpModule,
    UserModule,
    AnimalModule,
  ],
  providers: [
    // Bot Services
    BotStartService,
    UserProfileService,
    AnimalList,
    BotUserService,
    DogRecommender,
    DogSurvey,
    // Scenes
    LoginScene,
    RegisterScene,
    AnimalFormScene,
    // Helpers
    RedisService,
    DogNormalizer,
    // Guards
    AuthGuard,
    RolesGuard,
  ],
})
export class AppModule {}
