import { BadRequestException, Injectable } from '@nestjs/common';
import { createHash, randomBytes } from 'crypto';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateDeviceDto } from './dto/create-device.dto';
import { UpdateDeviceDto } from './dto/update-device.dto';
import net from 'net';

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
        ipAddress: dto.ipAddress?.trim() || null,
        port: dto.port ?? undefined,
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
          ipAddress: dto.ipAddress === undefined ? undefined : dto.ipAddress?.trim() || null,
          port: dto.port === undefined ? undefined : dto.port,
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

  private parseIpPort(deviceId: string): { ip: string; port: number } | null {
    const raw = (deviceId ?? '').trim();
    if (!raw) return null;

    // Accept "ip", "ip:port", "host", "host:port". (IPv6 not supported in this quick test)
    const m = /^([^:]+?)(?::(\d{2,5}))?$/.exec(raw);
    if (!m) return null;
    const ip = m[1].trim();
    const port = m[2] ? Number.parseInt(m[2], 10) : 4370; // ZKTeco default port
    if (!ip) return null;
    if (!Number.isFinite(port) || port < 1 || port > 65535) return null;
    return { ip, port };
  }

  async testConnection(id: string) {
    const device = await this.prisma.device.findUnique({
      where: { id },
      select: { id: true, deviceId: true, ipAddress: true, port: true },
    });
    if (!device) throw new BadRequestException('Device not found');

    const parsed =
      device.ipAddress?.trim()
        ? { ip: device.ipAddress.trim(), port: device.port ?? 4370 }
        : this.parseIpPort(device.deviceId); // backward fallback only
    if (!parsed) {
      return {
        deviceId: device.id,
        ip: null,
        port: null,
        status: 'offline',
        message: 'Device IP/port not configured. Set IP Address (and Port) in Device Registry.',
      };
    }

    const { ip, port } = parsed;

    const timeoutMs = 3000;
    const result = await new Promise<{ online: boolean; error?: string }>((resolve) => {
      let done = false;
      const finish = (online: boolean, error?: string) => {
        if (done) return;
        done = true;
        resolve({ online, error });
      };

      const socket = net.createConnection({ host: ip, port });
      socket.setTimeout(timeoutMs);

      socket.once('connect', () => {
        socket.end();
        finish(true);
      });
      socket.once('timeout', () => {
        socket.destroy();
        finish(false, `Timeout after ${timeoutMs}ms`);
      });
      socket.once('error', (err) => {
        finish(false, err?.message || 'Connection error');
      });
      socket.once('close', () => {
        // if it closes before connect, we'll already have an error/timeout, or treat as offline
        if (!done) finish(false, 'Connection closed');
      });
    });

    if (result.online) {
      return {
        deviceId: device.id,
        ip,
        port,
        status: 'online',
        message: 'Connection successful (TCP).',
      };
    }

    return {
      deviceId: device.id,
      ip,
      port,
      status: 'offline',
      message: `Cannot connect: ${result.error ?? 'offline'}`,
    };
  }
}
