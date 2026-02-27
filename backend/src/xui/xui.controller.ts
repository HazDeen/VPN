// src/xui/xui.controller.ts
import { Controller, Post, Body, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { XuiApiService } from './xui-api.service';

@Controller('xui')
export class XuiController {
  private readonly logger = new Logger(XuiController.name);

  constructor(private xuiApiService: XuiApiService) {}

  @Post('client')
  async createClient(@Body() body: any) {
    this.logger.log('📝 Запрос на создание клиента');

    try {
      // Проверяем обязательные поля
      if (!body.tgUid) {
        throw new Error('tgUid обязателен');
      }
      if (!body.email) {
        throw new Error('email обязателен');
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
        message: '✅ Клиент успешно создан в 3x-ui',
        data: result
      };

    } catch (error) {
      this.logger.error('❌ Ошибка создания клиента:', error);
      throw new HttpException({
        success: false,
        message: error.message || 'Ошибка создания клиента в 3x-ui'
      }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}