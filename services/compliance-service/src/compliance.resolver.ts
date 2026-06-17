import { Resolver, Query, Mutation, Args, Field, ObjectType } from '@nestjs/graphql';
import { GraphQLString, GraphQLInt } from 'graphql';
import { ComplianceService } from './compliance.service';
import type { EntityId } from '@unifyos/shared-types';

@ObjectType()
export class ComplianceScoreInfo {
  @Field() framework: string;
  @Field() score: number;
  @Field() status: string;
  @Field() lastAssessed?: string;
}

@Resolver()
export class ComplianceResolver {
  constructor(private readonly complianceService: ComplianceService) {}

  @Query(() => ComplianceScoreInfo)
  async complianceScore(
    @Args('tenantId', { type: () => GraphQLString }) tenantId: string,
    @Args('framework', { type: () => GraphQLString }) framework: string
  ): Promise<ComplianceScoreInfo> {
    const score = await this.complianceService.getComplianceScore(
      tenantId as EntityId,
      framework as any
    );
    const status = score >= 90 ? 'COMPLIANT' : score >= 70 ? 'PARTIALLY_COMPLIANT' : 'NON_COMPLIANT';
    return { framework, score, status };
  }

  @Query(() => [GraphQLString])
  async frameworkRequirements(
    @Args('framework', { type: () => GraphQLString }) framework: string
  ): Promise<string[]> {
    return this.complianceService.getFrameworkRequirements(framework as any);
  }

  @Mutation(() => GraphQLString)
  async generateComplianceReport(
    @Args('tenantId', { type: () => GraphQLString }) tenantId: string,
    @Args('framework', { type: () => GraphQLString }) framework: string
  ): Promise<string> {
    const report = await this.complianceService.generateReport(
      tenantId as EntityId,
      framework as any,
      new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
      new Date()
    );
    return `Report generated: ${report.id}`;
  }
}
