import { BadRequestException, Controller, Get, Header, Query } from '@nestjs/common';
import { TimesheetsService } from './timesheets.service';
import { RequirePermissions } from '../auth/permissions.decorator';

function requireIsoDay(date?: string) {
  if (!date) throw new BadRequestException('date is required (YYYY-MM-DD)');
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    throw new BadRequestException('date must be YYYY-MM-DD');
  }
  return date;
}

@RequirePermissions('TIMESHEETS')
@Controller('timesheets')
export class TimesheetsController {
  constructor(private readonly timesheetsService: TimesheetsService) {}

  @Get('daily')
  daily(
    @Query('date') date?: string,
    @Query('projectId') projectId?: string,
    @Query('busId') busId?: string,
  ) {
    return this.timesheetsService.daily({
      date: requireIsoDay(date),
      projectId,
      busId,
    });
  }

  @Get('daily.csv')
  @Header('Content-Type', 'text/csv; charset=utf-8')
  dailyCsv(
    @Query('date') date?: string,
    @Query('projectId') projectId?: string,
    @Query('busId') busId?: string,
  ) {
    return this.timesheetsService.dailyCsv({
      date: requireIsoDay(date),
      projectId,
      busId,
    });
  }
}
