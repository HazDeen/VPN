import { Controller, Post, Body, Get } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get('me')
  async getMe() {
    // 👈 ЖЁСТКО 1 (или реальный userId из авторизации)
    return this.authService.getMe(1);
  }

  @Post('telegram')
  async telegramAuth(@Body() body: any) {
    // ✅ ВСЕГДА ВОЗВРАЩАЕМ ТЕСТОВОГО ПОЛЬЗОВАТЕЛЯ
    return {
      success: true,
      user: {
        id: 1,
        telegramId: 1314191617,
        firstName: 'hazdeen',
        lastName: '',
        username: 'hazdeen',
        balance: 1500,
      },
    };
  }
}