import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService) {}

  async findOrCreateUser(telegramUser: any) {
    console.log('📥 Telegram user data:', telegramUser);
    
    let user = await this.prisma.user.findUnique({
      where: { telegramId: BigInt(telegramUser.id) },
    });

    if (!user) {
      console.log('🆕 Creating new user...');
      
      user = await this.prisma.user.create({
        data: {
          telegramId: BigInt(telegramUser.id),
          firstName: telegramUser.firstName || '',
          lastName: telegramUser.lastName || '',
          username: telegramUser.username || '',
          balance: 0,
        },
      });
      
      console.log('✅ User created:', user.id);
    } else {
      console.log('✅ User found:', user.id);
    }

    return user;
  }

  async getMe(userId: bigint) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
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