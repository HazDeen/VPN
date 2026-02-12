import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { UserModule } from './user/user.module';
import { DeviceModule } from './device/device.module';
import { AuthModule } from './auth/auth.module';
import { TransactionModule } from './transaction/transaction.module';
import { SubscriptionModule } from './subscription/subscription.module';
import { PaymentModule } from './payment/payment.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    // BullModule.forRoot({
    //   redis: {
    //     host: process.env.REDIS_HOST || 'localhost',
    //     port: Number(process.env.REDIS_PORT) || 6379,
    //     // ✅ Убираем retryAttempts и retryDelay - их нет в RedisOptions!
    //   },
    // }),
    PrismaModule,
    UserModule,
    DeviceModule,
    AuthModule,
    TransactionModule,
    SubscriptionModule,
    PaymentModule,
  ],
})
export class AppModule {}