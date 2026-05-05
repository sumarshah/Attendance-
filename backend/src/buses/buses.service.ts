import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

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
}
