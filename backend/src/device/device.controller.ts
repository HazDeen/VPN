import { Controller, Get, Post, Put, Delete, Body, Param, Headers, UnauthorizedException } from '@nestjs/common'; // 👈 ДОБАВИЛИ Put
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

  // ✅ ИСПРАВЛЕННЫЙ МЕТОД ДЛЯ ЗАМЕНЫ ССЫЛКИ
  @Post(':id/replace')
  async replaceDevice(
    @Headers('x-username') username: string,
    @Param('id') id: string
  ) {
    if (!username) throw new UnauthorizedException('Username required');
    return this.deviceService.replaceDeviceByUsername(parseInt(id), username);
  }

  // ✅ ИСПРАВЛЕННЫЙ МЕТОД ДЛЯ ОБНОВЛЕНИЯ ИМЕНИ
  @Put(':id/name')
  async updateDeviceName(
    @Headers('x-username') username: string,
    @Param('id') id: string,
    @Body('customName') customName: string
  ) {
    if (!username) throw new UnauthorizedException('Username required');
    if (!customName) throw new UnauthorizedException('customName required');
    return this.deviceService.updateDeviceNameByUsername(parseInt(id), username, customName);
  }
}