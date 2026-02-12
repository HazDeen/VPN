import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { TelegramGuard } from '../auth/guards/telegram/telegram.guard';

@Controller('user')
@UseGuards(TelegramGuard)
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('balance')
  async getBalance(@Req() req) {
    // ✅ БЕРЁМ ID ИЗ ЗАПРОСА, А НЕ ЗАГЛУШКУ!
    return this.userService.getBalance(req.user.id);
  }

  @Get('profile')
  async getProfile(@Req() req) {
    // ✅ ТОЖЕ БЕРЁМ ИЗ ЗАПРОСА
    return this.userService.getProfile(req.user.id);
  }
}