// src/xui/xui.controller.ts
import { 
  Controller, Post, Get, Delete, Body, Param, 
  UseGuards, Logger, HttpException, HttpStatus 
} from '@nestjs/common';
import { XuiApiService } from './xui-api.service';
import { CreateClientDto } from './dto/create-client.dto';

@Controller('xui')
export class XuiController {
  private readonly logger = new Logger(XuiController.name);

  constructor(private xuiApiService: XuiApiService) {}

  /**
   * Создать нового клиента в 3x-ui
   * POST /xui/client
   */
  @Post('client')
  async createClient(@Body() createClientDto: CreateClientDto) {
    this.logger.log('📝 Запрос на создание клиента:', createClientDto.email);

    try {
      const result = await this.xuiApiService.createClient(createClientDto);
      
      return {
        success: true,
        message: '✅ Клиент успешно создан в 3x-ui панели',
        data: result
      };
    } catch (error) {
      this.logger.error('❌ Ошибка создания клиента:', error);
      throw new HttpException({
        success: false,
        message: 'Ошибка создания клиента в 3x-ui',
        error: error.message
      }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * Удалить клиента
   * DELETE /xui/client/:email
   */
  @Delete('client/:email')
  async deleteClient(@Param('email') email: string) {
    try {
      const result = await this.xuiApiService.deleteClient(email);
      return {
        success: true,
        message: `✅ Клиент ${email} удален`,
        data: result
      };
    } catch (error) {
      throw new HttpException({
        success: false,
        message: 'Ошибка удаления клиента',
        error: error.message
      }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * Получить список inbound
   * GET /xui/inbounds
   */
  @Get('inbounds')
  async getInbounds() {
    try {
      const inbounds = await this.xuiApiService.getInbounds();
      return {
        success: true,
        data: inbounds
      };
    } catch (error) {
      throw new HttpException({
        success: false,
        message: 'Ошибка получения списка inbound',
        error: error.message
      }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * Тестовый эндпоинт (заглушка)
   * POST /xui/test-add-device
   */
  @Post('test-add-device')
  async testAddDevice(@Body() body: any) {
    // Возвращаем тестовые данные как раньше
    return {
      success: true,
      data: {
        email: body.email,
        subscriptionUrl: `https://test-vpn-server.com/sub/?id=${body.email}_test_${Date.now()}`,
        expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        traffic: body.totalGb || 100
      }
    };
  }
}