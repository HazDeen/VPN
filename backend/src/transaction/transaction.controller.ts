import { Controller, Get } from '@nestjs/common';
import { TransactionService } from './transaction.service';

@Controller('transactions')
export class TransactionController {
  constructor(private readonly transactionService: TransactionService) {}

  @Get()
  async getUserTransactions() {
    // ✅ ВРЕМЕННО ХАРДКОДИМ userId = 1
    return this.transactionService.getUserTransactions(1);
  }
}