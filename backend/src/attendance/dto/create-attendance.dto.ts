import {
  IsIn,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

export class CreateAttendanceDto {
  @IsUUID()
  employeeId: string;

  @IsUUID()
  projectId: string;

  @IsOptional()
  @IsUUID()
  busId?: string;

  @IsIn(['IN', 'OUT'])
  punchType: 'IN' | 'OUT';

  @IsOptional()
  @IsString()
  punchedAt?: string;

  @IsOptional()
  @IsNumber()
  latitude?: number;

  @IsOptional()
  @IsNumber()
  longitude?: number;

  @IsOptional()
  @IsString()
  deviceId?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}
