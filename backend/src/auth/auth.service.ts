import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService) {}

  async findOrCreateUser(telegramUser: any) {
    let user = await this.prisma.user.findUnique({
      where: { telegramId: BigInt(telegramUser.id) },
    });

    if (!user) {
      user = await this.prisma.user.create({
        data: {
          telegramId: BigInt(telegramUser.id),
          firstName: telegramUser.firstName || '',
          lastName: telegramUser.lastName || '',
          username: telegramUser.username || '',
          balance: 0,
        },
      });
    }

    return user;
  }

  async getMe(userId: bigint) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {  // 👈 ДОБАВЛЯЕМ ПРОВЕРКУ!
      throw new NotFoundException('User not found');
    }

    return {
      id: user.id,
      telegramId: user.telegramId,
      firstName: user.firstName,
      lastName: user.lastName,
      username: user.username,
      balance: user.balance,
    };
  }
}