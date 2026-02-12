import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { TransactionService } from './transaction.service';
// import { TelegramGuard } from '../auth/guards/telegram/telegram.guard'; // 👈 ЗАКОММЕНТИРУЙ

@Controller('transactions')
// @UseGuards(TelegramGuard) // 👈 ЗАКОММЕНТИРУЙ
export class TransactionController {
  constructor(private readonly transactionService: TransactionService) {}

  @Get()
  async getUserTransactions(@Req() req) {
    return this.transactionService.getUserTransactions(BigInt(1));
  }
}