import { Controller, Get, Post, Body } from '@nestjs/common';
import { UserService } from './user.service';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('balance')
  async getBalance() {
    return this.userService.getBalance(1); // number!
  }

  @Post('topup')
  async topUp(@Body() body: { amount: number }) {
    return this.userService.topUpBalance(1, body.amount); // number!
  }
}