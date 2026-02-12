import { Controller, Get, Post, Body, Param, Delete, Put, Req, UseGuards, Logger, BadRequestException } from '@nestjs/common';
import { DeviceService } from './device.service';
import { CreateDeviceDto } from './dto/create-device.dto';
import { TelegramGuard } from '../auth/guards/telegram/telegram.guard';

@Controller('devices')
@UseGuards(TelegramGuard)
export class DeviceController {
  private readonly logger = new Logger(DeviceController.name);

  constructor(private readonly deviceService: DeviceService) {}

  @Get()
  async getUserDevices(@Req() req) {
    this.logger.log(`📱 GET devices for user ${req.user.id}`);
    try {
      const devices = await this.deviceService.getUserDevices(req.user.id);
      return devices;
    } catch (error) {
      this.logger.error(`❌ Error getting devices: ${error.message}`);
      throw error;
    }
  }

  @Post()
  async addDevice(@Req() req, @Body() dto: CreateDeviceDto) {
    this.logger.log(`➕ POST device for user ${req.user.id}: ${JSON.stringify(dto)}`);
    
    try {
      if (!dto.name || !dto.type) {
        throw new BadRequestException('Missing required fields: name and type are required');
      }
      
      const device = await this.deviceService.addDevice(req.user.id, dto);
      return device;
    } catch (error) {
      this.logger.error(`❌ Error adding device: ${error.message}`);
      throw error;
    }
  }

  @Post(':id/replace')
  async replaceDevice(@Param('id') id: string, @Req() req) {
    this.logger.log(`🔄 POST replace device ${id} for user ${req.user.id}`);
    try {
      return this.deviceService.replaceDevice(BigInt(id), req.user.id);
    } catch (error) {
      this.logger.error(`❌ Error replacing device: ${error.message}`);
      throw error;
    }
  }

  @Put(':id/name')
  async updateDeviceName(
    @Param('id') id: string,
    @Body('customName') customName: string,
    @Req() req,
  ) {
    this.logger.log(`✏️ PUT update device name ${id} for user ${req.user.id}: ${customName}`);
    try {
      if (!customName) {
        throw new BadRequestException('customName is required');
      }
      return this.deviceService.updateDeviceName(BigInt(id), req.user.id, customName);
    } catch (error) {
      this.logger.error(`❌ Error updating device name: ${error.message}`);
      throw error;
    }
  }

  @Delete(':id')
  async deleteDevice(@Param('id') id: string, @Req() req) {
    this.logger.log(`🗑️ DELETE device ${id} for user ${req.user.id}`);
    try {
      return this.deviceService.deleteDevice(BigInt(id), req.user.id);
    } catch (error) {
      this.logger.error(`❌ Error deleting device: ${error.message}`);
      throw error;
    }
  }
}