import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';

@Injectable()
export class TelegramGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    
    // ✅ ВСЕГДА ПРОПУСКАЕМ И ДАЁМ ТЕСТОВОГО ПОЛЬЗОВАТЕЛЯ
    request.user = {
      id: BigInt(1314191617), // Твой telegram ID
      telegramId: BigInt(1314191617),
      firstName: 'hazdeen',
      lastName: '',
      username: 'hazdeen',
    };
    
    return true;
  }
}