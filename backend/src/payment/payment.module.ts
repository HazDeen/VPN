import { Module } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { PaymentController } from './payment.controller';
import { TelegramWebhookController } from './webhooks/telegram.webhook';

@Module({
  controllers: [PaymentController, TelegramWebhookController],
  providers: [PaymentService],
  exports: [PaymentService],
})
export class PaymentModule {}