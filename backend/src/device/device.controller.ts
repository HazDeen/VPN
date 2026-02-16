import { Controller, Get, Post, Body, Param, Delete, Headers, UnauthorizedException } from '@nestjs/common';
import { DeviceService } from './device.service';

@Controller('devices')
export class DeviceController {
  constructor(private readonly deviceService: DeviceService) {}

  @Get()
  async getUserDevices(@Headers('x-username') username: string) {
    if (!username) throw new UnauthorizedException('Username required');
    return this.deviceService.getUserDevicesByUsername(username);
  }

  @Post()
  async addDevice(
    @Headers('x-username') username: string,
    @Body() body: any
  ) {
    if (!username) throw new UnauthorizedException('Username required');
    return this.deviceService.addDeviceByUsername(username, body);
  }

  @Delete(':id')
  async deleteDevice(
    @Headers('x-username') username: string,
    @Param('id') id: string
  ) {
    if (!username) throw new UnauthorizedException('Username required');
    return this.deviceService.deleteDeviceByUsername(parseInt(id), username);
  }
}