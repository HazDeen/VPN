// src/xui/xui.controller.ts
import { Controller, Post, Body } from '@nestjs/common';
import { XuiService } from './xui.service';

@Controller('xui')
export class XuiController {
  constructor(private xuiService: XuiService) {}

  @Post('test-add-device')
  async testAddDevice(@Body() body: any) {
    const { email, totalGb = 100, expiryDays = 30 } = body;
    return this.xuiService.addClient(1, email, totalGb, expiryDays);
  }
}