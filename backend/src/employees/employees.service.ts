import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateEmployeeIdentifierDto } from './dto/create-employee-identifier.dto';
import { Prisma } from '@prisma/client';
import { UpdateEmployeeDto } from './dto/update-employee.dto';

@Injectable()
export class EmployeesService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.employee.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  create(data: { employeeCode: string; fullName: string; phone?: string }) {
    return this.prisma.employee.create({
      data: {
        employeeCode: data.employeeCode,
        fullName: data.fullName,
        phone: data.phone,
      },
    });
  }

  async update(id: string, dto: UpdateEmployeeDto) {
    try {
      return await this.prisma.employee.update({
        where: { id },
        data: {
          employeeCode: dto.employeeCode?.trim(),
          fullName: dto.fullName?.trim(),
          phone: dto.phone === undefined ? undefined : dto.phone?.trim() || null,
          status: dto.status,
        },
      });
    } catch (e) {
      // Avoid leaking Prisma details; return a clean 400 for common cases.
      if (e instanceof Prisma.PrismaClientKnownRequestError) {
        if (e.code === 'P2025') throw new BadRequestException('Employee not found');
        if (e.code === 'P2002') throw new BadRequestException('Employee code already exists');
      }
      throw e;
    }
  }

  async remove(id: string) {
    try {
      return await this.prisma.employee.delete({ where: { id } });
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError) {
        if (e.code === 'P2025') throw new BadRequestException('Employee not found');
        if (e.code === 'P2003')
          throw new BadRequestException('Cannot delete employee: it is referenced by other records');
      }
      throw e;
    }
  }

  listIdentifiers(employeeId: string) {
    return this.prisma.employeeIdentifier.findMany({
      where: { employeeId },
      orderBy: { createdAt: 'desc' },
      include: {
        device: true,
      },
    });
  }

  async addIdentifier(employeeId: string, dto: CreateEmployeeIdentifierDto) {
    const employee = await this.prisma.employee.findUnique({
      where: { id: employeeId },
    });

    if (!employee) {
      throw new BadRequestException('Employee not found');
    }

    if (dto.deviceDbId) {
      const device = await this.prisma.device.findUnique({
        where: { id: dto.deviceDbId },
      });
      if (!device) {
        throw new BadRequestException('Device not found');
      }
    }

    return this.prisma.employeeIdentifier.create({
      data: {
        employeeId,
        identifierType: dto.identifierType,
        identifierValue: dto.identifierValue.trim(),
        vendor: dto.vendor?.trim(),
        deviceDbId: dto.deviceDbId,
      },
      include: {
        device: true,
      },
    });
  }
}
