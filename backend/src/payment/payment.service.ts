import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PaymentService {
  constructor(private prisma: PrismaService) {}

  // ✅ ТЕСТОВАЯ ОПЛАТА - ПРОСТО ЗАЧИСЛЯЕМ ДЕНЬГИ!
  async processTestPayment(userId: bigint, amount: number) {
    // Проверяем сумму
    if (amount < 1 || amount > 10000) {
      throw new BadRequestException('Сумма должна быть от 1 до 10000');
    }

    // Начисляем баланс
    await this.prisma.$transaction([
      this.prisma.user.update({
        where: { id: userId },
        data: { balance: { increment: amount } },
      }),
      this.prisma.transaction.create({
        data: {
          userId,
          amount,
          type: 'topup',
          description: `Пополнение счёта (тестовое)`,
        },
      }),
    ]);

    console.log(`✅ Тестовая оплата: +${amount}₽ для пользователя ${userId}`);

    return {
      success: true,
      message: 'Баланс успешно пополнен',
      amount,
    };
  }

  // ОСТАВЛЯЕМ ДЛЯ СОВМЕСТИМОСТИ
  async createInvoice(userId: bigint, amount: number, chatId: number) {
    return this.processTestPayment(userId, amount);
  }

  async handlePreCheckoutQuery(preCheckoutQuery: any) {
    return { ok: true };
  }

  async handleSuccessfulPayment(payment: any) {
    return { ok: true };
  }
}