import { Injectable, UnauthorizedException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as crypto from 'crypto';

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService) {}

  async findByToken(token: string) {
    console.log(`🔍 Searching for token: ${token}`);
    
    const user = await this.prisma.user.findUnique({
      where: { authToken: token },
    });

    if (!user) {
      console.log('❌ User not found for token');
      throw new UnauthorizedException('Invalid token');
    }

    // Проверяем, не истёк ли токен
    if (user.tokenExpires && user.tokenExpires < new Date()) {
      console.log('❌ Token expired');
      throw new UnauthorizedException('Token expired');
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
    } else {
      // Если токен истёк или его нет - обновляем
      if (!user.authToken || !user.tokenExpires || user.tokenExpires < new Date()) {
        const { token, expiresAt } = this.generateAuthToken();
        user = await this.prisma.user.update({
          where: { id: user.id },
          data: {
            authToken: token,
            tokenExpires: expiresAt,
          },
        });
      }
    }

    return user;
  }

  private generateAuthToken(): { token: string; expiresAt: Date } {
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24);
    return { token, expiresAt };
  }

  async refreshToken(userId: number) {
    const { token, expiresAt } = this.generateAuthToken();
    
    const user = await this.prisma.user.update({
      where: { id: userId },
      data: {
        authToken: token,
        tokenExpires: expiresAt,
      },
    });

    return {
      token: user.authToken,
      expiresAt: user.tokenExpires,
    };
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