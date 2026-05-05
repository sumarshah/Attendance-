import { IsOptional, IsString } from 'class-validator';

export class ResolveExceptionDto {
  @IsOptional()
  @IsString()
  note?: string;
}

