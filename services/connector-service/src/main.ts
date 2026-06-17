import { NestFactory } from '@nestjs/core';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import helmet from 'helmet';
import { ConnectorModule } from './connector.module';
import { getEnv, ConsoleLogger } from '@unifyos/shared-utils';

async function bootstrap(): Promise<void> {
  const logger = new ConsoleLogger('UnifyOS:ConnectorService');

  try {
    const app = await NestFactory.create<NestFastifyApplication>(
      ConnectorModule,
      new FastifyAdapter()
    );

    app.use(helmet());
    app.enableCors({
      origin: getEnv('CORS_ORIGIN', '*').split(','),
      credentials: true,
    });

    app.setGlobalPrefix('api/v1');

    const port = getEnv('CONNECTOR_SERVICE_PORT', '3100');
    await app.listen(Number(port));

    logger.info(`🔌 Connector Service started on port ${port}`);
    logger.info(`📊 GraphQL endpoint: http://localhost:${port}/graphql`);
    logger.info(`🏥 Health check: http://localhost:${port}/health`);
  } catch (error) {
    logger.error('Failed to start Connector Service', error as Error);
    process.exit(1);
  }
}

bootstrap().catch((error) => {
  console.error('Fatal error during bootstrap:', error);
  process.exit(1);
});
