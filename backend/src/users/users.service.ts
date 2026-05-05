import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

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
}
