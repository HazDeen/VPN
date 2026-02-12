import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TransactionService {
  constructor(private prisma: PrismaService) {}

  async getUserTransactions(userId: bigint) {
    try {
      const transactions = await this.prisma.transaction.findMany({
        where: { userId },
        include: {
          device: true,
        },
        orderBy: { createdAt: 'desc' },
        take: 50,
      });

      // Группируем по датам
      const grouped = {};
      
      transactions.forEach((tx) => {
        const date = tx.createdAt.toLocaleDateString('ru-RU', {
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        }).toUpperCase();

        if (!grouped[date]) {
          grouped[date] = [];
        }

        grouped[date].push({
          id: Number(tx.id),
          time: tx.createdAt.toLocaleTimeString('ru-RU', {
            hour: '2-digit',
            minute: '2-digit',
          }),
          description: tx.description,
          amount: tx.amount,
          type: tx.type,
          deviceName: tx.device?.customName || tx.device?.name,
        });
      });

      return grouped;
    } catch (error) {
      console.error('Get transactions error:', error);
      throw new InternalServerErrorException('Failed to get transactions');
    }
  }
}