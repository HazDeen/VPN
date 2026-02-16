import { Injectable, UnauthorizedException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) {}

  async validateAdmin(username: string) {
    const admin = await this.prisma.user.findFirst({
      where: { 
        username: {
          equals: username,
          mode: 'insensitive',
        },
        isAdmin: true,
      },
    });

    if (!admin) {
      throw new UnauthorizedException('Admin access required');
    }

    return admin;
  }

  async getAllUsers() {
    const users = await this.prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
    });

    return users.map(user => ({
      id: user.id,
      telegramId: Number(user.telegramId),
      firstName: user.firstName,
      lastName: user.lastName,
      username: user.username,
      balance: user.balance,
      isAdmin: user.isAdmin,
      createdAt: user.createdAt,
    }));
  }

  async getUserDevices(userId: number) {
    const devices = await this.prisma.device.findMany({
      where: { userId },
      orderBy: { connectedAt: 'desc' },
    });

    return devices.map(d => ({
      id: d.id,
      name: d.customName || d.name,
      model: d.name,
      type: d.type,
      date: d.connectedAt.toLocaleDateString('ru-RU'),
      isActive: d.isActive,
      daysLeft: d.expiresAt
        ? Math.max(0, Math.ceil((d.expiresAt.getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
        : 0,
      configLink: d.configLink,
    }));
  }

  async updateUserBalance(userId: number, balance: number) {
    const user = await this.prisma.user.update({
      where: { id: userId },
      data: { balance },
    });

    return { success: true, balance: user.balance };
  }

  async setAdminStatus(userId: number, isAdmin: boolean) {
    const user = await this.prisma.user.update({
      where: { id: userId },
      data: { isAdmin },
    });

    return { success: true, isAdmin: user.isAdmin };
  }
}