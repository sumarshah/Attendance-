import { Module } from '@nestjs/common';
import { AttendanceModule } from '../attendance/attendance.module';
import { DeviceAttendanceController } from './device-attendance.controller';
import { DeviceAttendanceService } from './device-attendance.service';

@Module({
  imports: [AttendanceModule],
  controllers: [DeviceAttendanceController],
  providers: [DeviceAttendanceService],
})
export class DeviceAttendanceModule {}
