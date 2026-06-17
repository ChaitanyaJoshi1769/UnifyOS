import { NestFactory } from '@nestjs/core';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import helmet from 'helmet';
import { ClassificationModule } from './classification.module';
import { getEnv, ConsoleLogger } from '@unifyos/shared-utils';

async function bootstrap(): Promise<void> {
  const logger = new ConsoleLogger('UnifyOS:ClassificationService');

  try {
    const app = await NestFactory.create<NestFastifyApplication>(
      ClassificationModule,
      new FastifyAdapter()
    );

    app.use(helmet());
    app.enableCors({
      origin: getEnv('CORS_ORIGIN', '*').split(','),
      credentials: true,
    });

    app.setGlobalPrefix('api/v1');

    const port = getEnv('CLASSIFICATION_SERVICE_PORT', '3102');
    await app.listen(Number(port));

    logger.info(`🏷️ Classification Service started on port ${port}`);
  } catch (error) {
    logger.error('Failed to start Classification Service', error as Error);
    process.exit(1);
  }
}

bootstrap().catch((error) => {
  console.error('Fatal error during bootstrap:', error);
  process.exit(1);
});
