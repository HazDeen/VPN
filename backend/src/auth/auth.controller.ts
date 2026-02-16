import { Controller, Post, Body, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login-by-username')
  async loginByUsername(@Body() body: { username: string }) {
    console.log(`📥 Login attempt with username: ${body.username}`);
    
    if (!body.username) {
      throw new UnauthorizedException('Username required');
    }
    
    const user = await this.authService.findByUsername(body.username);
    
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