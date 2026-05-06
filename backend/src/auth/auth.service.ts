import { BadRequestException, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import bcrypt from 'bcryptjs';
import { createHash, randomBytes } from 'crypto';
import { PrismaService } from '../prisma/prisma.service';
import { sendMail } from './mailer';

const ALLOWED_ROLES = new Set(['USER', 'STAFF', 'SUPERVISOR', 'HR', 'ADMIN']);

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  private async hashPassword(password: string) {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(password, salt);
  }

  private hashResetToken(raw: string) {
    return createHash('sha256').update(raw).digest('hex');
  }

  private async ensureSeedAdmin() {
    const isProd = (process.env.NODE_ENV ?? '').toLowerCase() === 'production';

    const email = (process.env.ADMIN_EMAIL ?? 'admin@rcc.local').trim();
    const name = (process.env.ADMIN_NAME ?? 'Admin').trim();

    let password = (process.env.ADMIN_PASSWORD ?? '').trim();
    if (isProd && !password) {
      throw new Error('ADMIN_PASSWORD is required in production (set it in .env.production)');
    }
    if (isProd && password === 'admin123') {
      throw new Error('ADMIN_PASSWORD must be changed (do not use the default admin123)');
    }

    const existing = await this.prisma.user.findUnique({ where: { email } });
    if (existing) return;

    if (!password) {
      // Non-prod convenience: allow a default seed password if ADMIN_PASSWORD is not set.
      // Production always requires env-only.
      // eslint-disable-next-line no-console
      console.warn('ADMIN_PASSWORD not set; using default dev seed password "admin123"');
      password = 'admin123';
    }

    const passwordHash = await this.hashPassword(password);
    await this.prisma.user.create({
      data: {
        email,
        name,
        password: passwordHash,
        role: 'ADMIN',
      },
    });
  }

  async onModuleInit() {
    await this.ensureSeedAdmin();
  }

  async register(
    dto: { email: string; name: string; password: string; role?: string },
    opts?: { requestedByUserId?: string },
  ) {
    const existing = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase().trim() },
    });
    if (existing) {
      throw new BadRequestException('Email already exists');
    }

    const requestedRoleRaw = dto.role?.trim();
    const requestedRole = requestedRoleRaw ? requestedRoleRaw.toUpperCase() : undefined;
    if (requestedRole && !ALLOWED_ROLES.has(requestedRole)) {
      throw new BadRequestException('Invalid role');
    }

    const passwordHash = await this.hashPassword(dto.password);
    const user = await this.prisma.user.create({
      data: {
        email: dto.email.toLowerCase().trim(),
        name: dto.name.trim(),
        password: passwordHash,
        role: requestedRole || 'USER',
      },
    });

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      createdAt: user.createdAt,
      requestedByUserId: opts?.requestedByUserId ?? null,
    };
  }

  async login(dto: { email: string; password: string }) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase().trim() },
      include: { permissions: { select: { key: true } } },
    });
    if (!user) throw new BadRequestException('Invalid email or password');

    const ok = await bcrypt.compare(dto.password, user.password);
    if (!ok) throw new BadRequestException('Invalid email or password');

    const token = await this.jwtService.signAsync({
      sub: user.id,
      email: user.email,
      role: user.role,
    });

    return {
      accessToken: token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        permissions: user.permissions.map((p) => p.key),
      },
    };
  }

  async forgotPassword(email: string) {
    const normalized = email.toLowerCase().trim();
    const user = await this.prisma.user.findUnique({ where: { email: normalized } });

    // Always return generic success, even if user doesn't exist.
    if (!user) return { message: 'If the email exists, a reset link has been sent.' };

    const rawToken = randomBytes(32).toString('hex');
    const resetTokenHash = this.hashResetToken(rawToken);
    const resetTokenExpiry = new Date(Date.now() + 20 * 60 * 1000); // 20 min

    await this.prisma.user.update({
      where: { id: user.id },
      data: { resetTokenHash, resetTokenExpiry },
    });

    const base = (process.env.FRONTEND_ORIGIN ?? process.env.FRONTEND_ORIGINS ?? 'http://localhost:5173')
      .split(',')[0]
      .trim();
    const link = `${base.replace(/\/$/, '')}/reset-password?token=${rawToken}`;

    const mail = {
      to: user.email,
      subject: 'RCC Attendance Password Reset',
      text: `Use this link to reset your password (valid for 20 minutes):\n\n${link}\n\nIf you did not request this, ignore this email.`,
    };

    const sent = await sendMail(mail);
    if (!sent.sent) {
      // Dev fallback: log link only.
      // eslint-disable-next-line no-console
      console.log(`[password-reset] ${user.email} -> ${link}`);
    }

    return { message: 'If the email exists, a reset link has been sent.' };
  }

  async resetPassword(token: string, newPassword: string) {
    const raw = (token ?? '').trim();
    if (!raw) throw new BadRequestException('Invalid or expired token');

    const resetTokenHash = this.hashResetToken(raw);
    const now = new Date();

    const user = await this.prisma.user.findFirst({
      where: {
        resetTokenHash,
        resetTokenExpiry: { gt: now },
      },
    });

    if (!user) throw new BadRequestException('Invalid or expired token');

    const passwordHash = await this.hashPassword(newPassword);
    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        password: passwordHash,
        resetTokenHash: null,
        resetTokenExpiry: null,
      },
    });

    return { message: 'Password reset successful' };
  }
}
