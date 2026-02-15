import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { DeviceService } from './device.service';
import { DeviceCronService } from './device-cron.service';
import { DeviceController } from './device.controller';

@Module({
  imports: [ScheduleModule.forRoot()],
  controllers: [DeviceController],
  providers: [DeviceService, DeviceCronService],
  exports: [DeviceService],
})
export class DeviceModule {}