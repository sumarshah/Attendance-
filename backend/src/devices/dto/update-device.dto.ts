import { IsBoolean, IsOptional, IsString, IsUUID } from 'class-validator';

export class UpdateDeviceDto {
  @IsOptional()
  @IsString()
  deviceId?: string;

  @IsOptional()
  @IsString()
  deviceName?: string;

  @IsOptional()
  @IsString()
  deviceType?: string;

  @IsOptional()
  @IsUUID()
  busId?: string;

  @IsOptional()
  @IsBoolean()
  status?: boolean;
}

