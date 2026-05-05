import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { CreateDeviceDto } from './dto/create-device.dto';
import { DevicesService } from './devices.service';
import { RequirePermissions } from '../auth/permissions.decorator';

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

  @Post(':id/rotate-key')
  rotateKey(@Param('id') id: string) {
    return this.devicesService.rotateKey(id);
  }
}
