import { Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';  // Этот импорт остаётся
import { PrismaService } from '../../prisma/prisma.service';

@Processor('billing')
export class BillingProcessor {
  constructor(private prisma: PrismaService) {}

  @Process('charge')
  async handleMonthlyCharge(job: Job) {  // Job не нужно менять
    const { subscriptionId, deviceId, userId } = job.data;

    console.log(`Processing monthly charge for subscription ${subscriptionId}`);

    const subscription = await this.prisma.subscription.findUnique({
      where: { id: subscriptionId },
      include: { device: true },
    });

    if (!subscription || !subscription.isActive) {
      console.log(`Subscription ${subscriptionId} is not active`);
      return;
    }

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    // ✅ ИСПРАВЛЯЕМ: проверяем что user существует
    if (!user) {
      console.log(`User ${userId} not found`);
      return;
    }

    const PRICE = subscription.price;

    if (user.balance >= PRICE) {
      // Успешное списание
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
            description: `Ежемесячная подписка на устройство ${subscription.device.customName || subscription.device.name}`,
          },
        }),
        this.prisma.subscription.update({
          where: { id: subscriptionId },
          data: {
            nextBillingDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          },
        }),
      ]);

      // Планируем следующее списание
      await job.queue.add(
        'charge',
        { subscriptionId, deviceId, userId },
        { delay: 30 * 24 * 60 * 60 * 1000 },
      );

      console.log(`Successfully charged ${PRICE} for subscription ${subscriptionId}`);
    } else {
      // Недостаточно средств - деактивируем
      await this.prisma.$transaction([
        this.prisma.subscription.update({
          where: { id: subscriptionId },
          data: { isActive: false },
        }),
        this.prisma.device.update({
          where: { id: deviceId },
          data: { isActive: false },
        }),
      ]);

      console.log(`Insufficient balance for subscription ${subscriptionId}, device deactivated`);
    }
  }
}