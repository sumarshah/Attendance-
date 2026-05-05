import { Module } from '@nestjs/common';
import { AttendanceModule } from '../attendance/attendance.module';
import { IngestController } from './ingest.controller';
import { IngestService } from './ingest.service';

@Module({
  imports: [AttendanceModule],
  controllers: [IngestController],
  providers: [IngestService],
})
export class IngestModule {}

