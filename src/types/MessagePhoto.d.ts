import { PhotoSize } from 'telegraf/typings/core/types/typegram';

declare module 'telegraf/typings/core/types/typegram' {
  export interface Message {
    photo?: PhotoSize[];
  }
}
