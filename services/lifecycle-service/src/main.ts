import { NestFactory } from '@nestjs/core';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import helmet from '@nestjs/helmet';
import { LifecycleModule } from './lifecycle.module';

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    LifecycleModule,
    new FastifyAdapter(),
  );

  await app.register(helmet);
  app.enableCors({
    origin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:3000'],
    credentials: true,
  });

  await app.listen(3113, '0.0.0.0');
  console.log('Lifecycle Service running on port 3113');
}

bootstrap().catch(console.error);
