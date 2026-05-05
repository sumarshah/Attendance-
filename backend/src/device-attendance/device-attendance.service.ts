import { BadRequestException, Injectable } from '@nestjs/common';
import { createHash } from 'crypto';
import { AttendanceService } from '../attendance/attendance.service';
import { PrismaService } from '../prisma/prisma.service';
import { DeviceAttendanceBatchDto, DeviceAttendancePunchDto } from './device-attendance.dto';

@Injectable()
export class DeviceAttendanceService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly attendanceService: AttendanceService,
  ) {}

  private hashKey(key: string) {
    return createHash('sha256').update(key).digest('hex');
  }

  private extractErrorMessage(error: unknown): string {
    if (error && typeof error === 'object') {
      const anyErr = error as any;
      const respMessage = anyErr?.response?.message;
      if (Array.isArray(respMessage)) return respMessage.join(', ');
      if (typeof respMessage === 'string') return respMessage;
      if (typeof anyErr?.message === 'string') return anyErr.message;
    }
    return 'Unknown error';
  }

  private mapReason(message: string) {
    const m = message.toLowerCase();

    if (m.includes('duplicate')) return 'DUPLICATE_PUNCH' as const;
    if (m.includes('out punch is not allowed before in')) return 'OUT_BEFORE_IN' as const;
    if (m.includes('no active allocation')) return 'NO_ALLOCATION' as const;
    if (m.includes('allocated to this project')) return 'NO_ALLOCATION' as const;
    if (m.includes('outside project geofence')) return 'OUTSIDE_GEOFENCE' as const;
    if (m.includes('location is required')) return 'LOCATION_REQUIRED' as const;
    if (m.includes('employee is not active')) return 'EMPLOYEE_INACTIVE' as const;
    if (m.includes('employee not found')) return 'EMPLOYEE_NOT_FOUND' as const;
    if (m.includes('project not found')) return 'PROJECT_NOT_FOUND' as const;
    if (m.includes('device is not registered or inactive')) return 'DEVICE_INACTIVE' as const;
    if (m.includes('missing x-device-key')) return 'MISSING_DEVICE_KEY' as const;
    if (m.includes('invalid device key') || m.includes('invalid x-device-key')) return 'INVALID_DEVICE_KEY' as const;
    if (m.includes('multiple allocations')) return 'MULTIPLE_ALLOCATIONS' as const;
    if (m.includes('provide employeeid')) return 'INVALID_REQUEST' as const;
    if (m.includes('identifiertype must be')) return 'INVALID_REQUEST' as const;

    return 'OTHER' as const;
  }

  private async logException(args: {
    dto: DeviceAttendancePunchDto;
    message: string;
    reason: ReturnType<DeviceAttendanceService['mapReason']>;
    deviceDbId?: string;
    employeeId?: string;
    projectId?: string;
    busId?: string;
  }) {
    try {
      await this.prisma.attendanceException.create({
        data: {
          source: 'DEVICE',
          reason: args.reason,
          message: args.message,
          rawPayload: args.dto as any,

          deviceDbId: args.deviceDbId ?? null,
          deviceId: args.dto.deviceId ?? null,
          employeeId: args.employeeId ?? null,
          projectId: args.projectId ?? args.dto.projectId ?? null,
          busId: args.busId ?? null,

          punchType: args.dto.punchType as any,
          authMethod: args.dto.authMethod as any,
          authScore: args.dto.authScore ?? null,
          liveness: args.dto.liveness ?? null,

          identifierType: (args.dto.identifierType as any) ?? null,
          identifierValue: args.dto.identifierValue ?? null,

          punchedAt: args.dto.punchedAt ? new Date(args.dto.punchedAt) : null,
          latitude: args.dto.latitude ?? null,
          longitude: args.dto.longitude ?? null,
        },
      });
    } catch {
      // Best-effort logging; never break the punch API because exception logging failed.
    }
  }

  async punch(dto: DeviceAttendancePunchDto, deviceKey?: string) {
    let deviceDbId: string | undefined;
    let busId: string | undefined;
    let resolvedEmployeeId: string | undefined;
    let resolvedProjectId: string | undefined;

    try {
      const device = await this.prisma.device.findUnique({
        where: { deviceId: dto.deviceId },
      });

      if (!device || device.status !== true) {
        throw new BadRequestException('Device is not registered or inactive');
      }

      deviceDbId = device.id;
      busId = device.busId;

      if (device.apiKeyHash) {
        const trimmed = deviceKey?.trim();
        if (!trimmed) {
          throw new BadRequestException('Missing x-device-key (device key required)');
        }
        const incomingHash = this.hashKey(trimmed);
        if (incomingHash !== device.apiKeyHash) {
          throw new BadRequestException('Invalid x-device-key');
        }
      }

      const identifierType = dto.identifierType;
      const identifierValue = dto.identifierValue?.trim();

      const biometricOnly =
        (process.env.DEVICE_PUNCH_MODE ?? 'BIOMETRIC_ONLY') === 'BIOMETRIC_ONLY';

      if (identifierType && identifierValue) {
        const expectedIdentifierType =
          dto.authMethod === 'FACE' ? 'FACE_ID' : 'FINGER_ID';

        if (identifierType !== expectedIdentifierType) {
          throw new BadRequestException(
            `identifierType must be ${expectedIdentifierType} when authMethod is ${dto.authMethod}`,
          );
        }
      }

      if (biometricOnly) {
        if (!(identifierType && identifierValue)) {
          throw new BadRequestException(
            'Biometric identifier is required (identifierType + identifierValue)',
          );
        }
      } else {
        const employeeId = dto.employeeId?.trim();
        const employeeCode = dto.employeeCode?.trim();
        if (!employeeId && !employeeCode && !(identifierType && identifierValue)) {
          throw new BadRequestException(
            'Provide employeeId, employeeCode, or (identifierType + identifierValue)',
          );
        }
      }

      const employeeId = dto.employeeId?.trim();
      const employeeCode = dto.employeeCode?.trim();

      const employee = employeeId
        ? await this.prisma.employee.findUnique({ where: { id: employeeId } })
        : employeeCode
          ? await this.prisma.employee.findUnique({
              where: { employeeCode },
            })
          : await this.prisma.employeeIdentifier
              .findFirst({
                where: {
                  identifierType,
                  identifierValue: identifierValue as string,
                  // If device-specific mapping exists, prefer matching on this device.
                  OR: [{ deviceDbId: device.id }, { deviceDbId: null }],
                },
                include: {
                  employee: true,
                },
                orderBy: {
                  createdAt: 'desc',
                },
              })
              .then((row) => row?.employee ?? null);

      if (!employee) {
        throw new BadRequestException('Employee not found');
      }

      resolvedEmployeeId = employee.id;

      const candidateAllocations = await this.prisma.allocation.findMany({
        where: {
          employeeId: employee.id,
          isActive: true,
          busId: device.busId,
          ...(dto.projectId ? { projectId: dto.projectId } : {}),
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      if (candidateAllocations.length === 0) {
        throw new BadRequestException(
          'No active allocation found for this employee on this bus',
        );
      }

      if (!dto.projectId && candidateAllocations.length > 1) {
        throw new BadRequestException(
          'Multiple allocations found; projectId is required',
        );
      }

      const allocation = candidateAllocations[0];
      resolvedProjectId = allocation.projectId;
      busId = allocation.busId ?? device.busId;

      await this.prisma.device.update({
        where: { id: device.id },
        data: { lastSeenAt: new Date() },
      });

      return this.attendanceService.create({
        employeeId: employee.id,
        projectId: allocation.projectId,
        busId: allocation.busId ?? device.busId,
        punchType: dto.punchType,
        authMethod: dto.authMethod,
        authScore: dto.authScore,
        liveness: dto.liveness,
        punchedAt: dto.punchedAt,
        latitude: dto.latitude,
        longitude: dto.longitude,
        deviceId: dto.deviceId,
        notes: dto.notes,
      });
    } catch (error) {
      const message = this.extractErrorMessage(error);
      const reason = this.mapReason(message);
      await this.logException({
        dto,
        message,
        reason,
        deviceDbId,
        employeeId: resolvedEmployeeId,
        projectId: resolvedProjectId,
        busId,
      });
      throw error;
    }
  }

  async batch(dto: DeviceAttendanceBatchDto, deviceKey?: string) {
    if (!dto?.punches || !Array.isArray(dto.punches) || dto.punches.length === 0) {
      throw new BadRequestException('punches array is required');
    }

    const results: Array<{
      index: number;
      ok: boolean;
      data?: unknown;
      error?: string;
    }> = [];

      for (let index = 0; index < dto.punches.length; index += 1) {
        const punch = dto.punches[index];
        try {
          const data = await this.punch(punch, deviceKey);
          results.push({ index, ok: true, data });
        } catch (error) {
          const message = this.extractErrorMessage(error);
          results.push({
            index,
            ok: false,
            error: message,
          });
        }
      }

    return {
      count: dto.punches.length,
      ok: results.filter((r) => r.ok).length,
      failed: results.filter((r) => !r.ok).length,
      results,
    };
  }
}
