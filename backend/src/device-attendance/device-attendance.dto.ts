import {
  IsArray,
  IsIn,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class DeviceAttendancePunchDto {
  @IsString()
  deviceId: string;

  @IsOptional()
  @IsUUID()
  employeeId?: string;

  @IsOptional()
  @IsString()
  employeeCode?: string;

  @IsOptional()
  @IsIn(['FACE_ID', 'FINGER_ID'])
  identifierType?: 'FACE_ID' | 'FINGER_ID';

  @IsOptional()
  @IsString()
  identifierValue?: string;

  @IsOptional()
  @IsUUID()
  projectId?: string;

  @IsIn(['IN', 'OUT'])
  punchType: 'IN' | 'OUT';

  @IsIn(['FACE', 'FINGER'])
  authMethod: 'FACE' | 'FINGER';

  @IsOptional()
  @IsNumber()
  authScore?: number;

  @IsOptional()
  @IsNumber()
  liveness?: number;

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
  notes?: string;
}

export class DeviceAttendanceBatchDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => DeviceAttendancePunchDto)
  punches: DeviceAttendancePunchDto[];
}
