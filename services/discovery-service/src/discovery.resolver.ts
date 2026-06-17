import {
  Resolver,
  Query,
  Mutation,
  Args,
  Field,
  ObjectType,
} from '@nestjs/graphql';
import { GraphQLString, GraphQLInt } from 'graphql';
import { DiscoveryService } from './discovery.service';
import type { EntityId } from '@unifyos/shared-types';

@ObjectType()
export class DocumentInfo {
  @Field()
  id: string;

  @Field()
  name: string;

  @Field()
  path: string;

  @Field()
  status: string;

  @Field()
  format: string;

  @Field()
  language: string;

  @Field()
  size: number;

  @Field()
  owner?: string;
}

@ObjectType()
export class DiscoveryStats {
  @Field()
  total: number;

  @Field()
  discovered: number;

  @Field()
  parsed: number;

  @Field()
  indexed: number;

  @Field()
  failed: number;
}

@Resolver()
export class DiscoveryResolver {
  constructor(private readonly discoveryService: DiscoveryService) {}

  @Query(() => [DocumentInfo])
  async documents(
    @Args('tenantId', { type: () => GraphQLString }) tenantId: string
  ): Promise<DocumentInfo[]> {
    const documents = await this.discoveryService.listDocuments(tenantId as EntityId);
    return documents.map((d) => ({
      id: d.id,
      name: d.metadata.name,
      path: d.path,
      status: d.status,
      format: d.format,
      language: d.language,
      size: d.size,
      owner: d.owner,
    }));
  }

  @Query(() => DocumentInfo, { nullable: true })
  async document(
    @Args('id', { type: () => GraphQLString }) id: string
  ): Promise<DocumentInfo | null> {
    const doc = await this.discoveryService.getDocument(id as EntityId);
    if (!doc) return null;

    return {
      id: doc.id,
      name: doc.metadata.name,
      path: doc.path,
      status: doc.status,
      format: doc.format,
      language: doc.language,
      size: doc.size,
      owner: doc.owner,
    };
  }

  @Query(() => DiscoveryStats)
  async documentStats(
    @Args('tenantId', { type: () => GraphQLString }) tenantId: string
  ): Promise<DiscoveryStats> {
    const stats = await this.discoveryService.getDocumentStats(tenantId as EntityId);
    return {
      total: stats.total,
      discovered: stats.discovered,
      parsed: stats.parsed,
      indexed: stats.indexed,
      failed: stats.failed,
    };
  }

  @Mutation(() => DocumentInfo)
  async addTag(
    @Args('documentId', { type: () => GraphQLString }) documentId: string,
    @Args('tag', { type: () => GraphQLString }) tag: string
  ): Promise<DocumentInfo | null> {
    const doc = await this.discoveryService.addTags(
      documentId as EntityId,
      [tag]
    );
    if (!doc) return null;

    return {
      id: doc.id,
      name: doc.metadata.name,
      path: doc.path,
      status: doc.status,
      format: doc.format,
      language: doc.language,
      size: doc.size,
      owner: doc.owner,
    };
  }

  @Mutation(() => DocumentInfo)
  async addLabel(
    @Args('documentId', { type: () => GraphQLString }) documentId: string,
    @Args('label', { type: () => GraphQLString }) label: string
  ): Promise<DocumentInfo | null> {
    const doc = await this.discoveryService.addLabels(
      documentId as EntityId,
      [label]
    );
    if (!doc) return null;

    return {
      id: doc.id,
      name: doc.metadata.name,
      path: doc.path,
      status: doc.status,
      format: doc.format,
      language: doc.language,
      size: doc.size,
      owner: doc.owner,
    };
  }
}
