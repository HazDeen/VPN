import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DeviceCronService {
  private readonly logger = new Logger(DeviceCronService.name);

  constructor(private prisma: PrismaService) {}

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT) // Запускается каждый день в 00:00
  async deactivateExpiredDevices() {
    this.logger.log('🔍 Проверка истекших устройств...');

    const now = new Date();
    
    const expiredDevices = await this.prisma.device.updateMany({
      where: {
        isActive: true,
        expiresAt: {
          lt: now, // expiresAt меньше текущей даты
        },
      },
      data: {
        isActive: false,
      },
    });

    this.logger.log(`✅ Деактивировано устройств: ${expiredDevices.count}`);
  }
}