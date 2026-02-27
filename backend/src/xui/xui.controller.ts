// backend/src/xui/xui.controller.ts
import { Controller, Post, Body, Logger, HttpException, HttpStatus, Get, Param } from '@nestjs/common';
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

  @Post('client/delete')
  async deleteClient(@Body() body: { inboundId: number; uuid: string }) {
    this.logger.log(`🗑️ Запрос на удаление клиента:`, body);
    
    try {
      const result = await this.xuiApiService.deleteClientByUuid(body.inboundId, body.uuid);
      return {
        success: true,
        message: '✅ Клиент успешно удалён',
        data: result
      };
    } catch (error) {
      this.logger.error('❌ Ошибка удаления:', error);
      throw new HttpException({
        success: false,
        message: error.message
      }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }


  
  @Get('user-devices/:tgUid')
  async getUserDevices(@Param('tgUid') tgUid: string) {
    this.logger.log(`📱 Запрос устройств для пользователя ${tgUid}`);
    
    try {
      const devices = await this.xuiApiService.getUserDevices(tgUid);
      return {
        success: true,
        data: devices
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  // backend/src/xui/xui.controller.ts
// Добавь эти методы:

@Post('client/update')
async updateClient(@Body() body: { inboundId: number; uuid: string; comment: string }) {
  this.logger.log('📝 Запрос на обновление клиента:', body);
  
  try {
    const result = await this.xuiApiService.updateClientComment(
      body.inboundId, 
      body.uuid, 
      body.comment
    );
    
    return {
      success: true,
      message: '✅ Клиент обновлён',
      data: result
    };
  } catch (error) {
    this.logger.error('❌ Ошибка обновления:', error);
    throw new HttpException({
      success: false,
      message: error.message
    }, HttpStatus.INTERNAL_SERVER_ERROR);
  }
}

@Post('client/replace-link')
async replaceClientLink(@Body() body: { inboundId: number; uuid: string }) {
  this.logger.log('🔄 Запрос на замену ссылки:', body);
  
  try {
    const result = await this.xuiApiService.replaceClientLink(
      body.inboundId, 
      body.uuid
    );
    
    return {
      success: true,
      message: '✅ Новая ссылка сгенерирована',
      data: result
    };
  } catch (error) {
    this.logger.error('❌ Ошибка замены ссылки:', error);
    throw new HttpException({
      success: false,
      message: error.message
    }, HttpStatus.INTERNAL_SERVER_ERROR);
  }
}
}