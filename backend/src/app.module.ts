import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { UserModule } from './user/user.module';
import { DeviceModule } from './device/device.module';
import { AuthModule } from './auth/auth.module';
import { TransactionModule } from './transaction/transaction.module';
import { LoggerModule } from './logger/logger.module';
// import { BotModule } from './bot/bot.module';
import { AdminModule } from './admin/admin.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    UserModule,
    DeviceModule,
    AuthModule,
    TransactionModule,
    LoggerModule,
    // BotModule,
    AdminModule,
  ],
})
export class AppModule {}