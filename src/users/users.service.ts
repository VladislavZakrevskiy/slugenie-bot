import { Injectable } from '@nestjs/common';
import { Permission, Prisma, User, $Enums } from '@prisma/client';
import { PrismaService } from 'src/core/prisma/prisma.service';
import { RegisterDto } from './dto/RegisterDto';
import { compareSync, hashSync } from 'bcrypt';
import { InputJsonValue } from '@prisma/client/runtime/library';

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  async createUser(data: Omit<User, 'id'>): Promise<User> {
    return this.prisma.user.create({
      data,
    });
  }

  async registerUser(registerData: RegisterDto) {
    const hashPassword = hashSync(registerData.password, 7);

    const user = await this.prisma.user.create({
      data: {
        ...registerData,
        permission: Permission.USER,
        password: hashPassword,
      },
    });

    return { user };
  }

  async validateUser(email: string, password: string) {
    const candidate = await this.prisma.user.findUnique({
      where: { email },
    });

    if (candidate && compareSync(password, candidate.password)) {
      return { candidate };
    } else return null;
  }

  async getUserById(id: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { id },
    });
  }

  async getAllUsers(): Promise<User[]> {
    return this.prisma.user.findMany();
  }

  async updateUser(
    id: string,
    data: {
      id?: Prisma.StringFieldUpdateOperationsInput | string;
      tg_user_id?: Prisma.StringFieldUpdateOperationsInput | string;
      name?: Prisma.StringFieldUpdateOperationsInput | string;
      surname?: Prisma.StringFieldUpdateOperationsInput | string;
      email?: Prisma.StringFieldUpdateOperationsInput | string;
      password?: Prisma.StringFieldUpdateOperationsInput | string;
      adress?: Prisma.StringFieldUpdateOperationsInput | string;
      phone_number?: Prisma.StringFieldUpdateOperationsInput | string;
      role?: Prisma.EnumRoleFieldUpdateOperationsInput | $Enums.Role;
      permission?: Prisma.EnumPermissionFieldUpdateOperationsInput | $Enums.Permission;
      is_notifications?: Prisma.BoolFieldUpdateOperationsInput | boolean;
      preferences?: Prisma.NullableJsonNullValueInput | InputJsonValue;
      animals?: Prisma.AnimalUpdateManyWithoutOwnerNestedInput;
      publicated_animals?: Prisma.AnimalUpdateManyWithoutPublicaterNestedInput;
    },
  ): Promise<User> {
    return this.prisma.user.update({
      where: { id },
      data,
    });
  }

  async deleteUser(id: string): Promise<User> {
    return this.prisma.user.delete({
      where: { id },
    });
  }
}
