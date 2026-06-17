import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { getEnv } from '@unifyos/shared-utils';
import { ClassificationService } from './classification.service';
import { ClassificationResolver } from './classification.resolver';
import { PiiDetector } from './detectors/pii.detector';
import { PatternDetector } from './detectors/pattern.detector';
import { HealthController } from './health/health.controller';

@Module({
  imports: [
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: true,
      playground: getEnv('NODE_ENV', 'development') === 'development',
    }),
  ],
  controllers: [HealthController],
  providers: [
    ClassificationService,
    ClassificationResolver,
    PiiDetector,
    PatternDetector,
  ],
  exports: [ClassificationService],
})
export class ClassificationModule {}
