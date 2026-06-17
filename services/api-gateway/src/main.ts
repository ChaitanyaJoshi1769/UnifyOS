import { NestFactory } from '@nestjs/core';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { getEnv, ConsoleLogger } from '@unifyos/shared-utils';

async function bootstrap(): Promise<void> {
  const logger = new ConsoleLogger('UnifyOS:APIGateway');

  try {
    const app = await NestFactory.create<NestFastifyApplication>(
      AppModule,
      new FastifyAdapter()
    );

    // Security middleware
    app.use(helmet());

    // CORS configuration
    app.enableCors({
      origin: getEnv('CORS_ORIGIN', '*').split(','),
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
    });

    // Request logging
    app.use((request: Record<string, unknown>, _response, next) => {
      const startTime = Date.now();
      if (typeof request === 'object' && request !== null) {
        request.startTime = startTime;
      }
      next();
    });

    // Global prefix for REST API
    app.setGlobalPrefix('api/v1');

    // Start server
    const port = getEnv('API_GATEWAY_PORT', '3000');
    await app.listen(Number(port));

    logger.info(`🚀 API Gateway started on port ${port}`);
    logger.info(`📊 GraphQL endpoint: http://localhost:${port}/graphql`);
    logger.info(`🏥 Health check: http://localhost:${port}/health`);
  } catch (error) {
    logger.error('Failed to start API Gateway', error as Error);
    process.exit(1);
  }
}

bootstrap().catch((error) => {
  console.error('Fatal error during bootstrap:', error);
  process.exit(1);
});
