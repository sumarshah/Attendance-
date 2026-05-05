import { IsBoolean, IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateDeviceDto {
  @IsString()
  deviceId: string;

  @IsString()
  deviceName: string;

  @IsString()
  deviceType: string;

  @IsUUID()
  busId: string;

  @IsOptional()
  @IsBoolean()
  status?: boolean;
}

