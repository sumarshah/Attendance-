import { IsIn, IsNumber, IsOptional, IsString, IsUUID } from 'class-validator';

export class IngestPunchDto {
  @IsOptional()
  @IsUUID()
  projectId?: string;

  @IsOptional()
  @IsUUID()
  busId?: string;

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

  @IsOptional()
  @IsString()
  deviceId?: string;

  @IsOptional()
  @IsString()
  employeeCode?: string;

  @IsOptional()
  @IsIn(['FACE_ID', 'FINGER_ID'])
  identifierType?: 'FACE_ID' | 'FINGER_ID';

  @IsOptional()
  @IsString()
  identifierValue?: string;
}

