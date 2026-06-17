import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { AuthModule } from './auth/auth.module';
import { HealthController } from './health/health.controller';
import { AppResolver } from './app.resolver';
import { getEnv } from '@unifyos/shared-utils';

@Module({
  imports: [
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: true,
      playground: getEnv('NODE_ENV', 'development') === 'development',
      introspection: getEnv('NODE_ENV', 'development') === 'development',
      context: ({ req }) => ({
        user: req.user,
        tenantId: req.tenantId,
        requestId: req.requestId,
      }),
      formatError: (error) => {
        return {
          message: error.message,
          code: error.extensions?.code || 'INTERNAL_SERVER_ERROR',
          timestamp: new Date().toISOString(),
        };
      },
    }),
    AuthModule,
  ],
  controllers: [HealthController],
  providers: [AppResolver],
})
export class AppModule {}
