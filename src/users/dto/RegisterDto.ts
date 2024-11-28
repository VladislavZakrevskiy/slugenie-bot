import { Role } from '@prisma/client';

export interface RegisterDto {
  email: string;
  tg_user_id: string;
  name: string;
  password: string;
  surname: string;
  adress: string;
  phone_number: string;
  role: Role;
  username: string;
}
