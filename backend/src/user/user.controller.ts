import { Controller, Get, Post, Body } from '@nestjs/common';
import { UserService } from './user.service';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('balance')
  async getBalance() {
    // ✅ Передаём number, а в сервисе конвертируем
    return this.userService.getBalance(1);
  }

  @Get('profile')
  async getProfile() {
    return this.userService.getProfile(1);
  }

  @Post('topup')
  async topUp(@Body() body: { amount: number }) {
    console.log('💰 TOPUP request:', body); // 👈 ЛОГ
    return this.userService.topUpBalance(1, body.amount);
  }
}