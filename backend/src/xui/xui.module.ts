// src/xui/xui.module.ts
import { Module } from '@nestjs/common';
import { XuiService } from './xui.service';
import { XuiController } from './xui.controller'; // Добавить

@Module({
  controllers: [XuiController], // Добавить
  providers: [XuiService],
  exports: [XuiService],
})
export class XuiModule {}