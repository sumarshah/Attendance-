import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

type Status = 'PENDING' | 'APPROVED' | 'REJECTED';

@Injectable()
export class CorrectionsService {
  constructor(private readonly prisma: PrismaService) {}

  findAll(filters: { status?: Status }) {
    return this.prisma.correction.findMany({
      where: {
        ...(filters.status ? { status: filters.status } : {}),
      },
      include: {
        employee: true,
        project: true,
      },
      orderBy: [{ date: 'desc' }, { createdAt: 'desc' }],
    });
  }

  async create(data: {
    employeeId: string;
    projectId: string;
    busId?: string;
    date: string;
    requestedInAt?: string;
    requestedOutAt?: string;
    reason: string;
    requestedByUserId?: string;
  }) {
    // Quick validation: ensure referenced entities exist (gives cleaner errors).
    const [employee, project] = await Promise.all([
      this.prisma.employee.findUnique({ where: { id: data.employeeId } }),
      this.prisma.project.findUnique({ where: { id: data.projectId } }),
    ]);
    if (!employee) throw new BadRequestException('Employee not found');
    if (!project) throw new BadRequestException('Project not found');

    if (data.busId) {
      const bus = await this.prisma.bus.findUnique({ where: { id: data.busId } });
      if (!bus) throw new BadRequestException('Bus not found');
    }

    return this.prisma.correction.create({
      data: {
        employeeId: data.employeeId,
        projectId: data.projectId,
        busId: data.busId,
        date: new Date(data.date),
        requestedInAt: data.requestedInAt ? new Date(data.requestedInAt) : undefined,
        requestedOutAt: data.requestedOutAt ? new Date(data.requestedOutAt) : undefined,
        reason: data.reason,
        requestedByUserId: data.requestedByUserId,
      },
      include: {
        employee: true,
        project: true,
      },
    });
  }

  async approve(id: string, decidedByUserId?: string, note?: string) {
    const existing = await this.prisma.correction.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Correction not found');
    if (existing.status !== 'PENDING') throw new BadRequestException('Only PENDING corrections can be approved');

    return this.prisma.correction.update({
      where: { id },
      data: {
        status: 'APPROVED',
        decidedAt: new Date(),
        decidedByUserId,
        decisionNote: note,
      },
      include: { employee: true, project: true },
    });
  }

  async reject(id: string, decidedByUserId?: string, note?: string) {
    const existing = await this.prisma.correction.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Correction not found');
    if (existing.status !== 'PENDING') throw new BadRequestException('Only PENDING corrections can be rejected');

    return this.prisma.correction.update({
      where: { id },
      data: {
        status: 'REJECTED',
        decidedAt: new Date(),
        decidedByUserId,
        decisionNote: note,
      },
      include: { employee: true, project: true },
    });
  }
}

