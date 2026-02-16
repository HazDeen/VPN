import { Controller, Get, Post, Body, Param, Delete, Req, UseGuards } from '@nestjs/common';
import { DeviceService } from './device.service';
import { AuthGuard } from '../auth/guards/auth.guard';

@Controller('devices')
@UseGuards(AuthGuard)
export class DeviceController {
  constructor(private readonly deviceService: DeviceService) {}

  @Get()
  async getUserDevices(@Req() req) {
    return this.deviceService.getUserDevices(req.user.id);
  }

  @Post()
  async addDevice(@Req() req, @Body() body: any) {
    return this.deviceService.addDevice(req.user.id, body);
  }

  @Delete(':id')
  async deleteDevice(@Req() req, @Param('id') id: string) {
    return this.deviceService.deleteDevice(parseInt(id), req.user.id);
  }
}