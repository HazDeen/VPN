// src/xui/xui.controller.ts
import { Controller, Post, Body, Logger, HttpException, HttpStatus, Get } from '@nestjs/common';
import { XuiApiService } from './xui-api.service';

@Controller('xui')
export class XuiController {
  private readonly logger = new Logger(XuiController.name);

  constructor(private xuiApiService: XuiApiService) {}

  @Get('health')
  health() {
    return { status: 'ok', timestamp: new Date().toISOString() };
  }

  @Post('client')
  async createClient(@Body() body: any) {
    this.logger.log('📝 Запрос на создание клиента:', body);

    try {
      if (!body.tgUid || !body.email) {
        throw new Error('tgUid и email обязательны');
      }

      const result = await this.xuiApiService.createClient({
        inboundId: body.inboundId || 1,
        tgUid: body.tgUid,
        email: body.email,
        flow: body.flow || 'xtls-rprx-vision',
        totalGb: body.totalGb,
        expiryTime: body.expiryTime
      });

      return {
        success: true,
        data: result
      };
    } catch (error) {
      this.logger.error('❌ Ошибка:', error);
      throw new HttpException({
        success: false,
        message: error.message
      }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}