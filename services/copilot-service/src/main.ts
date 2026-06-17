import { NestFactory } from '@nestjs/core';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import helmet from '@nestjs/helmet';
import { CopilotModule } from './copilot.module';

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    CopilotModule,
    new FastifyAdapter(),
  );

  await app.register(helmet);
  app.enableCors({
    origin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:3000'],
    credentials: true,
  });

  await app.listen(3110, '0.0.0.0');
  console.log('Copilot Service running on port 3110');
}

bootstrap().catch(console.error);
