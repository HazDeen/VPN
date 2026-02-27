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

  @Get('debug/test-connection')
  async testConnection() {
    try {
      // Попробуем просто достучаться до панели
      const response = await fetch('http://171.22.16.17:2053');
      return { 
        success: true, 
        status: response.status,
        statusText: response.statusText 
      };
    } catch (error) {
      return { 
        success: false, 
        error: error.message,
        code: error.code 
      };
    }
  }

  // @Get('debug/test-login')
  // async testLogin() {
  //   return this.xuiApiService.testLogin();
  // }

  @Get('inbounds')
  async getInbounds() {
    try {
      const result = await this.xuiApiService['getInbounds']?.();
      return result || { message: 'Метод не реализован' };
    } catch (error) {
      return { error: error.message };
    }
  }

}