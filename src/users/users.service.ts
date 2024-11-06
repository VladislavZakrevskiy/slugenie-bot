import { Injectable } from '@nestjs/common';
import { Permission, User } from '@prisma/client';
import { PrismaService } from 'src/core/prisma/prisma.service';
import { RegisterDto } from './dto/RegisterDto';
import { compareSync, hashSync } from 'bcrypt';

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

  async updateUser(id: string, data: Partial<User>): Promise<User> {
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
