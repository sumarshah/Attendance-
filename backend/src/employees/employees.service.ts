import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateEmployeeIdentifierDto } from './dto/create-employee-identifier.dto';

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
