import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TransactionService {
  private readonly logger = new Logger(TransactionService.name);

  constructor(private prisma: PrismaService) {}

  async getUserTransactions(userId: number) { // 👈 number, не bigint!
    this.logger.log(`📜 Getting transactions for user ${userId}`);
    
    const transactions = await this.prisma.transaction.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    this.logger.log(`✅ Found ${transactions.length} transactions`);

    // Группируем по датам для фронта
    const grouped = {};
    
    transactions.forEach((t) => {
      const date = t.createdAt.toLocaleDateString('ru-RU', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      }).toUpperCase();

      if (!grouped[date]) {
        grouped[date] = [];
      }

      grouped[date].push({
        id: t.id,
        time: t.createdAt.toLocaleTimeString('ru-RU', {
          hour: '2-digit',
          minute: '2-digit',
        }),
        description: t.description,
        amount: t.amount,
        type: t.type,
      });
    });

    return grouped;
  }
}