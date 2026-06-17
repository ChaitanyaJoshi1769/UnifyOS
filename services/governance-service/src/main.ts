import { NestFactory } from '@nestjs/core';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import helmet from 'helmet';
import { GovernanceModule } from './governance.module';
import { getEnv, ConsoleLogger } from '@unifyos/shared-utils';

async function bootstrap(): Promise<void> {
  const logger = new ConsoleLogger('UnifyOS:GovernanceService');
  try {
    const app = await NestFactory.create<NestFastifyApplication>(
      GovernanceModule,
      new FastifyAdapter()
    );
    app.use(helmet());
    app.enableCors({ origin: getEnv('CORS_ORIGIN', '*').split(','), credentials: true });
    app.setGlobalPrefix('api/v1');
    const port = getEnv('GOVERNANCE_SERVICE_PORT', '3107');
    await app.listen(Number(port));
    logger.info(`📋 Governance Service started on port ${port}`);
  } catch (error) {
    logger.error('Failed to start Governance Service', error as Error);
    process.exit(1);
  }
}
bootstrap();
