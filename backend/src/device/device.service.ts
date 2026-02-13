import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { randomBytes } from 'crypto';

@Injectable()
export class DeviceService {
  constructor(private prisma: PrismaService) {}

  private generateConfigLink(): string {
    return `vless://${randomBytes(16).toString('base64url')}`;
  }

  async getUserDevices(userId: number) { // 👈 number
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
      configLink: d.configLink,
    }));
  }

  async addDevice(userId: number, dto: any) { // 👈 number
    const count = await this.prisma.device.count({ where: { userId } });
    if (count >= 5) throw new BadRequestException('Максимум 5 устройств');

    const device = await this.prisma.device.create({
      data: {
        userId,
        name: dto.name,
        customName: dto.customName || dto.name,
        type: dto.type,
        configLink: this.generateConfigLink(),
        isActive: false,
      },
    });

    return {
      id: device.id,
      name: device.customName,
      configLink: device.configLink,
    };
  }

  async deleteDevice(deviceId: number, userId: number) { // 👈 number
    await this.prisma.device.deleteMany({
      where: { id: deviceId, userId },
    });
    return { success: true };
  }
}