import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TransactionService {
  constructor(private prisma: PrismaService) {}

  async getUserTransactions(userId: number) {
  const transactions = await this.prisma.transaction.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    take: 50,
  });

  return transactions.map(t => ({
    id: t.id,
    amount: t.amount,
    type: t.type,
    description: t.description,
    createdAt: t.createdAt,
    // 👇 КОНВЕРТИРУЕМ!
    userId: Number(t.userId),
    deviceId: t.deviceId ? Number(t.deviceId) : null,
  }));
}
}