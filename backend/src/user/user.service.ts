import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async getBalance(userId: number) {
  const user = await this.prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    // 👋 ЕСЛИ НЕТ ПОЛЬЗОВАТЕЛЯ - СОЗДАЁМ!
    const newUser = await this.prisma.user.create({
      data: {
        id: userId,
        telegramId: BigInt(userId),
        firstName: 'User',
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

async getProfile(userId: number) {
  const user = await this.prisma.user.findUnique({
    where: { id: userId },
    include: {
      devices: {
        where: { isActive: true },
        orderBy: { connectedAt: 'desc' },
      },
    },
  });

  // 👇 КОНВЕРТИРУЕМ ВСЁ!
  return {
    id: user.id,
    telegramId: Number(user.telegramId), // BigInt → number!
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
    })),
  };
}

async topUpBalance(userId: number, amount: number) { // 👈 userId ДОЛЖЕН БЫТЬ NUMBER!
  
  // Ищем пользователя по number id
  const user = await this.prisma.user.findUnique({
    where: { id: userId }, // id в БД - Int, передаём number
  });

  if (!user) {
    throw new Error('User not found');
  }

  // Обновляем
  const updatedUser = await this.prisma.user.update({
    where: { id: userId },
    data: {
      balance: {
        increment: amount,
      },
    },
  });

  return {
    success: true,
    balance: updatedUser.balance,
  };
}
}