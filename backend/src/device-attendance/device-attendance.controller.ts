import { Body, Controller, Headers, Post } from '@nestjs/common';
import { DeviceAttendanceBatchDto, DeviceAttendancePunchDto } from './device-attendance.dto';
import { DeviceAttendanceService } from './device-attendance.service';
import { Public } from '../auth/public.decorator';

@Controller('device-attendance')
export class DeviceAttendanceController {
  constructor(private readonly deviceAttendanceService: DeviceAttendanceService) {}

  @Public()
  @Post('punch')
  punch(
    @Body() body: DeviceAttendancePunchDto,
    @Headers('x-device-key') deviceKey?: string,
  ) {
    return this.deviceAttendanceService.punch(body, deviceKey);
  }

  @Public()
  @Post('batch')
  batch(
    @Body() body: DeviceAttendanceBatchDto,
    @Headers('x-device-key') deviceKey?: string,
  ) {
    return this.deviceAttendanceService.batch(body, deviceKey);
  }
}
