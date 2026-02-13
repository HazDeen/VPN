import { Controller, Get, Post, Body, Param, Delete, Logger } from '@nestjs/common';
import { DeviceService } from './device.service';

@Controller('devices')
export class DeviceController {
  private readonly logger = new Logger(DeviceController.name);

  constructor(private readonly deviceService: DeviceService) {}

  @Get()
  async getUserDevices() {
    this.logger.log('📱 GET devices for user 1');
    return this.deviceService.getUserDevices(1);
  }

  @Post()
  async addDevice(@Body() body: any) {
    this.logger.log(`📦 POST add device: ${JSON.stringify(body)}`);
    
    // ✅ Проверяем, что пришло
    if (!body || !body.name || !body.type) {
      this.logger.error('❌ Missing required fields');
      throw new Error('Missing name or type');
    }

    try {
      const result = await this.deviceService.addDevice(1, body);
      this.logger.log(`✅ Device added: ${JSON.stringify(result)}`);
      return result;
    } catch (error) {
      this.logger.error(`❌ Failed to add device: ${error.message}`);
      throw error;
    }
  }

  @Delete(':id')
  async deleteDevice(@Param('id') id: string) {
    this.logger.log(`🗑️ DELETE device ${id} for user 1`);
    return this.deviceService.deleteDevice(parseInt(id), 1);
  }
}