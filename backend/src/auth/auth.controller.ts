import { Body, Controller, ForbiddenException, Get, Req, Post } from '@nestjs/common';
import type { Request } from 'express';
import { AuthService } from './auth.service';
import { Public } from './public.decorator';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { PrismaService } from '../prisma/prisma.service';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';

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

  // Always returns 200 (generic response). Basic rate limit per IP+email to slow abuse.
  private static fpRate = new Map<string, number>();

  @Public()
  @Post('forgot-password')
  async forgotPassword(@Body() body: ForgotPasswordDto, @Req() req: Request) {
    const ip = (req.ip ?? 'unknown').toString();
    const key = `${ip}:${body.email.toLowerCase().trim()}`;
    const now = Date.now();
    const last = AuthController.fpRate.get(key) ?? 0;
    if (now - last < 30_000) {
      return { message: 'If the email exists, a reset link has been sent.' };
    }
    AuthController.fpRate.set(key, now);
    return this.authService.forgotPassword(body.email);
  }

  @Public()
  @Post('reset-password')
  resetPassword(@Body() body: ResetPasswordDto) {
    return this.authService.resetPassword(body.token, body.newPassword);
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
