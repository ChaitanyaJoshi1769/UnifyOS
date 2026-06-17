import { Resolver, Query, Mutation, Args, Field, ObjectType } from '@nestjs/graphql';
import { GraphQLString, GraphQLInt, GraphQLList } from 'graphql';
import { LifecycleService } from './lifecycle.service';
import type { EntityId } from '@unifyos/shared-types';

@ObjectType()
export class RetentionPolicyInfo {
  @Field() id: string;
  @Field() name: string;
  @Field() retentionDays: number;
  @Field() action: string;
  @Field() active: boolean;
  @Field() createdAt: string;
}

@ObjectType()
export class DocumentLifecycleInfo {
  @Field() documentId: string;
  @Field() currentTier: string;
  @Field() createdAt: string;
  @Field() lastAccessedAt: string;
}

@ObjectType()
export class LegalHoldInfo {
  @Field() id: string;
  @Field() documentId: string;
  @Field() reason: string;
  @Field() createdAt: string;
}

@ObjectType()
export class TransferResultInfo {
  @Field() transferredCount: number;
  @Field() failedCount: number;
  @Field() totalSize: number;
  @Field() completedAt: string;
}

@ObjectType()
export class StorageRecommendationInfo {
  @Field() type: string;
  @Field() description: string;
  @Field() estimatedSavings: number;
  @Field() affectedDocumentCount: number;
}

@Resolver()
export class LifecycleResolver {
  constructor(private readonly lifecycleService: LifecycleService) {}

  @Mutation(() => RetentionPolicyInfo)
  async createRetentionPolicy(
    @Args('tenantId', { type: () => GraphQLString }) tenantId: string,
    @Args('name', { type: () => GraphQLString }) name: string,
    @Args('retentionDays', { type: () => GraphQLInt }) retentionDays: number,
    @Args('action', { type: () => GraphQLString }) action: string,
  ): Promise<RetentionPolicyInfo> {
    const policy = await this.lifecycleService.createRetentionPolicy(tenantId as EntityId, {
      name,
      retentionDays,
      action: action as any,
    });

    return {
      id: policy.id,
      name: policy.name,
      retentionDays: policy.retentionDays,
      action: policy.action,
      active: policy.active,
      createdAt: policy.createdAt.toISOString(),
    };
  }

  @Mutation(() => GraphQLString)
  async archiveDocument(
    @Args('documentId', { type: () => GraphQLString }) documentId: string,
    @Args('archiveLocation', { type: () => GraphQLString }) archiveLocation: string,
  ): Promise<string> {
    const success = await this.lifecycleService.archiveDocument(
      documentId as EntityId,
      archiveLocation,
    );
    return success ? 'Document archived' : 'Failed to archive document';
  }

  @Mutation(() => GraphQLString)
  async deleteDocument(
    @Args('documentId', { type: () => GraphQLString }) documentId: string,
    @Args('reason', { type: () => GraphQLString }) reason: string,
  ): Promise<string> {
    const success = await this.lifecycleService.deleteDocument(documentId as EntityId, reason);
    return success ? 'Document deleted' : 'Failed to delete document';
  }

  @Mutation(() => GraphQLString)
  async placeOnLegalHold(
    @Args('documentId', { type: () => GraphQLString }) documentId: string,
    @Args('holdId', { type: () => GraphQLString }) holdId: string,
    @Args('reason', { type: () => GraphQLString }) reason: string,
  ): Promise<string> {
    const success = await this.lifecycleService.placeOnLegalHold(
      documentId as EntityId,
      holdId as EntityId,
      reason,
    );
    return success ? 'Document placed on legal hold' : 'Failed to place on legal hold';
  }

  @Mutation(() => GraphQLString)
  async removeFromLegalHold(
    @Args('documentId', { type: () => GraphQLString }) documentId: string,
    @Args('holdId', { type: () => GraphQLString }) holdId: string,
  ): Promise<string> {
    const success = await this.lifecycleService.removeFromLegalHold(
      documentId as EntityId,
      holdId as EntityId,
    );
    return success ? 'Document released from legal hold' : 'Failed to release from legal hold';
  }

  @Query(() => DocumentLifecycleInfo)
  async getDocumentLifecycle(
    @Args('documentId', { type: () => GraphQLString }) documentId: string,
  ): Promise<DocumentLifecycleInfo | null> {
    const lifecycle = await this.lifecycleService.getDocumentLifecycle(documentId as EntityId);
    if (!lifecycle) return null;

    return {
      documentId: lifecycle.documentId,
      currentTier: lifecycle.currentTier,
      createdAt: lifecycle.createdAt.toISOString(),
      lastAccessedAt: lifecycle.lastAccessedAt.toISOString(),
    };
  }

  @Mutation(() => TransferResultInfo)
  async transferToColdStorage(
    @Args('documentIds', { type: () => [GraphQLString] }) documentIds: string[],
  ): Promise<TransferResultInfo> {
    const result = await this.lifecycleService.transferToColdStorage(
      documentIds as EntityId[],
    );

    return {
      transferredCount: result.transferredCount,
      failedCount: result.failedCount,
      totalSize: result.totalSize,
      completedAt: result.completedAt.toISOString(),
    };
  }

  @Query(() => [StorageRecommendationInfo])
  async getStorageOptimization(
    @Args('tenantId', { type: () => GraphQLString }) tenantId: string,
  ): Promise<StorageRecommendationInfo[]> {
    const recommendations = await this.lifecycleService.getStorageOptimization(
      tenantId as EntityId,
    );

    return recommendations.recommendations.map((r) => ({
      type: r.type,
      description: r.description,
      estimatedSavings: r.estimatedSavings,
      affectedDocumentCount: r.affectedDocumentCount,
    }));
  }

  @Query(() => [RetentionPolicyInfo])
  async listPolicies(
    @Args('tenantId', { type: () => GraphQLString }) tenantId: string,
  ): Promise<RetentionPolicyInfo[]> {
    const policies = await this.lifecycleService.getPolicies(tenantId as EntityId);

    return policies.map((p) => ({
      id: p.id,
      name: p.name,
      retentionDays: p.retentionDays,
      action: p.action,
      active: p.active,
      createdAt: p.createdAt.toISOString(),
    }));
  }

  @Query(() => [LegalHoldInfo])
  async getActiveLegalHolds(
    @Args('tenantId', { type: () => GraphQLString }) tenantId: string,
  ): Promise<LegalHoldInfo[]> {
    const holds = await this.lifecycleService.getActiveLegalHolds(tenantId as EntityId);

    return holds.map((h) => ({
      id: h.id,
      documentId: h.documentId,
      reason: h.reason,
      createdAt: h.createdAt.toISOString(),
    }));
  }
}
