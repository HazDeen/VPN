import { Injectable, BadRequestException, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { randomBytes } from 'crypto';

@Injectable()
export class DeviceService {
  private readonly logger = new Logger(DeviceService.name);
  private readonly DEVICE_PRICE = 300;

  constructor(private prisma: PrismaService) {}

  private generateConfigLink(): string {
    return `https://hvpn.io/${randomBytes(16).toString('base64url')}`;
  }

  private async findUserByUsername(username: string) {
    const user = await this.prisma.user.findFirst({
      where: { 
        username: {
          equals: username,
          mode: 'insensitive',
        },
      },
    });

    if (!user) {
      throw new NotFoundException(`User @${username} not found`);
    }

    return user;
  }

  async getUserDevices(userId: number) {
    this.logger.log(`📱 Getting devices for user ${userId}`);
    
    const devices = await this.prisma.device.findMany({
      where: { userId },
      orderBy: { connectedAt: 'desc' },
    });

    return devices.map(d => {
      let daysLeft = 0;
      let isActive = d.isActive;
      
      if (d.expiresAt) {
        const now = new Date();
        const diffTime = d.expiresAt.getTime() - now.getTime();
        daysLeft = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
        
        if (daysLeft === 0 && isActive) {
          this.deactivateDevice(d.id, userId).catch(e => 
            this.logger.error(`Failed to deactivate expired device: ${e.message}`)
          );
          isActive = false;
        }
      }

      return {
        id: d.id,
        name: d.customName || d.name,
        model: d.name,
        type: d.type,
        date: d.connectedAt.toLocaleDateString('ru-RU'),
        isActive,
        daysLeft,
        expiresAt: d.expiresAt?.toLocaleDateString('ru-RU'),
        configLink: d.configLink,
      };
    });
  }

  async getUserDevicesByUsername(username: string) {
    const user = await this.findUserByUsername(username);
    return this.getUserDevices(user.id);
  }

  async addDevice(userId: number, dto: any) {
    this.logger.log(`➕ Adding device for user ${userId}: ${JSON.stringify(dto)}`);
    
    const count = await this.prisma.device.count({ 
      where: { userId } 
    });
    
    if (count >= 5) {
      throw new BadRequestException('Максимум 5 устройств');
    }

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('Пользователь не найден');
    }

    if (user.balance < this.DEVICE_PRICE) {
      throw new BadRequestException(
        `Недостаточно средств. Нужно ${this.DEVICE_PRICE} ₽, у вас ${user.balance} ₽`
      );
    }

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);

    const result = await this.prisma.$transaction(async (prisma) => {
      const device = await prisma.device.create({
        data: {
          userId,
          name: dto.name,
          customName: dto.customName || dto.name,
          type: dto.type,
          configLink: this.generateConfigLink(),
          isActive: true,
          expiresAt,
        },
      });

      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: {
          balance: {
            decrement: this.DEVICE_PRICE,
          },
        },
      });

      const transaction = await prisma.transaction.create({
        data: {
          userId,
          deviceId: device.id,
          amount: -this.DEVICE_PRICE,
          type: 'subscription',
          description: `Подписка на устройство ${dto.customName || dto.name} (30 дней)`,
        },
      });

      return { device, updatedUser, transaction };
    });

    this.logger.log(`✅ Device created with id: ${result.device.id}, expires: ${expiresAt}`);
    this.logger.log(`💰 New balance: ${result.updatedUser.balance}`);

    return {
      id: result.device.id,
      name: result.device.customName,
      configLink: result.device.configLink,
      isActive: result.device.isActive,
      expiresAt: result.device.expiresAt,
      daysLeft: 30,
      balance: result.updatedUser.balance,
    };
  }

  async addDeviceByUsername(username: string, dto: any) {
    const user = await this.findUserByUsername(username);
    return this.addDevice(user.id, dto);
  }

  async deactivateDevice(deviceId: number, userId: number) {
    this.logger.log(`🔴 Deactivating device ${deviceId} for user ${userId}`);
    
    await this.prisma.device.updateMany({
      where: { id: deviceId, userId },
      data: { isActive: false },
    });

    return { success: true };
  }

  async deleteDevice(deviceId: number, userId: number) {
    this.logger.log(`🗑️ Deleting device ${deviceId} for user ${userId}`);
    
    await this.prisma.device.deleteMany({
      where: { id: deviceId, userId },
    });
    
    return { success: true };
  }

  async deleteDeviceByUsername(deviceId: number, username: string) {
    const user = await this.findUserByUsername(username);
    return this.deleteDevice(deviceId, user.id);
  }

// Добавь эти методы в класс DeviceService

async replaceDeviceByUsername(deviceId: number, username: string) {
  const user = await this.prisma.user.findFirst({
    where: { 
      username: {
        equals: username,
        mode: 'insensitive',
      },
    },
  });

  if (!user) throw new NotFoundException(`User @${username} not found`);
  
  return this.replaceDevice(deviceId, user.id);
}

async updateDeviceNameByUsername(deviceId: number, username: string, customName: string) {
  const user = await this.prisma.user.findFirst({
    where: { 
      username: {
        equals: username,
        mode: 'insensitive',
      },
    },
  });

  if (!user) throw new NotFoundException(`User @${username} not found`);
  
  return this.updateDeviceName(deviceId, user.id, customName);
}

async replaceDevice(deviceId: number, userId: number) {
  this.logger.log(`🔄 Replacing device ${deviceId} for user ${userId}`);
  
  const device = await this.prisma.device.findFirst({
    where: { id: deviceId, userId },
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
}

async updateDeviceName(deviceId: number, userId: number, customName: string) {
  this.logger.log(`✏️ Updating device ${deviceId} name to: ${customName}`);
  
  const device = await this.prisma.device.findFirst({
    where: { id: deviceId, userId },
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
}

}