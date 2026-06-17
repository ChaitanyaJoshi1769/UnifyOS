import { NestFactory } from '@nestjs/core';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import helmet from 'helmet';
import { DiscoveryModule } from './discovery.module';
import { getEnv, ConsoleLogger } from '@unifyos/shared-utils';

async function bootstrap(): Promise<void> {
  const logger = new ConsoleLogger('UnifyOS:DiscoveryService');

  try {
    const app = await NestFactory.create<NestFastifyApplication>(
      DiscoveryModule,
      new FastifyAdapter()
    );

    app.use(helmet());
    app.enableCors({
      origin: getEnv('CORS_ORIGIN', '*').split(','),
      credentials: true,
    });

    app.setGlobalPrefix('api/v1');

    const port = getEnv('DISCOVERY_SERVICE_PORT', '3101');
    await app.listen(Number(port));

    logger.info(`🔍 Discovery Service started on port ${port}`);
    logger.info(`📊 GraphQL endpoint: http://localhost:${port}/graphql`);
    logger.info(`🏥 Health check: http://localhost:${port}/health`);
  } catch (error) {
    logger.error('Failed to start Discovery Service', error as Error);
    process.exit(1);
  }
}

bootstrap().catch((error) => {
  console.error('Fatal error during bootstrap:', error);
  process.exit(1);
});
