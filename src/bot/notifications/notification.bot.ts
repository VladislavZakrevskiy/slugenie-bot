import { Cron } from '@nestjs/schedule';
import { Telegraf } from 'telegraf';
import { RedisService } from 'src/core/redis/redis.service';
import { InjectBot, Update } from 'nestjs-telegraf';
import { AnimalService } from '../../animals/animals.service';
import { UserService } from '../../users/users.service';
import { getDefaultText } from 'src/core/helpers/getDefaultText';

@Update()
export class BotEmployeeService {
  constructor(
    @InjectBot() private bot: Telegraf,
    private animalService: AnimalService,
    private userService: UserService,
    private redis: RedisService,
  ) {}

  @Cron('0 12 */1 * *')
  async broadcastUsers() {
    const users = await this.userService.getAllUsers();
    for (const user of users) {
      const bestAnimal = await this.animalService.getRecomendAnimal(user);
      await this.bot.telegram.sendPhoto(
        user.tg_user_id,
        { url: bestAnimal.image_url[0] },
        { caption: getDefaultText(bestAnimal), parse_mode: 'HTML', disable_notification: true },
      );
    }
  }
}
