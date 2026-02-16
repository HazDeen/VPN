import { Controller, Post, Body, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('telegram-id')
  async loginWithTelegramId(@Body() body: { telegramId: number }) {
    console.log(`📥 Login attempt with telegramId: ${body.telegramId}`);
    
    if (!body.telegramId) {
      throw new UnauthorizedException('Telegram ID required');
    }
    
    const user = await this.authService.findByTelegramId(body.telegramId);
    
    return {
      success: true,
      user: {
        id: user.id,
        telegramId: Number(user.telegramId),
        firstName: user.firstName,
        lastName: user.lastName,
        username: user.username,
        balance: user.balance,
      },
    };
  }
}