import { NestFactory } from '@nestjs/core';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import helmet from '@nestjs/helmet';
import { AnalyticsModule } from './analytics.module';

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AnalyticsModule,
    new FastifyAdapter(),
  );

  await app.register(helmet);
  app.enableCors({
    origin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:3000'],
    credentials: true,
  });

  await app.listen(3112, '0.0.0.0');
  console.log('Analytics Service running on port 3112');
}

bootstrap().catch(console.error);
