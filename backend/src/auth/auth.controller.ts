import { Controller, Post, Get, Req, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { TelegramGuard } from './guards/telegram/telegram.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('telegram')
  @UseGuards(TelegramGuard)
  async telegramAuth(@Req() req) {
    console.log('🔐 Auth request received');
    console.log('👤 User from guard:', req.user);
    
    const user = await this.authService.findOrCreateUser(req.user);
    
    console.log('📦 User from DB:', user);
    
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
  @UseGuards(TelegramGuard)
  async getMe(@Req() req) {
    return this.authService.getMe(req.user.id);
  }
}