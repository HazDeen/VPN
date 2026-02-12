import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async getBalance(userId: bigint) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new Error('User not found');
    }

    // Считаем активные устройства
    const activeDevices = await this.prisma.device.count({
      where: {
        userId,
        isActive: true,
      },
    });

    // 300₽/мес = 10₽/день
    const dailyRate = activeDevices * 10;
    const daysLeft = dailyRate > 0 ? Math.floor(user.balance / dailyRate) : 30;

    return {
      balance: user.balance,
      daysLeft: daysLeft > 30 ? 30 : daysLeft,
      activeDevices,
    };
  }

  async getProfile(userId: bigint) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        devices: {
          where: { isActive: true },
          take: 5,
          orderBy: { connectedAt: 'desc' },
        },
      },
    });

    if (!user) {
      throw new Error('User not found');
    }

    return {
      id: user.id,
      telegramId: user.telegramId,
      firstName: user.firstName,
      lastName: user.lastName,
      username: user.username,
      balance: user.balance,
      devices: user.devices.map(device => ({
        id: device.id,
        name: device.customName || device.name,
        model: device.name,
        type: device.type,
        date: device.connectedAt,
        isActive: device.isActive,
      })),
    };
  }

  async updateBalance(userId: bigint, amount: number) {
    const user = await this.prisma.user.update({
      where: { id: userId },
      data: {
        balance: {
          increment: amount,
        },
      },
    });

    return { balance: user.balance };
  }
}