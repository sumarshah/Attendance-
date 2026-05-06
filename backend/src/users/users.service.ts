import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateUserDto } from './dto/update-user.dto';

const PERM_KEYS = [
  'DASHBOARD',
  'REALTIME_MONITOR',
  'TIMESHEET',
  'TIMESHEETS',
  'EMPLOYEES',
  'ATTENDANCE',
  'PROJECTS',
  'BUSES',
  'DEVICES',
  'ALLOCATIONS',
  'EXCEPTIONS',
  'CORRECTIONS',
  'SETTINGS',
  'ADMIN_ACCESS',
] as const;

type PermKey = (typeof PERM_KEYS)[number];

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async listUsers() {
    const users = await this.prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
        updatedAt: true,
        permissions: { select: { key: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return users.map((u) => ({
      ...u,
      permissions: u.permissions.map((p) => p.key),
    }));
  }

  async getPermissions(userId: string) {
    const u = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, permissions: { select: { key: true } } },
    });
    if (!u) throw new NotFoundException('User not found');
    return { userId: u.id, permissions: u.permissions.map((p) => p.key) };
  }

  async setPermissions(userId: string, permissions: PermKey[]) {
    const u = await this.prisma.user.findUnique({ where: { id: userId }, select: { id: true } });
    if (!u) throw new NotFoundException('User not found');

    const unique = Array.from(new Set(permissions)).filter((p) => (PERM_KEYS as readonly string[]).includes(p));

    // Replace-all semantics.
    await this.prisma.userPermission.deleteMany({ where: { userId } });
    if (unique.length) {
      await this.prisma.userPermission.createMany({
        data: unique.map((k) => ({ userId, key: k as any })),
      });
    }

    return this.getPermissions(userId);
  }

  async updateUser(userId: string, dto: UpdateUserDto) {
    const existing = await this.prisma.user.findUnique({ where: { id: userId }, select: { id: true } });
    if (!existing) throw new NotFoundException('User not found');

    try {
      const updated = await this.prisma.user.update({
        where: { id: userId },
        data: {
          name: dto.name?.trim(),
          email: dto.email ? dto.email.toLowerCase().trim() : undefined,
          role: dto.role ? dto.role.toUpperCase() : undefined,
        },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          createdAt: true,
          updatedAt: true,
          permissions: { select: { key: true } },
        },
      });

      return {
        ...updated,
        permissions: updated.permissions.map((p) => p.key),
      };
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError) {
        if (e.code === 'P2002') throw new BadRequestException('Email already exists');
      }
      throw e;
    }
  }
}
