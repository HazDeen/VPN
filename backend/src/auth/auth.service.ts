import { Injectable, UnauthorizedException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as crypto from 'crypto';

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService) {}

  async findByUsername(username: string) {
    console.log(`🔍 Searching for user with username: @${username}`);
    
    const user = await this.prisma.user.findFirst({
      where: { 
        username: {
          equals: username,
          mode: 'insensitive', // игнорируем регистр
        },
      },
    });

    if (!user) {
      console.log('❌ User not found');
      throw new UnauthorizedException('Пользователь не найден. Напишите /start боту');
    }

    console.log(`✅ User found: ${user.id}`);
    return user;
  }

  async findOrCreateUser(telegramData: any) {
    const telegramId = BigInt(telegramData.id);
    
    let user = await this.prisma.user.findUnique({
      where: { telegramId },
    });

    if (!user) {
      const { token, expiresAt } = this.generateAuthToken();
      
      user = await this.prisma.user.create({
        data: {
          telegramId,
          firstName: telegramData.first_name || '',
          lastName: telegramData.last_name || '',
          username: telegramData.username || '',
          authToken: token,
          tokenExpires: expiresAt,
          balance: 0,
        },
      });
    }

    return user;
  }

  private generateAuthToken(): { token: string; expiresAt: Date } {
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24);
    return { token, expiresAt };
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