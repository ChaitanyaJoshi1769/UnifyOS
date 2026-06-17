import { Query, Resolver } from '@nestjs/graphql';
import { GraphQLString } from 'graphql';

@Resolver()
export class AppResolver {
  @Query(() => GraphQLString)
  hello(): string {
    return 'Welcome to UnifyOS API Gateway';
  }

  @Query(() => GraphQLString)
  version(): string {
    return '0.1.0';
  }

  @Query(() => GraphQLString)
  environment(): string {
    return process.env.NODE_ENV || 'development';
  }
}
