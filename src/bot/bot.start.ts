import { Injectable, UseGuards } from '@nestjs/common';
import { Command, Ctx, Start, Update } from 'nestjs-telegraf';
import { ScenesList, SessionSceneContext } from 'src/types/Scenes';
import { UserProfileService } from './user/bot.user.profile';
import { AuthGuard } from 'src/users/decorators/Auth.guard';
import { AnimalList } from './animal/animal.list';
import { DogSurvey } from './user/bot.user.rec';

@Injectable()
@Update()
export class BotStartService {
  constructor(
    private userProfileService: UserProfileService,
    private dogSurvey: DogSurvey,
    private animalList: AnimalList,
  ) {}

  @Start()
  async handleStart(@Ctx() ctx: SessionSceneContext) {
    await ctx.reply(
      'Добро пожаловать! Используйте /login для входа, /register для регистрации или /logout для выхода.',
    );
  }

  @UseGuards(AuthGuard)
  @Command('animal')
  async createAnimal(@Ctx() ctx: SessionSceneContext) {
    await ctx.scene.enter(ScenesList.ANIMAL_FORM);
  }

  @UseGuards(AuthGuard)
  @Command('profile')
  async getProfile(@Ctx() ctx: SessionSceneContext) {
    await this.userProfileService.handleProfile(ctx);
  }

  @UseGuards(AuthGuard)
  @Command('set_recs')
  async setRecs(@Ctx() ctx: SessionSceneContext) {
    await this.dogSurvey.handleAnimalRecs(ctx);
  }

  @UseGuards(AuthGuard)
  @Command('animal_list')
  async asyncGetAnimals(@Ctx() ctx: SessionSceneContext) {
    await this.animalList.handleList(ctx);
  }
}
