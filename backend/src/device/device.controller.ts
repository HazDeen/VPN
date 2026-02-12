import { Controller, Get, Post, Body, Param, Delete, Put, Req, UseGuards } from '@nestjs/common';
import { DeviceService } from './device.service';
import { CreateDeviceDto } from './dto/create-device.dto';
import { TelegramGuard } from '../auth/guards/telegram/telegram.guard'; // 👈 ЗАКОММЕНТИРУЙ

@Controller('devices')
@UseGuards(TelegramGuard) // 👈 ЗАКОММЕНТИРУЙ
export class DeviceController {
  constructor(private readonly deviceService: DeviceService) {}

  @Get()
  async getUserDevices(@Req() req) {
    // Тестовый пользователь с ID 1
    return this.deviceService.getUserDevices(BigInt(1));
  }

  @Post()
  async addDevice(@Req() req, @Body() dto: CreateDeviceDto) {
    return this.deviceService.addDevice(BigInt(1), dto);
  }

  @Post(':id/replace')
  async replaceDevice(@Param('id') id: string, @Req() req) {
    return this.deviceService.replaceDevice(BigInt(id), BigInt(1));
  }

  @Put(':id/name')
  async updateDeviceName(
    @Param('id') id: string,
    @Body('customName') customName: string,
    @Req() req,
  ) {
    return this.deviceService.updateDeviceName(BigInt(id), BigInt(1), customName);
  }

  @Delete(':id')
  async deleteDevice(@Param('id') id: string, @Req() req) {
    return this.deviceService.deleteDevice(BigInt(id), BigInt(1));
  }
}