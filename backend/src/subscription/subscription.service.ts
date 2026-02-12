import { Injectable, BadRequestException, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SubscriptionService {
  constructor(private prisma: PrismaService) {}

  async activateDeviceSubscription(deviceId: bigint, userId: bigint) {
    try {
      const device = await this.prisma.device.findUnique({
        where: { id: deviceId },
      });

      if (!device) {
        throw new BadRequestException('Device not found');
      }

      const user = await this.prisma.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        throw new NotFoundException('User not found');
      }

      const PRICE = 300;

      if (user.balance < PRICE) {
        throw new BadRequestException('Insufficient balance');
      }

      // Списание средств
      await this.prisma.$transaction([
        this.prisma.user.update({
          where: { id: userId },
          data: { balance: { decrement: PRICE } },
        }),
        this.prisma.transaction.create({
          data: {
            userId,
            deviceId,
            amount: -PRICE,
            type: 'subscription',
            description: `Подписка на устройство ${device.customName || device.name}`,
          },
        }),
      ]);

      // Создаем подписку
      const now = new Date();
      const nextBilling = new Date();
      nextBilling.setMonth(now.getMonth() + 1);

      const subscription = await this.prisma.subscription.create({
        data: {
          deviceId,
          userId,
          price: PRICE,
          nextBillingDate: nextBilling,
          isActive: true,
        },
      });

      // Активируем устройство
      await this.prisma.device.update({
        where: { id: deviceId },
        data: { isActive: true },
      });

      return {
        success: true,
        subscription: {
          id: Number(subscription.id), // 👈 КОНВЕРТИРУЕМ
          nextBillingDate: subscription.nextBillingDate,
          price: subscription.price,
        },
      };
    } catch (error) {
      console.error('Activate subscription error:', error);
      if (error instanceof BadRequestException || error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to activate subscription');
    }
  }

  async deactivateDeviceSubscription(deviceId: bigint, userId: bigint) {
    try {
      const subscription = await this.prisma.subscription.findFirst({
        where: {
          deviceId,
          userId,
          isActive: true,
        },
      });

      if (!subscription) {
        throw new BadRequestException('Active subscription not found');
      }

      await this.prisma.$transaction([
        this.prisma.subscription.update({
          where: { id: subscription.id },
          data: { isActive: false },
        }),
        this.prisma.device.update({
          where: { id: deviceId },
          data: { isActive: false },
        }),
      ]);

      return { success: true };
    } catch (error) {
      console.error('Deactivate subscription error:', error);
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to deactivate subscription');
    }
  }
}