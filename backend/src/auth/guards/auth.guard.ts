import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import * as crypto from 'crypto';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;

    if (!authHeader) {
      throw new UnauthorizedException('No authorization header');
    }

    const [type, initData] = authHeader.split(' ');

    if (type !== 'tma' || !initData) {
      throw new UnauthorizedException('Invalid authorization format');
    }

    try {
      const params = new URLSearchParams(initData);
      const userStr = params.get('user');
      
      if (!userStr) {
        throw new UnauthorizedException('User data not found');
      }
      
      const telegramUser = JSON.parse(userStr);
      const telegramId = BigInt(telegramUser.id);

      // Генерируем токен
      const authToken = crypto.randomBytes(32).toString('hex');

      let user = await this.prisma.user.findUnique({
        where: { telegramId },
      });

      if (!user) {
        user = await this.prisma.user.create({
          data: {
            telegramId,
            firstName: telegramUser.first_name || '',
            lastName: telegramUser.last_name || '',
            username: telegramUser.username || '',
            authToken, // 👈 ДОБАВЛЯЕМ ТОКЕН!
            balance: 0,
          },
        });
      }

      request.user = {
        id: user.id,
        telegramId: Number(user.telegramId),
        firstName: user.firstName,
        lastName: user.lastName,
        username: user.username,
        balance: user.balance,
      };

      return true;
    } catch (error) {
      console.error('❌ Auth error:', error);
      throw new UnauthorizedException('Authentication failed');
    }
  }
}