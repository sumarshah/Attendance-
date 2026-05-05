import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { ExceptionsService } from './exceptions.service';
import { ResolveExceptionDto } from './dto/resolve-exception.dto';
import { RequirePermissions } from '../auth/permissions.decorator';

@RequirePermissions('EXCEPTIONS')
@Controller('exceptions')
export class ExceptionsController {
  constructor(private readonly exceptionsService: ExceptionsService) {}

  @Get()
  findAll(
    @Query('resolved') resolved?: string,
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string,
    @Query('deviceId') deviceId?: string,
    @Query('employeeId') employeeId?: string,
    @Query('projectId') projectId?: string,
    @Query('busId') busId?: string,
    @Query('reason') reason?: string,
  ) {
    return this.exceptionsService.findAll({
      resolved:
        resolved == null
          ? undefined
          : resolved === 'true' || resolved === '1',
      dateFrom,
      dateTo,
      deviceId,
      employeeId,
      projectId,
      busId,
      reason,
    });
  }

  @Post(':id/resolve')
  resolve(@Param('id') id: string, @Body() body: ResolveExceptionDto) {
    return this.exceptionsService.resolve(id, body.note);
  }
}
