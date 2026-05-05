import { SetMetadata } from '@nestjs/common';

export const PERMISSIONS_KEY = 'permissions_required';

export type PermissionKey =
  | 'DASHBOARD'
  | 'REALTIME_MONITOR'
  | 'TIMESHEET'
  | 'TIMESHEETS'
  | 'EMPLOYEES'
  | 'ATTENDANCE'
  | 'PROJECTS'
  | 'BUSES'
  | 'DEVICES'
  | 'ALLOCATIONS'
  | 'EXCEPTIONS'
  | 'CORRECTIONS'
  | 'SETTINGS'
  | 'ADMIN_ACCESS';

export const RequirePermissions = (...permissions: PermissionKey[]) =>
  SetMetadata(PERMISSIONS_KEY, permissions);
