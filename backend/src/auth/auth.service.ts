import { Injectable, UnauthorizedException, NotFoundException } from '@nestjs/common'; // 👈 ДОБАВИЛИ UnauthorizedException
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService) {}

  async findOrCreateUser(telegramData: any) {
    const telegramId = BigInt(telegramData.id);
    
    let user = await this.prisma.user.findUnique({
      where: { telegramId },
    });

    if (!user) {
      // Генерируем токен
      const authToken = require('crypto').randomBytes(32).toString('hex');
      
      user = await this.prisma.user.create({
        data: {
          telegramId,
          firstName: telegramData.first_name || '',
          lastName: telegramData.last_name || '',
          username: telegramData.username || '',
          authToken, // 👈 ОБЯЗАТЕЛЬНО ДОБАВЛЯЕМ!
          balance: 0,
        },
      });
    }

    return user;
  }

  async findByToken(token: string) {
    const user = await this.prisma.user.findUnique({
      where: { authToken: token },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid token');
    }

    return user;
  }

  async getMe(userId: number) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return {
      id: user.id,
      telegramId: Number(user.telegramId),
      firstName: user.firstName,
      lastName: user.lastName,
      username: user.username,
      balance: user.balance,
    };
  }
}