import { Injectable, UnauthorizedException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as crypto from 'crypto';

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService) {}

  async findByTelegramId(telegramId: number) {
    console.log(`🔍 Searching for user with telegramId: ${telegramId}`);
    
    const user = await this.prisma.user.findUnique({
      where: { telegramId: BigInt(telegramId) },
    });

    if (!user) {
      console.log('❌ User not found');
      throw new UnauthorizedException('User not found. Please send /start to bot first.');
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