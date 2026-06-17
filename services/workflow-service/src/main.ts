import { NestFactory } from '@nestjs/core';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import helmet from '@nestjs/helmet';
import { WorkflowModule } from './workflow.module';

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    WorkflowModule,
    new FastifyAdapter(),
  );

  await app.register(helmet);
  app.enableCors({
    origin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:3000'],
    credentials: true,
  });

  await app.listen(3111, '0.0.0.0');
  console.log('Workflow Service running on port 3111');
}

bootstrap().catch(console.error);
