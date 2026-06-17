import { NestFactory } from '@nestjs/core';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import helmet from '@nestjs/helmet';
import { SecurityModule } from './security.module';

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    SecurityModule,
    new FastifyAdapter(),
  );

  await app.register(helmet);
  app.enableCors({
    origin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:3000'],
    credentials: true,
  });

  await app.listen(3109, '0.0.0.0');
  console.log('Security Service running on port 3109');
}

bootstrap().catch(console.error);
