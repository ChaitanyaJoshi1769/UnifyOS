import { Controller, Get } from '@nestjs/common';

@Controller('health')
export class HealthController {
  @Get()
  health() {
    return { status: 'healthy', service: 'quality-service', timestamp: new Date().toISOString() };
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
