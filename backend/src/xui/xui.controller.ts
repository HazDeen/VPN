// backend/src/xui/xui.controller.ts
import { Controller, Post, Body, Logger, HttpException, HttpStatus, Get } from '@nestjs/common';
import { XuiApiService, CreateClientDto } from './xui-api.service';

@Controller('xui')
export class XuiController {
  private readonly logger = new Logger(XuiController.name);

  constructor(private xuiApiService: XuiApiService) {}

  @Get('health')
  health() {
    return { 
      status: 'ok', 
      timestamp: new Date().toISOString(),
      service: 'XUI Controller'
    };
  }

  @Get('inbounds')
  async getInbounds() {
    try {
      const inbounds = await this.xuiApiService.getInbounds();
      return {
        success: true,
        data: inbounds
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  @Post('client')
  async createClient(@Body() body: CreateClientDto) {
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
        totalGb: body.totalGb || 100*1024*1024*1024,
        expiryTime: body.expiryTime || Date.now() + 30 * 24 * 60 * 60 * 1000,
        comment: body.comment || ''
      });

      return {
        success: true,
        message: '✅ Клиент успешно создан',
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

  @Post('test-add-device')
  async testAddDevice(@Body() body: any) {
    // Тестовый эндпоинт для отладки
    return {
      success: true,
      data: {
        email: body.email || 'test@user.com',
        subscriptionUrl: `https://test-vpn.com/sub/${Date.now()}`,
        expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        traffic: body.totalGb || 100*1024*1024*1024
      }
    };
  }
}