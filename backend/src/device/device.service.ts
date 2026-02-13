import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { randomBytes } from 'crypto';

@Injectable()
export class DeviceService {
  private readonly logger = new Logger(DeviceService.name);

  constructor(private prisma: PrismaService) {}

  private generateConfigLink(): string {
    return `https://hvpn.io/${randomBytes(16).toString('base64url')}`;
  }

  async getUserDevices(userId: number) {
  this.logger.log(`📱 Getting devices for user ${userId}`);
  
  const devices = await this.prisma.device.findMany({
    where: { userId },
    orderBy: { connectedAt: 'desc' },
  });

  // ✅ ПРИНУДИТЕЛЬНО КОНВЕРТИРУЕМ ВСЁ
  return devices.map(d => ({
    id: d.id,
    name: d.customName || d.name,
    model: d.name,
    type: d.type,
    date: d.connectedAt.toLocaleDateString('ru-RU'),
    isActive: d.isActive,
    configLink: d.configLink,
    // 👇 ЯВНО КОНВЕРТИРУЕМ
    userId: Number(d.userId)
  }));
}

async addDevice(userId: number, dto: any) {
  this.logger.log(`➕ Adding device for user ${userId}: ${JSON.stringify(dto)}`);
  
  const count = await this.prisma.device.count({ 
    where: { userId } 
  });
  
  if (count >= 5) {
    throw new BadRequestException('Максимум 5 устройств');
  }

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

  this.logger.log(`✅ Device created with id: ${device.id}`);
  
  // ✅ ВОЗВРАЩАЕМ ТОЛЬКО number И string!
  return {
    id: device.id,                    // number
    name: device.customName,           // string
    configLink: device.configLink,     // string
  };
}

  async deleteDevice(deviceId: number, userId: number) {
    this.logger.log(`🗑️ Deleting device ${deviceId} for user ${userId}`);
    
    await this.prisma.device.deleteMany({
      where: { id: deviceId, userId },
    });
    
    return { success: true };
  }
}