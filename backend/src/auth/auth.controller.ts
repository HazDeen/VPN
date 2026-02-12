import { Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { TelegramGuard } from './guards/telegram/telegram.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('telegram')
  @UseGuards(TelegramGuard) // 👈 ЗАКОММЕНТИРУЙ
  async telegramAuth(@Req() req) {
    // 👇 ИСПОЛЬЗУЕМ ТЕСТОВОГО ПОЛЬЗОВАТЕЛЯ
    const testUser = {
      id: 123456789,
      first_name: 'Test',
      last_name: 'User',
      username: 'testuser'
    };
    const user = await this.authService.findOrCreateUser(testUser);
    return {
      success: true,
      user: {
        id: user.id,
        telegramId: user.telegramId,
        firstName: user.firstName,
        lastName: user.lastName,
        username: user.username,
        balance: user.balance,
      },
    };
  }

  @Get('me')
  // @UseGuards(TelegramGuard) // 👈 ЗАКОММЕНТИРУЙ
  async getMe(@Req() req) {
    // Тестовый пользователь с ID 1
    return this.authService.getMe(BigInt(1));
  }
}