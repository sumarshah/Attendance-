import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

export type JwtPayload = {
  sub: string;
  email: string;
  role: string;
};

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: (() => {
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
    });
  }

  async validate(payload: JwtPayload) {
    return payload;
  }
}
