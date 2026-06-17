import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { LifecycleService } from './lifecycle.service';
import { LifecycleResolver } from './lifecycle.resolver';
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
  providers: [LifecycleService, LifecycleResolver],
  exports: [LifecycleService],
})
export class LifecycleModule {}
