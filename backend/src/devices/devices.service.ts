import { BadRequestException, Injectable } from '@nestjs/common';
import { createHash, randomBytes } from 'crypto';
import { PrismaService } from '../prisma/prisma.service';
import { CreateDeviceDto } from './dto/create-device.dto';

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
}
