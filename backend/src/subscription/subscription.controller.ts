import { Controller, Post, Param, Req, UseGuards } from '@nestjs/common';
import { SubscriptionService } from './subscription.service';
// import { TelegramGuard } from '../auth/guards/telegram/telegram.guard'; // 👈 ЗАКОММЕНТИРУЙ

@Controller('subscriptions')
// @UseGuards(TelegramGuard) // 👈 ЗАКОММЕНТИРУЙ
export class SubscriptionController {
  constructor(private readonly subscriptionService: SubscriptionService) {}

  @Post('activate/:deviceId')
  async activateSubscription(@Param('deviceId') deviceId: string, @Req() req) {
    return this.subscriptionService.activateDeviceSubscription(
      BigInt(deviceId),
      BigInt(1), // Тестовый пользователь
    );
  }

  @Post('deactivate/:deviceId')
  async deactivateSubscription(@Param('deviceId') deviceId: string, @Req() req) {
    return this.subscriptionService.deactivateDeviceSubscription(
      BigInt(deviceId),
      BigInt(1),
    );
  }
}