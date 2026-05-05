import { IsOptional, IsString } from 'class-validator';

export class CreateBusDto {
  @IsString()
  busCode: string;

  @IsString()
  plateNumber: string;

  @IsOptional()
  @IsString()
  driverName?: string;
}
