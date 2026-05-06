import { IsIn, IsOptional, IsString } from 'class-validator';

const ROLES = ['USER', 'STAFF', 'SUPERVISOR', 'HR', 'ADMIN'] as const;

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  email?: string;

  @IsOptional()
  @IsIn(ROLES as unknown as string[])
  role?: (typeof ROLES)[number];
}

