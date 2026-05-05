import { IsOptional, IsString } from 'class-validator';

export class CreateEmployeeDto {
  @IsString()
  employeeCode: string;

  @IsString()
  fullName: string;

  @IsOptional()
  @IsString()
  phone?: string;
}
