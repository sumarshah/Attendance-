import { IsEmail, IsIn, IsOptional, IsString, MinLength } from 'class-validator';

export class RegisterDto {
  @IsEmail()
  email: string;

  @IsString()
  name: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsOptional()
  @IsString()
  @IsIn(['USER', 'STAFF', 'SUPERVISOR', 'HR', 'ADMIN'])
  role?: string;
}
