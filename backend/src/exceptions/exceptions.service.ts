import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ExceptionsService {
  constructor(private readonly prisma: PrismaService) {}

  findAll(filters: {
    resolved?: boolean;
    dateFrom?: string;
    dateTo?: string;
    deviceId?: string;
    employeeId?: string;
    projectId?: string;
    busId?: string;
    reason?: string;
  }) {
    const createdAt: { gte?: Date; lte?: Date } = {};
    if (filters.dateFrom) createdAt.gte = new Date(filters.dateFrom);
    if (filters.dateTo) createdAt.lte = new Date(filters.dateTo);

    return this.prisma.attendanceException.findMany({
      where: {
        ...(filters.resolved == null ? {} : { resolved: filters.resolved }),
        ...(filters.dateFrom || filters.dateTo ? { createdAt } : {}),
        ...(filters.deviceId ? { deviceId: filters.deviceId } : {}),
        ...(filters.employeeId ? { employeeId: filters.employeeId } : {}),
        ...(filters.projectId ? { projectId: filters.projectId } : {}),
        ...(filters.busId ? { busId: filters.busId } : {}),
        ...(filters.reason ? { reason: filters.reason as never } : {}),
      },
      include: {
        device: true,
        employee: true,
        project: true,
        bus: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async resolve(id: string, note?: string) {
    const row = await this.prisma.attendanceException.findUnique({
      where: { id },
    });

    if (!row) {
      throw new BadRequestException('Exception not found');
    }

    return this.prisma.attendanceException.update({
      where: { id },
      data: {
        resolved: true,
        resolvedAt: new Date(),
        resolutionNote: note ?? null,
      },
      include: {
        device: true,
        employee: true,
        project: true,
        bus: true,
      },
    });
  }
}

