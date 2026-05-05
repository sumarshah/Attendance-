import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { AttendanceService } from './attendance.service';
import { CreateAttendanceDto } from './dto/create-attendance.dto';
import { RequirePermissions } from '../auth/permissions.decorator';

@RequirePermissions('ATTENDANCE')
@Controller('attendance')
export class AttendanceController {
  constructor(private readonly attendanceService: AttendanceService) {}

  @Get()
  findAll(
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string,
    @Query('employeeId') employeeId?: string,
    @Query('projectId') projectId?: string,
    @Query('take') take?: string,
  ) {
    const limitRaw = take ? Number.parseInt(take, 10) : undefined;
    const limit =
      Number.isFinite(limitRaw) && limitRaw! > 0
        ? Math.min(limitRaw!, 2000)
        : undefined;

    return this.attendanceService.findAll({
      dateFrom,
      dateTo,
      employeeId,
      projectId,
      take: limit,
    });
  }

  @Post()
  create(@Body() body: CreateAttendanceDto) {
    return this.attendanceService.create(body);
  }
}
