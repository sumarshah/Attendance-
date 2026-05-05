import { IsBoolean, IsDateString, IsOptional, IsUUID } from 'class-validator';

export class CreateAllocationDto {
  @IsUUID()
  employeeId: string;

  @IsUUID()
  projectId: string;

  @IsOptional()
  @IsUUID()
  busId?: string;

  @IsDateString()
  startDate: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
