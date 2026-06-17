import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { getEnv } from '@unifyos/shared-utils';
import { DiscoveryResolver } from './discovery.resolver';
import { DiscoveryService } from './discovery.service';
import { ParsingService } from './parsing/parsing.service';
import { LanguageDetectionService } from './parsing/language-detection.service';
import { HealthController } from './health/health.controller';

@Module({
  imports: [
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: true,
      playground: getEnv('NODE_ENV', 'development') === 'development',
      introspection: getEnv('NODE_ENV', 'development') === 'development',
    }),
  ],
  controllers: [HealthController],
  providers: [
    DiscoveryService,
    DiscoveryResolver,
    ParsingService,
    LanguageDetectionService,
  ],
  exports: [DiscoveryService, ParsingService],
})
export class DiscoveryModule {}
