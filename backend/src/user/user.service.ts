import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);

  constructor(private prisma: PrismaService) {}

  async getBalance(userId: number) { // 👈 number!
    const user = await this.prisma.user.findUnique({
      where: { id: userId }, // number!
    });

    if (!user) {
      // Автосоздание
      const newUser = await this.prisma.user.create({
        data: {
          id: userId,
          telegramId: BigInt(1314191617),
          firstName: 'hazdeen',
          username: 'hazdeen',
          balance: 1000,
        },
      });
      return {
        balance: newUser.balance,
        daysLeft: 30,
        activeDevices: 0,
      };
    }

    return {
      balance: user.balance,
      daysLeft: 30,
      activeDevices: 0,
    };
  }

  async topUpBalance(userId: number, amount: number) { // 👈 number!
    this.logger.log(`💰 Top up user ${userId} with ${amount}`);
    
    const user = await this.prisma.user.findUnique({
      where: { id: userId }, // number!
    });

    if (!user) {
      this.logger.error(`❌ User ${userId} not found!`);
      throw new Error('User not found');
    }

    const updatedUser = await this.prisma.user.update({
      where: { id: userId }, // number!
      data: {
        balance: {
          increment: amount,
        },
      },
    });

    await this.prisma.transaction.create({
      data: {
        userId, // number!
        amount,
        type: 'topup',
        description: 'Пополнение баланса',
      },
    });

    this.logger.log(`✅ New balance: ${updatedUser.balance}`);
    
    return {
      success: true,
      balance: updatedUser.balance,
    };
  }
}