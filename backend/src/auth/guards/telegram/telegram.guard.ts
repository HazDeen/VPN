import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { Request } from 'express';
import * as crypto from 'crypto';

@Injectable()
export class TelegramGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const authHeader = request.headers.authorization;

    if (!authHeader) {
      throw new UnauthorizedException('No authorization header');
    }

    const [type, initData] = authHeader.split(' ');

    if (type !== 'tma' || !initData) {
      throw new UnauthorizedException('Invalid authorization format');
    }

    const botToken = process.env.BOT_TOKEN;
    if (!botToken) {
      throw new UnauthorizedException('Bot token not configured');
    }

    try {
      const params = new URLSearchParams(initData);
      const hash = params.get('hash');
      params.delete('hash');

      // Сортируем параметры
      const items = Array.from(params.entries());
      items.sort(([keyA], [keyB]) => keyA.localeCompare(keyB));

      // Создаем строку для проверки
      const dataCheckString = items.map(([key, value]) => `${key}=${value}`).join('\n');

      // Создаем секретный ключ
      const secretKey = crypto
        .createHmac('sha256', 'WebAppData')
        .update(botToken)
        .digest();

      // Вычисляем хеш
      const calculatedHash = crypto
        .createHmac('sha256', secretKey)
        .update(dataCheckString)
        .digest('hex');

      if (calculatedHash !== hash) {
        throw new UnauthorizedException('Invalid hash');
      }

      // Проверяем время (не старше 1 часа)
      const authDate = parseInt(params.get('auth_date') || '0');
      const currentTime = Math.floor(Date.now() / 1000);
      
      if (currentTime - authDate > 3600) {
        throw new UnauthorizedException('Auth data expired');
      }

      // Парсим данные пользователя
      const userStr = params.get('user');
      if (!userStr) {
        throw new UnauthorizedException('User data not found');
      }
      
      const user = JSON.parse(userStr);
      request.user = {
        id: BigInt(user.id),
        telegramId: BigInt(user.id),
        firstName: user.first_name || '',
        lastName: user.last_name || '',
        username: user.username || '',
      };

      return true;
    } catch (error) {
      console.error('Telegram auth error:', error);
      throw new UnauthorizedException('Telegram auth failed');
    }
  }
}