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

  // ❌ УБИРАЕМ АВТОСОЗДАНИЕ!
  if (!user) {
    this.logger.error(`❌ User ${userId} not found!`);
    throw new NotFoundException(`User with id ${userId} not found`);
  }

  const activeDevices = await this.prisma.device.count({
    where: { userId, isActive: true },
  });

  const dailyRate = activeDevices * 10;
  const daysLeft = dailyRate > 0 ? Math.floor(user.balance / dailyRate) : 30;

  return {
    balance: user.balance,
    daysLeft: daysLeft > 30 ? 30 : daysLeft,
    activeDevices,
  };
}

async topUpBalance(userId: number, amount: number) {
  this.logger.log(`💰 Top up user ${userId} with ${amount}`);
  
  // Проверяем, что пользователь существует
  const user = await this.prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    this.logger.error(`❌ User ${userId} not found!`);
    throw new NotFoundException(`User with id ${userId} not found`);
  }

  // Обновляем баланс
  const updatedUser = await this.prisma.user.update({
    where: { id: userId },
    data: {
      balance: {
        increment: amount,
      },
    },
  });

  this.logger.log(`✅ New balance: ${updatedUser.balance}`);

  // Создаём транзакцию
  await this.prisma.transaction.create({
    data: {
      userId,
      amount,
      type: 'topup',
      description: 'Пополнение баланса',
    },
  });

  return {
    success: true,
    balance: updatedUser.balance,
  };
}

async getProfile(userId: number) {
  this.logger.log(`👤 Getting profile for user ${userId}`);
  
  const user = await this.prisma.user.findUnique({
    where: { id: userId },
    include: {
      devices: {
        orderBy: { connectedAt: 'desc' },
      },
    },
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
    devices: user.devices.map(d => ({
      id: d.id,
      name: d.customName || d.name,
      model: d.name,
      type: d.type,
      date: d.connectedAt,
      isActive: d.isActive,
      configLink: d.configLink,
      daysLeft: d.expiresAt ? Math.max(0, Math.ceil((d.expiresAt.getTime() - Date.now()) / (1000 * 60 * 60 * 24))) : 0,
    })),
  };
}

}