import { Controller, Get, Post, Body, Req, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { AuthGuard } from '../auth/guards/auth.guard'; // создадим ниже

@Controller('user')
@UseGuards(AuthGuard) // 👈 ЗАЩИТА
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('balance')
  async getBalance(@Req() req) {
    console.log('🔥🔥🔥 USER ID:', req.user.id); // 👈 ПОСМОТРИМ, ЧТО ПРИХОДИТ
    const userId = req.user.id;
    return this.userService.getBalance(userId);
  }

  @Get('profile')
  async getProfile(@Req() req) {
    const userId = req.user.id;
    return this.userService.getProfile(userId);
  }

  @Post('topup')
  async topUp(@Req() req, @Body() body: { amount: number }) {
    const userId = req.user.id;
    return this.userService.topUpBalance(userId, body.amount);
  }
}