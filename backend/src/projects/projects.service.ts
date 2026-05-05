import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

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
}
