import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { TelegramGuard } from '../auth/guards/telegram/telegram.guard'; // 👈 ЗАКОММЕНТИРУЙ

@Controller('user')
@UseGuards(TelegramGuard) // 👈 ЗАКОММЕНТИРУЙ
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('balance')
  async getBalance(@Req() req) {
    // Тестовый пользователь с ID 1
    return this.userService.getBalance(BigInt(1));
  }

  @Get('profile')
  async getProfile(@Req() req) {
    return this.userService.getProfile(BigInt(1));
  }
}