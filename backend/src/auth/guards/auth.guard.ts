import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;

    if (!authHeader) {
      throw new UnauthorizedException('No authorization header');
    }

    // Парсим токен (временное решение - пока берём ID из заголовка)
    // В реальности тут должна быть проверка JWT или Telegram initData
    const token = authHeader.replace('Bearer ', '');
    
    // Пока для теста - если нет токена, возвращаем ошибку
    if (!token) {
      throw new UnauthorizedException('Invalid token');
    }

    // ВРЕМЕННО: для теста пропускаем всех и даём ID=1
    // TODO: заменить на реальную проверку
    request.user = { id: 1 };
    
    return true;
  }
}