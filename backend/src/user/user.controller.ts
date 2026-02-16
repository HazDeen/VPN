import { Controller, Get, Post, Body, Headers, UnauthorizedException } from '@nestjs/common';
import { UserService } from './user.service';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('balance')
  async getBalance(@Headers('x-username') username: string) {
    if (!username) throw new UnauthorizedException('Username required');
    return this.userService.getBalanceByUsername(username);
  }

  @Get('profile')
  async getProfile(@Headers('x-username') username: string) {
    if (!username) throw new UnauthorizedException('Username required');
    return this.userService.getProfileByUsername(username);
  }

  @Post('topup')
  async topUp(
    @Headers('x-username') username: string,
    @Body() body: { amount: number }
  ) {
    if (!username) throw new UnauthorizedException('Username required');
    console.log(`💰 Topup for @${username}:`, body.amount);
    return this.userService.topUpBalanceByUsername(username, body.amount);
  }
}