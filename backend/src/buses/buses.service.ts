import { BadRequestException, Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateBusDto } from './dto/update-bus.dto';

@Injectable()
export class BusesService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.bus.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  create(data: {
    busCode: string;
    plateNumber: string;
    driverName?: string;
  }) {
    return this.prisma.bus.create({
      data: {
        busCode: data.busCode,
        plateNumber: data.plateNumber,
        driverName: data.driverName,
      },
    });
  }

  async update(id: string, dto: UpdateBusDto) {
    try {
      return await this.prisma.bus.update({
        where: { id },
        data: {
          busCode: dto.busCode?.trim(),
          plateNumber: dto.plateNumber?.trim(),
          driverName: dto.driverName === undefined ? undefined : dto.driverName?.trim() || null,
        },
      });
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError) {
        if (e.code === 'P2025') throw new BadRequestException('Bus not found');
        if (e.code === 'P2002') throw new BadRequestException('Bus code or plate already exists');
      }
      throw e;
    }
  }

  async remove(id: string) {
    try {
      return await this.prisma.bus.delete({ where: { id } });
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError) {
        if (e.code === 'P2025') throw new BadRequestException('Bus not found');
        if (e.code === 'P2003')
          throw new BadRequestException('Cannot delete bus: it is referenced by other records');
      }
      throw e;
    }
  }
}
