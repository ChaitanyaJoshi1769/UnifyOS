import { NestFactory } from '@nestjs/core';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import helmet from 'helmet';
import { SearchModule } from './search.module';
import { getEnv, ConsoleLogger } from '@unifyos/shared-utils';

async function bootstrap(): Promise<void> {
  const logger = new ConsoleLogger('UnifyOS:SearchService');
  try {
    const app = await NestFactory.create<NestFastifyApplication>(
      SearchModule,
      new FastifyAdapter()
    );
    app.use(helmet());
    app.enableCors({ origin: getEnv('CORS_ORIGIN', '*').split(','), credentials: true });
    app.setGlobalPrefix('api/v1');
    const port = getEnv('SEARCH_SERVICE_PORT', '3104');
    await app.listen(Number(port));
    logger.info(`🔎 Search Service started on port ${port}`);
  } catch (error) {
    logger.error('Failed to start Search Service', error as Error);
    process.exit(1);
  }
}
bootstrap();
