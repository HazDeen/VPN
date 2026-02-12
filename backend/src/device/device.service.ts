import { Injectable, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateDeviceDto } from './dto/create-device.dto';
import { randomBytes } from 'crypto';

@Injectable()
export class DeviceService {
  constructor(private prisma: PrismaService) {}

  private generateConfigLink(): string {
    const id = randomBytes(16).toString('base64url');
    return `https://hvpn.io/${id}`;
  }

  async getUserDevices(userId: bigint) {
    try {
      const devices = await this.prisma.device.findMany({
        where: { userId },
        include: {
          subscription: true,
        },
        orderBy: { connectedAt: 'desc' },
      });

      return devices.map(device => ({
        id: Number(device.id), // 👈 КОНВЕРТИРУЕМ BigInt в Number
        name: device.customName || device.name,
        model: device.name,
        type: device.type,
        date: device.connectedAt.toLocaleDateString('ru-RU', {
          day: '2-digit',
          month: '2-digit',
          year: '2-digit',
        }),
        isActive: device.isActive,
        configLink: device.configLink,
        daysLeft: device.subscription
          ? Math.floor((device.subscription.nextBillingDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
          : 0,
      }));
    } catch (error) {
      console.error('Get devices error:', error);
      throw new InternalServerErrorException('Failed to get devices');
    }
  }

  async addDevice(userId: bigint, dto: CreateDeviceDto) {
    try {
      // Проверяем лимит устройств
      const devicesCount = await this.prisma.device.count({
        where: { userId },
      });

      if (devicesCount >= 5) {
        throw new BadRequestException('Maximum 5 devices allowed');
      }

      // Создаем устройство
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
        id: Number(device.id), // 👈 КОНВЕРТИРУЕМ
        name: device.customName,
        model: device.name,
        type: device.type,
        configLink: device.configLink,
        isActive: device.isActive,
      };
    } catch (error) {
      console.error('Add device error:', error);
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to add device');
    }
  }

  async replaceDevice(deviceId: bigint, userId: bigint) {
    try {
      const device = await this.prisma.device.findFirst({
        where: {
          id: deviceId,
          userId,
        },
      });

      if (!device) {
        throw new BadRequestException('Device not found');
      }

      const updated = await this.prisma.device.update({
        where: { id: deviceId },
        data: {
          configLink: this.generateConfigLink(),
          updatedAt: new Date(),
        },
      });

      return {
        configLink: updated.configLink,
      };
    } catch (error) {
      console.error('Replace device error:', error);
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to replace device');
    }
  }

  async deleteDevice(deviceId: bigint, userId: bigint) {
    try {
      const device = await this.prisma.device.findFirst({
        where: {
          id: deviceId,
          userId,
        },
      });

      if (!device) {
        throw new BadRequestException('Device not found');
      }

      await this.prisma.device.delete({
        where: { id: deviceId },
      });

      return { success: true };
    } catch (error) {
      console.error('Delete device error:', error);
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to delete device');
    }
  }

  async updateDeviceName(deviceId: bigint, userId: bigint, customName: string) {
    try {
      const device = await this.prisma.device.findFirst({
        where: {
          id: deviceId,
          userId,
        },
      });

      if (!device) {
        throw new BadRequestException('Device not found');
      }

      const updated = await this.prisma.device.update({
        where: { id: deviceId },
        data: {
          customName,
          updatedAt: new Date(),
        },
      });

      return {
        customName: updated.customName,
      };
    } catch (error) {
      console.error('Update device name error:', error);
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to update device name');
    }
  }
}