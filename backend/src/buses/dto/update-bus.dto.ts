import { IsOptional, IsString } from 'class-validator';

export class UpdateBusDto {
  @IsOptional()
  @IsString()
  busCode?: string;

  @IsOptional()
  @IsString()
  plateNumber?: string;

  @IsOptional()
  @IsString()
  driverName?: string;
}

