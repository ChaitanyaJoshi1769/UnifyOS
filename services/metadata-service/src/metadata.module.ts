import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { getEnv } from '@unifyos/shared-utils';
import { MetadataService } from './metadata.service';
import { MetadataResolver } from './metadata.resolver';
import { HealthController } from './health/health.controller';

@Module({
  imports: [GraphQLModule.forRoot<ApolloDriverConfig>({
    driver: ApolloDriver,
    autoSchemaFile: true,
    playground: getEnv('NODE_ENV', 'development') === 'development',
  })],
  controllers: [HealthController],
  providers: [MetadataService, MetadataResolver],
  exports: [MetadataService],
})
export class MetadataModule {}
