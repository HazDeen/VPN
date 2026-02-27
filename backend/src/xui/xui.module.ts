// backend/src/xui/xui.module.ts
import { Module } from '@nestjs/common';
import { XuiController } from './xui.controller';
import { XuiApiService } from './xui-api.service';

@Module({
  controllers: [XuiController],
  providers: [XuiApiService],
  exports: [XuiApiService],
})
export class XuiModule {}