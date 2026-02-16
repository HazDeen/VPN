import { Controller, Get, Put, Param, Body, UseGuards } from '@nestjs/common';
import { AdminService } from './admin.service';
import { AdminGuard } from './guards/admin.guard';

@Controller('admin')
@UseGuards(AdminGuard) // 👈 ТОЛЬКО ДЛЯ АДМИНОВ!
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('users')
  async getAllUsers() {
    return this.adminService.getAllUsers();
  }

  @Get('users/:userId/devices')
  async getUserDevices(@Param('userId') userId: string) {
    return this.adminService.getUserDevices(parseInt(userId));
  }

  @Put('users/:userId/balance')
  async updateUserBalance(
    @Param('userId') userId: string,
    @Body() body: { balance: number }
  ) {
    return this.adminService.updateUserBalance(parseInt(userId), body.balance);
  }

  @Put('users/:userId/admin')
  async setAdminStatus(
    @Param('userId') userId: string,
    @Body() body: { isAdmin: boolean }
  ) {
    return this.adminService.setAdminStatus(parseInt(userId), body.isAdmin);
  }
}