import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AttendanceService {
  constructor(private readonly prisma: PrismaService) {}

  private readonly punchSelect = {
    id: true,
    punchType: true,
    punchedAt: true,
    latitude: true,
    longitude: true,
    deviceId: true,
    notes: true,
    employee: { select: { employeeCode: true, fullName: true } },
    project: { select: { projectCode: true, projectName: true } },
    bus: { select: { busCode: true, plateNumber: true } },
  } as const;

  findAll(opts?: {
    dateFrom?: string;
    dateTo?: string;
    employeeId?: string;
    projectId?: string;
    take?: number;
  }) {
    const where: any = {};

    if (opts?.employeeId) where.employeeId = opts.employeeId;
    if (opts?.projectId) where.projectId = opts.projectId;

    if (opts?.dateFrom || opts?.dateTo) {
      const range: any = {};
      if (opts.dateFrom) {
        const d = new Date(opts.dateFrom);
        if (Number.isNaN(d.getTime())) throw new BadRequestException('Invalid dateFrom');
        range.gte = d;
      }
      if (opts.dateTo) {
        const d = new Date(opts.dateTo);
        if (Number.isNaN(d.getTime())) throw new BadRequestException('Invalid dateTo');
        range.lte = d;
      }
      where.punchedAt = range;
    }

    const take = opts?.take && opts.take > 0 ? opts.take : 200;

    return this.prisma.attendancePunch.findMany({
      select: this.punchSelect,
      orderBy: {
        punchedAt: 'desc',
      },
      where,
      take,
    });
  }

  private toRadians(value: number) {
    return (value * Math.PI) / 180;
  }

  private getDistanceInMeters(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number,
  ) {
    const earthRadius = 6371000;
    const dLat = this.toRadians(lat2 - lat1);
    const dLon = this.toRadians(lon2 - lon1);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRadians(lat1)) *
        Math.cos(this.toRadians(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return earthRadius * c;
  }

  async create(data: {
    employeeId: string;
    projectId: string;
    busId?: string;
    punchType: 'IN' | 'OUT';
    authMethod?: 'FACE' | 'FINGER';
    authScore?: number;
    liveness?: number;
    punchedAt?: string;
    latitude?: number;
    longitude?: number;
    deviceId?: string;
    notes?: string;
  }) {
    const employee = await this.prisma.employee.findUnique({
      where: { id: data.employeeId },
    });

    if (!employee || employee.status !== 'ACTIVE') {
      throw new BadRequestException('Employee is not active');
    }

    const project = await this.prisma.project.findUnique({
      where: { id: data.projectId },
    });

    if (!project) {
      throw new BadRequestException('Project not found');
    }

    const allocation = await this.prisma.allocation.findFirst({
      where: {
        employeeId: data.employeeId,
        projectId: data.projectId,
        isActive: true,
        ...(data.busId ? { busId: data.busId } : {}),
      },
    });

    if (!allocation) {
      throw new BadRequestException(
        'Employee is not allocated to this project/bus',
      );
    }

    const punchTime = data.punchedAt ? new Date(data.punchedAt) : new Date();

    const dayStart = new Date(punchTime);
    dayStart.setHours(0, 0, 0, 0);

    const dayEnd = new Date(punchTime);
    dayEnd.setHours(23, 59, 59, 999);

    const existingSameTypePunch = await this.prisma.attendancePunch.findFirst({
      where: {
        employeeId: data.employeeId,
        projectId: data.projectId,
        punchType: data.punchType,
        punchedAt: {
          gte: dayStart,
          lte: dayEnd,
        },
      },
      orderBy: {
        punchedAt: 'desc',
      },
    });

    if (existingSameTypePunch) {
      throw new BadRequestException(
        `Duplicate ${data.punchType} punch is not allowed for the same day`,
      );
    }

    if (data.punchType === 'OUT') {
      const existingInPunch = await this.prisma.attendancePunch.findFirst({
        where: {
          employeeId: data.employeeId,
          projectId: data.projectId,
          punchType: 'IN',
          punchedAt: {
            gte: dayStart,
            lte: dayEnd,
          },
        },
      });

      if (!existingInPunch) {
        throw new BadRequestException(
          'OUT punch is not allowed before IN punch for the same day',
        );
      }
    }

    if (
      project.latitude !== null &&
      project.longitude !== null &&
      project.geofenceRadius !== null
    ) {
      if (data.latitude == null || data.longitude == null) {
        throw new BadRequestException(
          'Location is required for geofence validation',
        );
      }

      const distance = this.getDistanceInMeters(
        project.latitude,
        project.longitude,
        data.latitude,
        data.longitude,
      );

      if (distance > project.geofenceRadius) {
        throw new BadRequestException(
          `Punch location is outside project geofence. Distance: ${Math.round(distance)} meters`,
        );
      }
    }

    return this.prisma.attendancePunch.create({
      data: {
        employeeId: data.employeeId,
        projectId: data.projectId,
        busId: data.busId,
        punchType: data.punchType,
        authMethod: data.authMethod,
        authScore: data.authScore,
        liveness: data.liveness,
        punchedAt: punchTime,
        latitude: data.latitude,
        longitude: data.longitude,
        deviceId: data.deviceId,
        notes: data.notes,
      },
      select: this.punchSelect,
    });
  }
}
