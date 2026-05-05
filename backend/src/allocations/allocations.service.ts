import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AllocationsService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.allocation.findMany({
      include: {
        employee: true,
        project: true,
        bus: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  create(data: {
    employeeId: string;
    projectId: string;
    busId?: string;
    startDate: string;
    endDate?: string;
    isActive?: boolean;
  }) {
    return this.prisma.allocation.create({
      data: {
        employeeId: data.employeeId,
        projectId: data.projectId,
        busId: data.busId,
        startDate: new Date(data.startDate),
        endDate: data.endDate ? new Date(data.endDate) : null,
        isActive: data.isActive ?? true,
      },
      include: {
        employee: true,
        project: true,
        bus: true,
      },
    });
  }
}
