import { Controller, Get, Query, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get('token')
  async loginWithToken(@Query('token') token: string) {
    if (!token) {
      throw new UnauthorizedException('Token required');
    }
    
    const user = await this.authService.findByToken(token);
    
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