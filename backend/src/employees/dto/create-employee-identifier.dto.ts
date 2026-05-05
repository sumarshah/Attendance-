import { IsIn, IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateEmployeeIdentifierDto {
  @IsIn(['FACE_ID', 'FINGER_ID'])
  identifierType: 'FACE_ID' | 'FINGER_ID';

  @IsString()
  identifierValue: string;

  @IsOptional()
  @IsString()
  vendor?: string;

  // Optional: bind identifier to a specific device record (Device.id in DB)
  @IsOptional()
  @IsUUID()
  deviceDbId?: string;
}
