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

      // Группируем по датам для фронта
      const grouped = {};
      
      transactions.forEach((tx) => {
        // 👇 ИСПРАВЛЕННЫЙ ФОРМАТ: "7 ФЕВРАЛЯ", "6 ФЕВРАЛЯ"
        const date = tx.createdAt.toLocaleDateString('ru-RU', {
          day: 'numeric',
          month: 'long',
        }).toUpperCase();
        // Убираем "2026 Г." и "12 ФЕВРАЛЯ" → "12 ФЕВРАЛЯ"

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