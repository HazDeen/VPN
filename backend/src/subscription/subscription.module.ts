import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { SubscriptionService } from './subscription.service';
import { SubscriptionController } from './subscription.controller';
import { BillingProcessor } from './processors/billing.processor';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'billing',
    }),
  ],
  controllers: [SubscriptionController],
  providers: [
    SubscriptionService, 
    BillingProcessor
  ],
  exports: [SubscriptionService],
})
export class SubscriptionModule {}