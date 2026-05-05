import { IsBoolean, IsIn, IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateConnectorDto {
  @IsString()
  name: string;

  @IsIn([
    'GENERIC_WEBHOOK',
    'ZKTECO_ADMS',
    'ZKTECO_PULL',
    'HIKVISION_ISAPI',
    'BIOTIME_API',
    'ANDROID_TABLET',
  ])
  type:
    | 'GENERIC_WEBHOOK'
    | 'ZKTECO_ADMS'
    | 'ZKTECO_PULL'
    | 'HIKVISION_ISAPI'
    | 'BIOTIME_API'
    | 'ANDROID_TABLET';

  @IsOptional()
  @IsBoolean()
  status?: boolean;

  // Optional defaults applied to ingested punches.
  @IsOptional()
  @IsUUID()
  defaultProjectId?: string;

  @IsOptional()
  @IsUUID()
  defaultBusId?: string;

  // Allow employeeCode fallback for devices that cannot send identifiers.
  @IsOptional()
  @IsBoolean()
  allowEmployeeCode?: boolean;
}

