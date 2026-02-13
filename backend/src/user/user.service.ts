import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async getBalance(userId: number) { // 👈 Принимаем number
    const user = await this.prisma.user.findUnique({
      where: { id: userId }, // Prisma сам сконвертирует number в Int
    });

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

    return {
      id: user.id,
      telegramId: Number(user.telegramId), // 👈 BigInt → Number
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
}