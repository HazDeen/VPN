import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Telegraf } from 'telegraf';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class PaymentService {
  private bot: Telegraf;

  constructor(private prisma: PrismaService) {
    this.bot = new Telegraf(process.env.BOT_TOKEN);
  }

  async createInvoice(userId: bigint, amount: number, chatId: number) {
    // Проверяем сумму
    if (amount < 1 || amount > 10000) {
      throw new BadRequestException('Amount must be between 1 and 10000');
    }

    // Создаем уникальный payload
    const payload = uuidv4();

    // Сохраняем инвойс в БД
    const invoice = await this.prisma.paymentInvoice.create({
      data: {
        userId,
        amount,
        payload,
        status: 'pending',
      },
    });

    try {
      // Отправляем инвойс в Telegram
      await this.bot.telegram.sendInvoice(
        chatId,
        {
            title: 'Пополнение баланса VPN',
            description: `Пополнение кошелька на ${amount} ₽`,
            payload: payload,
            provider_token: process.env.TELEGRAM_PAYMENT_PROVIDER_TOKEN,
            currency: 'RUB',
            prices: [{ label: `Пополнение на ${amount} ₽`, amount: amount * 100 }],
            photo_url: 'https://i.imgur.com/1ZQZ1ZQ.png',
            need_name: false,
            need_phone_number: false,
            need_email: false,
            need_shipping_address: false,
            is_flexible: false
        }
        );

    } catch (error) {
      console.error('Telegram invoice error:', error);
      throw new BadRequestException('Failed to create invoice');
    }

    return {
      success: true,
      invoiceId: invoice.id,
    };
  }

  async handlePreCheckoutQuery(preCheckoutQuery: any) {
    try {
      await this.bot.telegram.answerPreCheckoutQuery(preCheckoutQuery.id, true);
    } catch (error) {
      console.error('PreCheckout error:', error);
      throw error;
    }
  }

  async handleSuccessfulPayment(payment: any) {
    const payload = payment.invoice_payload;
    const telegramChargeId = payment.telegram_payment_charge_id;
    const amount = payment.total_amount / 100; // Из копеек в рубли

    // Находим инвойс
    const invoice = await this.prisma.paymentInvoice.findUnique({
      where: { payload },
    });

    if (!invoice || invoice.status === 'paid') {
      return;
    }

    // Начисляем баланс и создаем транзакцию
    await this.prisma.$transaction([
      this.prisma.user.update({
        where: { id: invoice.userId },
        data: { balance: { increment: amount } },
      }),
      this.prisma.paymentInvoice.update({
        where: { id: invoice.id },
        data: {
          status: 'paid',
          telegramChargeId,
          paidAt: new Date(),
        },
      }),
      this.prisma.transaction.create({
        data: {
          userId: invoice.userId,
          amount,
          type: 'topup',
          description: `Пополнение счёта`,
        },
      }),
    ]);

    console.log(`✅ Payment successful for user ${invoice.userId}: +${amount}₽`);
  }
}