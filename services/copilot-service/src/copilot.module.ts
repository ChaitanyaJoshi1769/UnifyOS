import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { CopilotService } from './copilot.service';
import { CopilotResolver } from './copilot.resolver';
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
  providers: [CopilotService, CopilotResolver],
  exports: [CopilotService],
})
export class CopilotModule {}
