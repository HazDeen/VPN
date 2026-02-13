import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async getBalance(userId: number) {
  const user = await this.prisma.user.findUnique({
    where: { id: userId },
  });

  // 👇 КОНВЕРТИРУЕМ ВСЕ BIGINT!
  return {
    balance: user.balance,
    daysLeft: 30,
    activeDevices: 0,
    userId: Number(user.id),
    telegramId: Number(user.telegramId), // BigInt → number!
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

async topUpBalance(userId: number, amount: number) {

  
  const user = await this.prisma.user.update({
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

  
  // 👇 КОНВЕРТИРУЕМ!
  return {
    success: true,
    balance: user.balance,
    userId: Number(user.id),
  };
}
}