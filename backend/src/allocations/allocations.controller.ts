import { Body, Controller, Get, Post } from '@nestjs/common';
import { AllocationsService } from './allocations.service';
import { CreateAllocationDto } from './dto/create-allocation.dto';
import { RequirePermissions } from '../auth/permissions.decorator';

@RequirePermissions('ALLOCATIONS')
@Controller('allocations')
export class AllocationsController {
  constructor(private readonly allocationsService: AllocationsService) {}

  @Get()
  findAll() {
    return this.allocationsService.findAll();
  }

  @Post()
  create(@Body() body: CreateAllocationDto) {
    return this.allocationsService.create(body);
  }
}
