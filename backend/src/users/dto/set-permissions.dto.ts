import { ArrayUnique, IsArray, IsIn } from 'class-validator';

const ALLOWED = [
  'DASHBOARD',
  'REALTIME_MONITOR',
  'TIMESHEET',
  'TIMESHEETS',
  'EMPLOYEES',
  'ATTENDANCE',
  'PROJECTS',
  'BUSES',
  'DEVICES',
  'ALLOCATIONS',
  'EXCEPTIONS',
  'CORRECTIONS',
  'SETTINGS',
  'ADMIN_ACCESS',
] as const;

export class SetPermissionsDto {
  @IsArray()
  @ArrayUnique()
  @IsIn(ALLOWED as unknown as string[], { each: true })
  permissions!: string[];
}
