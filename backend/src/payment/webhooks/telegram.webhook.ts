import { Controller, Post, Body } from '@nestjs/common';
import { PaymentService } from '../payment.service';

@Controller('webhooks/telegram')
export class TelegramWebhookController {
  constructor(private readonly paymentService: PaymentService) {}

  @Post()
  async handleTelegramWebhook(@Body() update: any) {
    // Обработка pre_checkout_query
    if (update.pre_checkout_query) {
      await this.paymentService.handlePreCheckoutQuery(update.pre_checkout_query);
      return { ok: true };
    }

    // Обработка successful_payment
    if (update.message?.successful_payment) {
      await this.paymentService.handleSuccessfulPayment(update.message.successful_payment);
      return { ok: true };
    }

    return { ok: true };
  }
}