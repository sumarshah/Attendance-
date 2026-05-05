import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';
import { JwtStrategy } from './jwt.strategy';
import { PermissionsGuard } from './permissions.guard';

@Module({
  imports: [
    PassportModule,
    JwtModule.register({
      secret: (() => {
        const v = process.env.JWT_SECRET?.trim();
        const isProd = (process.env.NODE_ENV ?? '').toLowerCase() === 'production';
        if (isProd) {
          if (!v) throw new Error('JWT_SECRET is required in production');
          if (v === 'change-this-in-production') {
            throw new Error('JWT_SECRET must be changed (do not use the default placeholder)');
          }
        }
        return v || 'dev-secret-change-me';
      })(),
      signOptions: {
        expiresIn: (process.env.JWT_EXPIRES_IN ?? '7d') as any,
      },
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtStrategy,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: PermissionsGuard,
    },
  ],
})
export class AuthModule {}
