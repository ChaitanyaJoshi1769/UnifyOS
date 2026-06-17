import { Controller, Get } from '@nestjs/common';

@Controller('health')
export class HealthController {
  private readonly startTime = Date.now();

  @Get()
  health(): {
    status: string;
    service: string;
    uptime: number;
    timestamp: string;
  } {
    return {
      status: 'healthy',
      service: 'connector-service',
      uptime: Date.now() - this.startTime,
      timestamp: new Date().toISOString(),
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
