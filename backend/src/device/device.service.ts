import { Injectable, BadRequestException, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateDeviceDto } from './dto/create-device.dto';
import { randomBytes } from 'crypto';

@Injectable()
export class DeviceService {
  private readonly logger = new Logger(DeviceService.name);

  constructor(private prisma: PrismaService) {}

  private generateConfigLink(): string {
    const id = randomBytes(16).toString('base64url');
    return `https://hvpn.io/${id}`;
  }

  async getUserDevices(userId: bigint) {
    try {
      this.logger.log(`📊 Getting devices for user ${userId}`);
      
      const devices = await this.prisma.device.findMany({
        where: { userId },
        include: {
          subscription: true,
        },
        orderBy: { connectedAt: 'desc' },
      });

      this.logger.log(`✅ Found ${devices.length} devices for user ${userId}`);

      return devices.map(device => ({
        id: Number(device.id),
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
      this.logger.error(`❌ Error in getUserDevices: ${error.message}`);
      throw error;
    }
  }

  async addDevice(userId: bigint, dto: CreateDeviceDto) {
    try {
      this.logger.log(`➕ Adding device for user ${userId}: ${JSON.stringify(dto)}`);
      
      // Проверяем лимит устройств
      const devicesCount = await this.prisma.device.count({
        where: { userId },
      });

      this.logger.log(`📊 User ${userId} has ${devicesCount} devices`);

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

      this.logger.log(`✅ Device created: ${device.id} for user ${userId}`);

      return {
        id: Number(device.id),
        name: device.customName,
        model: device.name,
        type: device.type,
        configLink: device.configLink,
        isActive: device.isActive,
      };
    } catch (error) {
      this.logger.error(`❌ Error in addDevice: ${error.message}`);
      throw error;
    }
  }

  async replaceDevice(deviceId: bigint, userId: bigint) {
    try {
      this.logger.log(`🔄 Replacing device ${deviceId} for user ${userId}`);
      
      const device = await this.prisma.device.findFirst({
        where: {
          id: deviceId,
          userId,
        },
      });

      if (!device) {
        throw new NotFoundException('Device not found');
      }

      const updated = await this.prisma.device.update({
        where: { id: deviceId },
        data: {
          configLink: this.generateConfigLink(),
          updatedAt: new Date(),
        },
      });

      this.logger.log(`✅ Device ${deviceId} replaced`);

      return {
        configLink: updated.configLink,
      };
    } catch (error) {
      this.logger.error(`❌ Error in replaceDevice: ${error.message}`);
      throw error;
    }
  }

  async deleteDevice(deviceId: bigint, userId: bigint) {
    try {
      this.logger.log(`🗑️ Deleting device ${deviceId} for user ${userId}`);
      
      const device = await this.prisma.device.findFirst({
        where: {
          id: deviceId,
          userId,
        },
      });

      if (!device) {
        throw new NotFoundException('Device not found');
      }

      await this.prisma.device.delete({
        where: { id: deviceId },
      });

      this.logger.log(`✅ Device ${deviceId} deleted`);

      return { success: true };
    } catch (error) {
      this.logger.error(`❌ Error in deleteDevice: ${error.message}`);
      throw error;
    }
  }

  async updateDeviceName(deviceId: bigint, userId: bigint, customName: string) {
    try {
      this.logger.log(`✏️ Updating device ${deviceId} name to: ${customName}`);
      
      const device = await this.prisma.device.findFirst({
        where: {
          id: deviceId,
          userId,
        },
      });

      if (!device) {
        throw new NotFoundException('Device not found');
      }

      const updated = await this.prisma.device.update({
        where: { id: deviceId },
        data: {
          customName,
          updatedAt: new Date(),
        },
      });

      this.logger.log(`✅ Device ${deviceId} name updated`);

      return {
        customName: updated.customName,
      };
    } catch (error) {
      this.logger.error(`❌ Error in updateDeviceName: ${error.message}`);
      throw error;
    }
  }
}