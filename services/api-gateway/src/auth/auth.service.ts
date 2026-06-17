import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import type { AuthToken, User } from '@unifyos/shared-types';
import { hashString } from '@unifyos/shared-utils';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    roles: string[];
  };
}

@Injectable()
export class AuthService {
  constructor(private readonly jwtService: JwtService) {}

  async login(request: LoginRequest): Promise<LoginResponse> {
    // TODO: Validate credentials against database
    // For MVP, we'll create a mock response
    const payload = {
      sub: 'mock-user-id',
      email: request.email,
      roles: ['USER'],
    };

    const accessToken = this.jwtService.sign(payload);
    const refreshToken = this.jwtService.sign(payload, { expiresIn: '7d' });

    return {
      accessToken,
      refreshToken,
      expiresIn: 86400, // 24 hours in seconds
      user: {
        id: 'mock-user-id',
        email: request.email,
        firstName: 'Mock',
        lastName: 'User',
        roles: ['USER'],
      },
    };
  }

  async validateToken(token: string): Promise<Record<string, unknown> | null> {
    try {
      return this.jwtService.verify(token);
    } catch {
      return null;
    }
  }

  async refreshToken(token: string): Promise<AuthToken | null> {
    const payload = await this.validateToken(token);
    if (!payload) return null;

    const newAccessToken = this.jwtService.sign(payload);
    const newRefreshToken = this.jwtService.sign(payload, { expiresIn: '7d' });

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
      expiresIn: 86400,
      tokenType: 'Bearer',
    };
  }

  async hashPassword(password: string): Promise<string> {
    return hashString(password);
  }

  async verifyPassword(password: string, hash: string): Promise<boolean> {
    const hashedPassword = await hashString(password);
    return hashedPassword === hash;
  }
}
