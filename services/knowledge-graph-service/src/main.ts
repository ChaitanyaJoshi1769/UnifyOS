import { NestFactory } from '@nestjs/core';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import helmet from 'helmet';
import { KnowledgeGraphModule } from './knowledge-graph.module';
import { getEnv, ConsoleLogger } from '@unifyos/shared-utils';

async function bootstrap(): Promise<void> {
  const logger = new ConsoleLogger('UnifyOS:KnowledgeGraphService');
  try {
    const app = await NestFactory.create<NestFastifyApplication>(
      KnowledgeGraphModule,
      new FastifyAdapter()
    );
    app.use(helmet());
    app.enableCors({ origin: getEnv('CORS_ORIGIN', '*').split(','), credentials: true });
    app.setGlobalPrefix('api/v1');
    const port = getEnv('KNOWLEDGE_GRAPH_SERVICE_PORT', '3106');
    await app.listen(Number(port));
    logger.info(`🌐 Knowledge Graph Service started on port ${port}`);
  } catch (error) {
    logger.error('Failed to start Knowledge Graph Service', error as Error);
    process.exit(1);
  }
}
bootstrap();
