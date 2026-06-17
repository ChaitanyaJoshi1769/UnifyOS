import { Resolver, Query, Mutation, Args, Field, ObjectType } from '@nestjs/graphql';
import { GraphQLString, GraphQLInt } from 'graphql';
import { GovernanceService } from './governance.service';
import type { EntityId } from '@unifyos/shared-types';

@ObjectType()
export class CatalogEntryInfo {
  @Field() id: string;
  @Field() name: string;
  @Field() description: string;
  @Field() owner: string;
  @Field() stewardCount: number;
  @Field() lastReviewed?: string;
}

@ObjectType()
export class GovernanceStats {
  @Field() catalogEntries: number;
  @Field() glossaryTerms: number;
  @Field() policies: number;
  @Field() publishedPolicies: number;
}

@Resolver()
export class GovernanceResolver {
  constructor(private readonly governanceService: GovernanceService) {}

  @Query(() => [CatalogEntryInfo])
  async catalogEntries(
    @Args('tenantId', { type: () => GraphQLString }) tenantId: string
  ): Promise<CatalogEntryInfo[]> {
    const entries = await this.governanceService.listCatalogEntries(tenantId as EntityId);
    return entries.map((e) => ({
      id: e.id,
      name: e.name,
      description: e.description,
      owner: e.owner.email,
      stewardCount: e.stewards.length,
      lastReviewed: e.lastReviewedAt?.toISOString(),
    }));
  }

  @Query(() => CatalogEntryInfo, { nullable: true })
  async catalogEntry(
    @Args('id', { type: () => GraphQLString }) id: string
  ): Promise<CatalogEntryInfo | null> {
    const entry = await this.governanceService.getCatalogEntry(id as EntityId);
    if (!entry) return null;
    return {
      id: entry.id,
      name: entry.name,
      description: entry.description,
      owner: entry.owner.email,
      stewardCount: entry.stewards.length,
      lastReviewed: entry.lastReviewedAt?.toISOString(),
    };
  }

  @Query(() => GovernanceStats)
  async governanceStats(
    @Args('tenantId', { type: () => GraphQLString }) tenantId: string
  ): Promise<GovernanceStats> {
    return this.governanceService.getGovernanceStats(tenantId as EntityId);
  }

  @Mutation(() => CatalogEntryInfo)
  async createCatalogEntry(
    @Args('tenantId', { type: () => GraphQLString }) tenantId: string,
    @Args('documentId', { type: () => GraphQLString }) documentId: string,
    @Args('name', { type: () => GraphQLString }) name: string,
    @Args('description', { type: () => GraphQLString }) description: string,
    @Args('ownerEmail', { type: () => GraphQLString }) ownerEmail: string
  ): Promise<CatalogEntryInfo> {
    const entry = await this.governanceService.createCatalogEntry(
      tenantId as EntityId,
      documentId as EntityId,
      name,
      description,
      { userId: tenantId as EntityId, email: ownerEmail, name: 'Owner' }
    );
    return {
      id: entry.id,
      name: entry.name,
      description: entry.description,
      owner: entry.owner.email,
      stewardCount: entry.stewards.length,
    };
  }
}
