import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { getEnv } from '@unifyos/shared-utils';
import { ConnectorResolver } from './connector.resolver';
import { ConnectorService } from './connector.service';
import { ConnectorRegistry } from './registry/connector.registry';
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
  providers: [ConnectorService, ConnectorResolver, ConnectorRegistry],
  exports: [ConnectorService, ConnectorRegistry],
})
export class ConnectorModule {}
