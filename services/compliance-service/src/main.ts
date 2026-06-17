import { NestFactory } from '@nestjs/core';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import helmet from 'helmet';
import { ComplianceModule } from './compliance.module';
import { getEnv, ConsoleLogger } from '@unifyos/shared-utils';

async function bootstrap(): Promise<void> {
  const logger = new ConsoleLogger('UnifyOS:ComplianceService');
  try {
    const app = await NestFactory.create<NestFastifyApplication>(
      ComplianceModule,
      new FastifyAdapter()
    );
    app.use(helmet());
    app.enableCors({ origin: getEnv('CORS_ORIGIN', '*').split(','), credentials: true });
    app.setGlobalPrefix('api/v1');
    const port = getEnv('COMPLIANCE_SERVICE_PORT', '3108');
    await app.listen(Number(port));
    logger.info(`✅ Compliance Service started on port ${port}`);
  } catch (error) {
    logger.error('Failed to start Compliance Service', error as Error);
    process.exit(1);
  }
}
bootstrap();
