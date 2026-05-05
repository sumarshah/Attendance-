import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { EmployeesService } from './employees.service';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { CreateEmployeeIdentifierDto } from './dto/create-employee-identifier.dto';
import { RequirePermissions } from '../auth/permissions.decorator';

@RequirePermissions('EMPLOYEES')
@Controller('employees')
export class EmployeesController {
  constructor(private readonly employeesService: EmployeesService) {}

  @Get()
  findAll() {
    return this.employeesService.findAll();
  }

  @Post()
  create(@Body() body: CreateEmployeeDto) {
    return this.employeesService.create(body);
  }

  @Get(':id/identifiers')
  listIdentifiers(@Param('id') id: string) {
    return this.employeesService.listIdentifiers(id);
  }

  @Post(':id/identifiers')
  addIdentifier(
    @Param('id') id: string,
    @Body() body: CreateEmployeeIdentifierDto,
  ) {
    return this.employeesService.addIdentifier(id, body);
  }
}
