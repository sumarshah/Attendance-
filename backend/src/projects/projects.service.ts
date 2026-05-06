import { BadRequestException, Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateProjectDto } from './dto/update-project.dto';

@Injectable()
export class ProjectsService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.project.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  create(data: {
    projectCode: string;
    projectName: string;
    latitude?: number;
    longitude?: number;
    geofenceRadius?: number;
  }) {
    return this.prisma.project.create({
      data: {
        projectCode: data.projectCode,
        projectName: data.projectName,
        latitude: data.latitude,
        longitude: data.longitude,
        geofenceRadius: data.geofenceRadius,
      },
    });
  }

  async update(id: string, dto: UpdateProjectDto) {
    try {
      return await this.prisma.project.update({
        where: { id },
        data: {
          projectCode: dto.projectCode?.trim(),
          projectName: dto.projectName?.trim(),
          latitude: dto.latitude === undefined ? undefined : dto.latitude,
          longitude: dto.longitude === undefined ? undefined : dto.longitude,
          geofenceRadius: dto.geofenceRadius === undefined ? undefined : (dto.geofenceRadius as any),
        },
      });
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError) {
        if (e.code === 'P2025') throw new BadRequestException('Project not found');
        if (e.code === 'P2002') throw new BadRequestException('Project code already exists');
      }
      throw e;
    }
  }

  async remove(id: string) {
    try {
      return await this.prisma.project.delete({ where: { id } });
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError) {
        if (e.code === 'P2025') throw new BadRequestException('Project not found');
        if (e.code === 'P2003')
          throw new BadRequestException('Cannot delete project: it is referenced by other records');
      }
      throw e;
    }
  }
}
