import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PrismaService } from '../prisma/prisma.service';
import { PERMISSIONS_KEY, type PermissionKey } from './permissions.decorator';
import { IS_PUBLIC_KEY } from './public.decorator';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext) {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;

    const required = this.reflector.getAllAndOverride<PermissionKey[]>(
      PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()],
    );
    if (!required || required.length === 0) return true;

    const req = context.switchToHttp().getRequest();
    const payload = req?.user as { sub?: string; role?: string } | undefined;
    if (!payload?.sub) return true; // JwtAuthGuard will handle auth failures

    if (payload.role === 'ADMIN') return true;

    const userPerms = await this.prisma.userPermission.findMany({
      where: { userId: payload.sub },
      select: { key: true },
    });
    const set = new Set(userPerms.map((p) => p.key));

    // Backward compatibility: older permission keys can satisfy newer module permissions.
    const implied: Record<string, string[]> = {
      ATTENDANCE: ['REALTIME_MONITOR'],
      TIMESHEETS: ['TIMESHEET'],
    };

    const ok = required.some((p) => {
      const key = String(p).toUpperCase();
      if (set.has(key as any)) return true;
      const also = implied[key];
      if (!also?.length) return false;
      return also.some((k) => set.has(k as any));
    });
    if (!ok) throw new ForbiddenException('Missing permission');
    return true;
  }
}
