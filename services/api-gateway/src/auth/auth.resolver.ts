import { Resolver, Mutation, Args, Field, ObjectType } from '@nestjs/graphql';
import { GraphQLString } from 'graphql';
import { AuthService, LoginResponse } from './auth.service';

@ObjectType()
export class LoginResponseType {
  @Field()
  accessToken: string;

  @Field()
  refreshToken: string;

  @Field()
  expiresIn: number;

  @Field()
  user: Record<string, unknown>;
}

@Resolver()
export class AuthResolver {
  constructor(private readonly authService: AuthService) {}

  @Mutation(() => LoginResponseType)
  async login(
    @Args('email', { type: () => GraphQLString }) email: string,
    @Args('password', { type: () => GraphQLString }) password: string
  ): Promise<LoginResponse> {
    return this.authService.login({ email, password });
  }

  @Mutation(() => LoginResponseType)
  async refreshToken(
    @Args('token', { type: () => GraphQLString }) token: string
  ): Promise<LoginResponse> {
    const result = await this.authService.refreshToken(token);
    if (!result) {
      throw new Error('Invalid refresh token');
    }
    return {
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
      expiresIn: result.expiresIn,
      user: {},
    };
  }
}
