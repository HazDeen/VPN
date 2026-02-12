import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
// import { InjectQueue } from '@nestjs/bull'; // 👈 ЗАКОММЕНТИРУЙ
// import { Queue } from 'bull'; // 👈 ЗАКОММЕНТИРУЙ

@Injectable()
export class SubscriptionService {
  constructor(
    private prisma: PrismaService,
    // @InjectQueue('billing') private billingQueue: Queue, // 👈 ЗАКОММЕНТИРУЙ
  ) {}

  async activateDeviceSubscription(deviceId: bigint, userId: bigint) {
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

    // ❌ ВРЕМЕННО УБИРАЕМ ПЛАНИРОВЩИК!
    // await this.billingQueue.add('charge', { ... }, { delay: ... });

    return {
      success: true,
      subscription: {
        id: Number(subscription.id),
        nextBillingDate: subscription.nextBillingDate,
        price: subscription.price,
      },
    };
  }

  async deactivateDeviceSubscription(deviceId: bigint, userId: bigint) {
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
  }
}