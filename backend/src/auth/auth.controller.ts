import { Body, Controller, ForbiddenException, Get, Req, Post } from '@nestjs/common';
import type { Request } from 'express';
import { AuthService } from './auth.service';
import { Public } from './public.decorator';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { PrismaService } from '../prisma/prisma.service';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly prisma: PrismaService,
  ) {}

  @Public()
  @Post('login')
  login(@Body() body: LoginDto) {
    return this.authService.login(body);
  }

  // For now: allow register so you can create admins quickly.
  // In production: restrict this route to ADMIN only.
  @Post('register')
  register(@Body() body: RegisterDto, @Req() req: Request) {
    const role = (req as any).user?.role as string | undefined;
    if (role !== 'ADMIN') {
      throw new ForbiddenException('Only ADMIN users can create users');
    }
    const requestedByUserId = (req as any).user?.sub as string | undefined;
    return this.authService.register(body, { requestedByUserId });
  }

  @Get('me')
  async me(@Req() req: Request) {
    const payload = (req as any).user as { sub: string; email: string; role: string } | undefined;
    if (!payload?.sub) return { user: null };

    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        permissions: { select: { key: true } },
      },
    });

    if (!user) return { user: null };
    return { user: { ...user, permissions: user.permissions.map((p) => p.key) } };
  }
}
