import { BadRequestException, Injectable } from '@nestjs/common';
import { createHash, randomBytes } from 'crypto';
import { PrismaService } from '../prisma/prisma.service';
import { CreateConnectorDto } from './dto/create-connector.dto';

@Injectable()
export class ConnectorsService {
  constructor(private readonly prisma: PrismaService) {}

  private hashKey(key: string) {
    return createHash('sha256').update(key).digest('hex');
  }

  findAll() {
    return this.prisma.deviceConnector.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async create(dto: CreateConnectorDto) {
    if (dto.defaultProjectId) {
      const project = await this.prisma.project.findUnique({
        where: { id: dto.defaultProjectId },
      });
      if (!project) throw new BadRequestException('Default project not found');
    }

    if (dto.defaultBusId) {
      const bus = await this.prisma.bus.findUnique({
        where: { id: dto.defaultBusId },
      });
      if (!bus) throw new BadRequestException('Default bus not found');
    }

    const apiKey = randomBytes(32).toString('hex');
    const apiKeyHash = this.hashKey(apiKey);

    const connector = await this.prisma.deviceConnector.create({
      data: {
        name: dto.name.trim(),
        type: dto.type,
        status: dto.status ?? true,
        apiKeyHash,
        config: {
          defaultProjectId: dto.defaultProjectId ?? null,
          defaultBusId: dto.defaultBusId ?? null,
          allowEmployeeCode: dto.allowEmployeeCode ?? false,
        } as any,
      },
    });

    return { ...connector, apiKey };
  }

  async rotateKey(id: string) {
    const existing = await this.prisma.deviceConnector.findUnique({
      where: { id },
    });
    if (!existing) throw new BadRequestException('Connector not found');

    const apiKey = randomBytes(32).toString('hex');
    const apiKeyHash = this.hashKey(apiKey);

    const updated = await this.prisma.deviceConnector.update({
      where: { id },
      data: { apiKeyHash },
    });

    return { ...updated, apiKey };
  }
}

