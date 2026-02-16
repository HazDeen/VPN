import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from './guards/auth.guard';

@Controller('auth')
export class AuthController {
  constructor() {}

  @Get('me')
  @UseGuards(AuthGuard)
  async getMe(@Req() req) {
    return {
      success: true,
      user: req.user,
    };
  }
}