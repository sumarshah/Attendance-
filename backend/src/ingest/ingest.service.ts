import { BadRequestException, Injectable } from '@nestjs/common';
import { createHash } from 'crypto';
import { AttendanceService } from '../attendance/attendance.service';
import { PrismaService } from '../prisma/prisma.service';
import { IngestPunchDto } from './dto/ingest-punch.dto';

@Injectable()
export class IngestService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly attendanceService: AttendanceService,
  ) {}

  private hashKey(key: string) {
    return createHash('sha256').update(key).digest('hex');
  }

  async punch(connectorId: string, dto: IngestPunchDto, connectorKey?: string) {
    const connector = await this.prisma.deviceConnector.findUnique({
      where: { id: connectorId },
    });

    if (!connector || connector.status !== true) {
      throw new BadRequestException('Connector is not registered or inactive');
    }

    if (connector.apiKeyHash) {
      if (!connectorKey) {
        throw new BadRequestException('Missing x-connector-key');
      }
      const incomingHash = this.hashKey(connectorKey);
      if (incomingHash !== connector.apiKeyHash) {
        throw new BadRequestException('Invalid connector key');
      }
    }

    const config = (connector.config ?? {}) as any;
    const projectId = dto.projectId ?? config.defaultProjectId ?? null;
    const busId = dto.busId ?? config.defaultBusId ?? null;
    const allowEmployeeCode = Boolean(config.allowEmployeeCode);

    const identifierType = dto.identifierType;
    const identifierValue = dto.identifierValue?.trim();
    const employeeCode = dto.employeeCode?.trim();

    const biometricOnly =
      (process.env.DEVICE_PUNCH_MODE ?? 'BIOMETRIC_ONLY') === 'BIOMETRIC_ONLY';

    if (biometricOnly) {
      if (!(identifierType && identifierValue)) {
        throw new BadRequestException(
          'Biometric identifier is required (identifierType + identifierValue)',
        );
      }
    } else if (!allowEmployeeCode && !(identifierType && identifierValue)) {
      throw new BadRequestException(
        'Biometric identifier is required (identifierType + identifierValue)',
      );
    } else if (allowEmployeeCode && !(identifierType && identifierValue) && !employeeCode) {
      throw new BadRequestException(
        'Provide (identifierType + identifierValue) or employeeCode',
      );
    }

    if (!projectId) {
      throw new BadRequestException('projectId is required (or set defaultProjectId)');
    }

    const employee = identifierType && identifierValue
      ? await this.prisma.employeeIdentifier
          .findFirst({
            where: {
              identifierType,
              identifierValue,
            },
            include: { employee: true },
            orderBy: { createdAt: 'desc' },
          })
          .then((row) => row?.employee ?? null)
      : employeeCode
        ? await this.prisma.employee.findUnique({ where: { employeeCode } })
        : null;

    if (!employee) {
      throw new BadRequestException('Employee not found');
    }

    await this.prisma.deviceConnector.update({
      where: { id: connector.id },
      data: { lastSeenAt: new Date() },
    });

    return this.attendanceService.create({
      employeeId: employee.id,
      projectId,
      busId: busId ?? undefined,
      punchType: dto.punchType,
      authMethod: dto.authMethod,
      authScore: dto.authScore,
      liveness: dto.liveness,
      punchedAt: dto.punchedAt,
      latitude: dto.latitude,
      longitude: dto.longitude,
      deviceId: dto.deviceId ?? `CONNECTOR:${connector.id}`,
      notes: dto.notes,
    });
  }
}

