import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { getEnv } from '@unifyos/shared-utils';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: getEnv('JWT_SECRET', 'dev-secret-key'),
    });
  }

  async validate(payload: Record<string, unknown>): Promise<Record<string, unknown>> {
    return {
      userId: payload.sub,
      email: payload.email,
      roles: payload.roles || [],
    };
  }
}
