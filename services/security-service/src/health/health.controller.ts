import { Controller, Get } from '@nestjs/common';

@Controller('health')
export class HealthController {
  private readonly startTime = Date.now();

  @Get()
  health() {
    return {
      status: 'healthy',
      service: 'security-service',
      uptime: Date.now() - this.startTime,
      timestamp: new Date().toISOString(),
    };
  }

  @Get('ready')
  ready() {
    return { ready: true };
  }

  @Get('live')
  live() {
    return { alive: true };
  }
}
