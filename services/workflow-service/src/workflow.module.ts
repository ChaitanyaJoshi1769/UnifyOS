import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { WorkflowService } from './workflow.service';
import { WorkflowResolver } from './workflow.resolver';
import { HealthController } from './health/health.controller';

@Module({
  imports: [
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: true,
      playground: true,
      introspection: true,
    }),
  ],
  controllers: [HealthController],
  providers: [WorkflowService, WorkflowResolver],
  exports: [WorkflowService],
})
export class WorkflowModule {}
