import { NestFactory } from '@nestjs/core';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import helmet from 'helmet';
import { MetadataModule } from './metadata.module';
import { getEnv, ConsoleLogger } from '@unifyos/shared-utils';

async function bootstrap(): Promise<void> {
  const logger = new ConsoleLogger('UnifyOS:MetadataService');
  try {
    const app = await NestFactory.create<NestFastifyApplication>(
      MetadataModule,
      new FastifyAdapter()
    );
    app.use(helmet());
    app.enableCors({ origin: getEnv('CORS_ORIGIN', '*').split(','), credentials: true });
    app.setGlobalPrefix('api/v1');
    const port = getEnv('METADATA_SERVICE_PORT', '3103');
    await app.listen(Number(port));
    logger.info(`📝 Metadata Service started on port ${port}`);
  } catch (error) {
    logger.error('Failed to start Metadata Service', error as Error);
    process.exit(1);
  }
}
bootstrap().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
