import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { getEnv } from '@unifyos/shared-utils';
import { GovernanceService } from './governance.service';
import { GovernanceResolver } from './governance.resolver';
import { HealthController } from './health/health.controller';

@Module({
  imports: [GraphQLModule.forRoot<ApolloDriverConfig>({
    driver: ApolloDriver,
    autoSchemaFile: true,
    playground: getEnv('NODE_ENV') === 'development',
  })],
  controllers: [HealthController],
  providers: [GovernanceService, GovernanceResolver],
  exports: [GovernanceService],
})
export class GovernanceModule {}
