import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { CreateDeviceDto } from './dto/create-device.dto';
import { DevicesService } from './devices.service';
import { RequirePermissions } from '../auth/permissions.decorator';
import { UpdateDeviceDto } from './dto/update-device.dto';

@RequirePermissions('DEVICES')
@Controller('devices')
export class DevicesController {
  constructor(private readonly devicesService: DevicesService) {}

  @Get()
  findAll() {
    return this.devicesService.findAll();
  }

  @Post()
  create(@Body() body: CreateDeviceDto) {
    return this.devicesService.create(body);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() body: UpdateDeviceDto) {
    return this.devicesService.update(id, body);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.devicesService.remove(id);
  }

  @Post(':id/rotate-key')
  rotateKey(@Param('id') id: string) {
    return this.devicesService.rotateKey(id);
  }

  @Post(':id/test-connection')
  testConnection(@Param('id') id: string) {
    return this.devicesService.testConnection(id);
  }
}
