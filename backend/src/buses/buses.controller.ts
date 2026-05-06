import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { BusesService } from './buses.service';
import { CreateBusDto } from './dto/create-bus.dto';
import { RequirePermissions } from '../auth/permissions.decorator';
import { UpdateBusDto } from './dto/update-bus.dto';

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

  @Patch(':id')
  update(@Param('id') id: string, @Body() body: UpdateBusDto) {
    return this.busesService.update(id, body);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.busesService.remove(id);
  }
}
