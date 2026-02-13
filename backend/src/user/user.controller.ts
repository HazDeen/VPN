import { Controller, Get, Post, Body } from '@nestjs/common';
import { UserService } from './user.service';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('balance')
  async getBalance() {
    const result = await this.userService.getBalance(1);
    console.log('🔍 getBalance result:', result);
    return result;
  }

  @Post('topup')
  async topUp(@Body() body: { amount: number }) {
    console.log('💰 topUp request:', body);
    const result = await this.userService.topUpBalance(1, body.amount);
    console.log('✅ topUp result:', result);
    return result;
  }
}