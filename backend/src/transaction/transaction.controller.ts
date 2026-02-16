import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { TransactionService } from './transaction.service';
import { AuthGuard } from '../auth/guards/auth.guard';

@Controller('transactions')
@UseGuards(AuthGuard)
export class TransactionController {
  constructor(private readonly transactionService: TransactionService) {}

  @Get()
  async getUserTransactions(@Req() req) {
    return this.transactionService.getUserTransactions(req.user.id);
  }
}