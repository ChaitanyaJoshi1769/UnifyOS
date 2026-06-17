import { Resolver, Query, Mutation, Args, Field, ObjectType } from '@nestjs/graphql';
import { GraphQLString } from 'graphql';
import { MetadataService } from './metadata.service';
import type { EntityId } from '@unifyos/shared-types';

@ObjectType()
export class MetadataInfo {
  @Field()
  id: string;

  @Field()
  documentId: string;

  @Field(() => GraphQLString, { nullable: true })
  title?: string;

  @Field(() => GraphQLString, { nullable: true })
  description?: string;

  @Field()
  keywordsCount: number;

  @Field()
  entitiesCount: number;

  @Field()
  lastUpdated: string;
}

@Resolver()
export class MetadataResolver {
  constructor(private readonly metadataService: MetadataService) {}

  @Query(() => MetadataInfo, { nullable: true })
  async metadata(
    @Args('documentId', { type: () => GraphQLString }) documentId: string
  ): Promise<MetadataInfo | null> {
    const meta = await this.metadataService.getMetadata(documentId as EntityId);
    if (!meta) return null;
    return {
      id: meta.id,
      documentId: meta.documentId,
      title: meta.title,
      description: meta.description,
      keywordsCount: meta.keywords.length,
      entitiesCount: meta.entities.length,
      lastUpdated: meta.updatedAt.toISOString(),
    };
  }

  @Mutation(() => MetadataInfo)
  async enrichMetadata(
    @Args('documentId', { type: () => GraphQLString }) documentId: string,
    @Args('tenantId', { type: () => GraphQLString }) tenantId: string,
    @Args('title', { type: () => GraphQLString, nullable: true }) title?: string,
    @Args('description', { type: () => GraphQLString, nullable: true })
    description?: string
  ): Promise<MetadataInfo> {
    const meta = await this.metadataService.enrichMetadata(
      documentId as EntityId,
      tenantId as EntityId,
      { title, description }
    );
    return {
      id: meta.id,
      documentId: meta.documentId,
      title: meta.title,
      description: meta.description,
      keywordsCount: meta.keywords.length,
      entitiesCount: meta.entities.length,
      lastUpdated: meta.updatedAt.toISOString(),
    };
  }
}
