import { BadRequestException, Injectable } from '@nestjs/common';
import { createHash, randomBytes } from 'crypto';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateDeviceDto } from './dto/create-device.dto';
import { UpdateDeviceDto } from './dto/update-device.dto';

@Injectable()
export class DevicesService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.device.findMany({
      include: {
        bus: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async create(dto: CreateDeviceDto) {
    const bus = await this.prisma.bus.findUnique({
      where: { id: dto.busId },
    });

    if (!bus) {
      throw new BadRequestException('Bus not found');
    }

    const apiKey = randomBytes(32).toString('hex');
    const apiKeyHash = createHash('sha256').update(apiKey).digest('hex');

    const device = await this.prisma.device.create({
      data: {
        deviceId: dto.deviceId,
        deviceName: dto.deviceName,
        deviceType: dto.deviceType,
        busId: dto.busId,
        apiKeyHash,
        status: dto.status ?? true,
      },
      include: {
        bus: true,
      },
    });

    // Return the apiKey only once at creation time.
    return {
      ...device,
      apiKey,
    };
  }

  async rotateKey(id: string) {
    const device = await this.prisma.device.findUnique({
      where: { id },
      include: { bus: true },
    });

    if (!device) {
      throw new BadRequestException('Device not found');
    }

    const apiKey = randomBytes(32).toString('hex');
    const apiKeyHash = createHash('sha256').update(apiKey).digest('hex');

    const updated = await this.prisma.device.update({
      where: { id },
      data: {
        apiKeyHash,
      },
      include: { bus: true },
    });

    return {
      ...updated,
      apiKey,
    };
  }

  async update(id: string, dto: UpdateDeviceDto) {
    if (dto.busId) {
      const bus = await this.prisma.bus.findUnique({ where: { id: dto.busId } });
      if (!bus) throw new BadRequestException('Bus not found');
    }

    try {
      return await this.prisma.device.update({
        where: { id },
        data: {
          deviceId: dto.deviceId?.trim(),
          deviceName: dto.deviceName?.trim(),
          deviceType: dto.deviceType?.trim(),
          busId: dto.busId,
          status: dto.status,
        },
        include: { bus: true },
      });
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError) {
        if (e.code === 'P2025') throw new BadRequestException('Device not found');
        if (e.code === 'P2002') throw new BadRequestException('Device ID already exists');
      }
      throw e;
    }
  }

  async remove(id: string) {
    try {
      return await this.prisma.device.delete({ where: { id } });
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError) {
        if (e.code === 'P2025') throw new BadRequestException('Device not found');
        if (e.code === 'P2003')
          throw new BadRequestException('Cannot delete device: it is referenced by other records');
      }
      throw e;
    }
  }
}
