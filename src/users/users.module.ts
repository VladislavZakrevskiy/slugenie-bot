import { Module } from '@nestjs/common';
import { UserService } from './users.service';
import { PrismaService } from 'src/core/prisma/prisma.service';

@Module({
  providers: [UserService, PrismaService],
  exports: [UserService],
})
export class UserModule {}
