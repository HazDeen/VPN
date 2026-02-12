import { Controller, Post, Body, Req, UseGuards, Get, Query } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { TelegramGuard } from '../auth/guards/telegram/telegram.guard';
import { CreateInvoiceDto } from './dto/create-invoice.dto';

@Controller('payments')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Post('create-invoice')
  @UseGuards(TelegramGuard)
  async createInvoice(@Req() req, @Body() dto: CreateInvoiceDto) {
    // В реальном приложении chatId нужно получить от фронтенда
    // или из initData
    const chatId = Number(req.user.telegramId);
    return this.paymentService.createInvoice(req.user.id, dto.amount, chatId);
  }
}