import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);

  constructor(private prisma: PrismaService) {}

  async getBalance(userId: number) {
    this.logger.log(`💰 Getting balance for user ${userId}`);
    
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      this.logger.log(`👤 User ${userId} not found, creating...`);
      const newUser = await this.prisma.user.create({
        data: {
          id: userId,
          telegramId: BigInt(1314191617),
          firstName: 'hazdeen',
          username: 'hazdeen',
          balance: 1500,
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

  async topUpBalance(userId: number, amount: number) {
    this.logger.log(`💰 Top up user ${userId} with ${amount}`);
    
    // ПРЯМОЙ ЗАПРОС К БАЗЕ
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      this.logger.error(`❌ User ${userId} NOT FOUND in database!`);
      throw new NotFoundException(`User with id ${userId} not found`);
    }

    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: {
        balance: {
          increment: amount,
        },
      },
    });

    await this.prisma.transaction.create({
      data: {
        userId,
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