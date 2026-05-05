import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { CreateConnectorDto } from './dto/create-connector.dto';
import { ConnectorsService } from './connectors.service';
import { RequirePermissions } from '../auth/permissions.decorator';

@RequirePermissions('ADMIN_ACCESS')
@Controller('connectors')
export class ConnectorsController {
  constructor(private readonly connectorsService: ConnectorsService) {}

  @Get()
  findAll() {
    return this.connectorsService.findAll();
  }

  @Post()
  create(@Body() body: CreateConnectorDto) {
    return this.connectorsService.create(body);
  }

  @Post(':id/rotate-key')
  rotateKey(@Param('id') id: string) {
    return this.connectorsService.rotateKey(id);
  }
}
