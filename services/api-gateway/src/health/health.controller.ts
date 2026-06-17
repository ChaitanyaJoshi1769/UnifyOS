import { Controller, Get } from '@nestjs/common';

export interface HealthResponse {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  uptime: number;
  version: string;
  services: Record<string, { status: 'up' | 'down' }>;
}

@Controller('health')
export class HealthController {
  private readonly startTime = Date.now();

  @Get()
  health(): HealthResponse {
    return {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: Date.now() - this.startTime,
      version: '0.1.0',
      services: {
        'api-gateway': { status: 'up' },
      },
    };
  }

  @Get('ready')
  ready(): { ready: boolean } {
    return { ready: true };
  }

  @Get('live')
  live(): { alive: boolean } {
    return { alive: true };
  }
}
