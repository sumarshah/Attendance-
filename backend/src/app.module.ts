import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { EmployeesModule } from './employees/employees.module';
import { PrismaModule } from './prisma/prisma.module';
import { ProjectsModule } from './projects/projects.module';
import { BusesModule } from './buses/buses.module';
import { AllocationsModule } from './allocations/allocations.module';
import { AttendanceModule } from './attendance/attendance.module';
import { DeviceAttendanceModule } from './device-attendance/device-attendance.module';
import { DevicesModule } from './devices/devices.module';
import { ExceptionsModule } from './exceptions/exceptions.module';
import { AuthModule } from './auth/auth.module';
import { TimesheetsModule } from './timesheets/timesheets.module';
import { ConnectorsModule } from './connectors/connectors.module';
import { IngestModule } from './ingest/ingest.module';
import { CorrectionsModule } from './corrections/corrections.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    AuthModule,
    PrismaModule,
    EmployeesModule,
    ProjectsModule,
    BusesModule,
    AllocationsModule,
    AttendanceModule,
    DeviceAttendanceModule,
    DevicesModule,
    ExceptionsModule,
    CorrectionsModule,
    TimesheetsModule,
    ConnectorsModule,
    IngestModule,
    UsersModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
