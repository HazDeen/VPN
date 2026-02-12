import { Controller, Post, Body, Req, UseGuards } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { TelegramGuard } from '../auth/guards/telegram/telegram.guard';

class TestPaymentDto {
  amount: number;
}

@Controller('payments')
@UseGuards(TelegramGuard)
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Post('test-payment')
  async testPayment(@Req() req, @Body() dto: TestPaymentDto) {
    return this.paymentService.processTestPayment(req.user.id, dto.amount);
  }

  // Для обратной совместимости
  @Post('create-invoice')
  async createInvoice(@Req() req, @Body() dto: TestPaymentDto) {
    return this.paymentService.processTestPayment(req.user.id, dto.amount);
  }
}