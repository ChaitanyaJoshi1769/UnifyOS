import { NestFactory } from '@nestjs/core';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import helmet from 'helmet';
import { QualityModule } from './quality.module';
import { getEnv, ConsoleLogger } from '@unifyos/shared-utils';

async function bootstrap(): Promise<void> {
  const logger = new ConsoleLogger('UnifyOS:QualityService');
  try {
    const app = await NestFactory.create<NestFastifyApplication>(
      QualityModule,
      new FastifyAdapter()
    );
    app.use(helmet());
    app.enableCors({ origin: getEnv('CORS_ORIGIN', '*').split(','), credentials: true });
    app.setGlobalPrefix('api/v1');
    const port = getEnv('QUALITY_SERVICE_PORT', '3105');
    await app.listen(Number(port));
    logger.info(`📊 Quality Service started on port ${port}`);
  } catch (error) {
    logger.error('Failed to start', error as Error);
    process.exit(1);
  }
}
bootstrap();
