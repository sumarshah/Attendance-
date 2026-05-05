import { IsISO8601, IsOptional, IsString, IsUUID, Length } from 'class-validator';

export class CreateCorrectionDto {
  @IsUUID()
  employeeId!: string;

  @IsUUID()
  projectId!: string;

  @IsOptional()
  @IsUUID()
  busId?: string;

  @IsISO8601()
  date!: string;

  @IsOptional()
  @IsISO8601()
  requestedInAt?: string;

  @IsOptional()
  @IsISO8601()
  requestedOutAt?: string;

  @IsString()
  @Length(3, 500)
  reason!: string;
}

