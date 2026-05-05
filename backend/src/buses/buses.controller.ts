import { Body, Controller, Get, Post } from '@nestjs/common';
import { BusesService } from './buses.service';
import { CreateBusDto } from './dto/create-bus.dto';
import { RequirePermissions } from '../auth/permissions.decorator';

@RequirePermissions('BUSES')
@Controller('buses')
export class BusesController {
  constructor(private readonly busesService: BusesService) {}

  @Get()
  findAll() {
    return this.busesService.findAll();
  }

  @Post()
  create(@Body() body: CreateBusDto) {
    return this.busesService.create(body);
  }
}
