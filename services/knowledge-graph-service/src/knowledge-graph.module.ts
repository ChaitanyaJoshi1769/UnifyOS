import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { getEnv } from '@unifyos/shared-utils';
import { KnowledgeGraphService } from './knowledge-graph.service';
import { KnowledgeGraphResolver } from './knowledge-graph.resolver';
import { HealthController } from './health/health.controller';

@Module({
  imports: [GraphQLModule.forRoot<ApolloDriverConfig>({
    driver: ApolloDriver,
    autoSchemaFile: true,
    playground: getEnv('NODE_ENV') === 'development',
  })],
  controllers: [HealthController],
  providers: [KnowledgeGraphService, KnowledgeGraphResolver],
  exports: [KnowledgeGraphService],
})
export class KnowledgeGraphModule {}
