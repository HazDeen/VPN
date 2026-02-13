import { Controller, Get, Post, Body, Param, Delete } from '@nestjs/common';
import { DeviceService } from './device.service';

@Controller('devices')
export class DeviceController {
  constructor(private readonly deviceService: DeviceService) {}

  @Get()
  async getUserDevices() {
    return this.deviceService.getUserDevices(1); // 👈 number
  }

  @Post()
  async addDevice(@Body() body: any) {
    return this.deviceService.addDevice(1, body); // 👈 number
  }

  @Delete(':id')
  async deleteDevice(@Param('id') id: string) {
    return this.deviceService.deleteDevice(parseInt(id), 1); // 👈 number
  }
}