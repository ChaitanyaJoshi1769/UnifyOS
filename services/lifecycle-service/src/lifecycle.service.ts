import { Injectable } from '@nestjs/common';
import type { EntityId } from '@unifyos/shared-types';
import { generateEntityId, ConsoleLogger } from '@unifyos/shared-utils';

type RetentionAction = 'RETAIN' | 'ARCHIVE' | 'DELETE' | 'TRANSFER' | 'REVIEW';
type StorageTier = 'HOT' | 'WARM' | 'COLD' | 'DELETED';

interface RetentionPolicyInput {
  name: string;
  description?: string;
  retentionDays: number;
  action: RetentionAction;
  conditions?: Record<string, unknown>;
}

interface RetentionPolicy {
  id: EntityId;
  tenantId: EntityId;
  name: string;
  description?: string;
  retentionDays: number;
  action: RetentionAction;
  conditions?: Record<string, unknown>;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface LegalHold {
  id: EntityId;
  tenantId: EntityId;
  documentId: EntityId;
  reason: string;
  createdAt: Date;
  createdBy: EntityId;
  released?: Date;
  releasedBy?: EntityId;
}

interface DocumentLifecycle {
  documentId: EntityId;
  tenantId: EntityId;
  currentTier: StorageTier;
  createdAt: Date;
  lastAccessedAt: Date;
  lastModifiedAt: Date;
  retentionExpiresAt?: Date;
  archivedAt?: Date;
  deletedAt?: Date;
  legalHolds: LegalHold[];
  history: LifecycleEvent[];
}

interface LifecycleEvent {
  timestamp: Date;
  action: string;
  tier: StorageTier;
  reason?: string;
}

interface ScheduledAction {
  documentId: EntityId;
  action: RetentionAction;
  scheduledFor: Date;
  metadata?: Record<string, unknown>;
}

interface TransferResult {
  documentIds: EntityId[];
  sourceTier: StorageTier;
  targetTier: StorageTier;
  transferredCount: number;
  failedCount: number;
  totalSize: number;
  completedAt: Date;
}

interface StorageOptimizationRecommendations {
  tenantId: EntityId;
  currentUsage: number;
  recommendations: StorageRecommendation[];
  potentialSavings: number;
}

interface StorageRecommendation {
  id: EntityId;
  type: string;
  description: string;
  estimatedSavings: number;
  affectedDocumentCount: number;
}

@Injectable()
export class LifecycleService {
  private readonly logger = new ConsoleLogger('LifecycleService');
  private policies: Map<EntityId, RetentionPolicy> = new Map();
  private documentLifecycles: Map<EntityId, DocumentLifecycle> = new Map();
  private legalHolds: Map<EntityId, LegalHold> = new Map();
  private scheduledActions: ScheduledAction[] = [];
  private storageUsage: Map<EntityId, number> = new Map();

  async createRetentionPolicy(
    tenantId: EntityId,
    input: RetentionPolicyInput,
  ): Promise<RetentionPolicy> {
    const policy: RetentionPolicy = {
      id: generateEntityId(),
      tenantId,
      name: input.name,
      description: input.description,
      retentionDays: input.retentionDays,
      action: input.action,
      conditions: input.conditions,
      active: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.policies.set(policy.id, policy);
    this.logger.info(`Created retention policy: ${input.name}`);
    return policy;
  }

  async archiveDocument(documentId: EntityId, archiveLocation: string): Promise<boolean> {
    const lifecycle = this.documentLifecycles.get(documentId);
    if (!lifecycle) {
      return false;
    }

    lifecycle.currentTier = 'WARM';
    lifecycle.archivedAt = new Date();
    lifecycle.history.push({
      timestamp: new Date(),
      action: 'ARCHIVE',
      tier: 'WARM',
      reason: `Archived to ${archiveLocation}`,
    });

    this.documentLifecycles.set(documentId, lifecycle);
    this.logger.info(`Archived document: ${documentId} to ${archiveLocation}`);
    return true;
  }

  async deleteDocument(documentId: EntityId, reason: string): Promise<boolean> {
    const lifecycle = this.documentLifecycles.get(documentId);
    if (!lifecycle) {
      return false;
    }

    const holds = Array.from(this.legalHolds.values()).filter(
      (h) => h.documentId === documentId && !h.released,
    );

    if (holds.length > 0) {
      this.logger.warn(`Cannot delete document with active legal holds: ${documentId}`);
      return false;
    }

    lifecycle.currentTier = 'DELETED';
    lifecycle.deletedAt = new Date();
    lifecycle.history.push({
      timestamp: new Date(),
      action: 'DELETE',
      tier: 'DELETED',
      reason,
    });

    this.documentLifecycles.set(documentId, lifecycle);
    this.logger.info(`Deleted document: ${documentId} - ${reason}`);
    return true;
  }

  async placeOnLegalHold(
    documentId: EntityId,
    holdId: EntityId,
    reason: string,
  ): Promise<boolean> {
    const lifecycle = this.documentLifecycles.get(documentId);
    if (!lifecycle) {
      return false;
    }

    const hold: LegalHold = {
      id: holdId,
      tenantId: lifecycle.tenantId,
      documentId,
      reason,
      createdAt: new Date(),
      createdBy: lifecycle.tenantId,
    };

    this.legalHolds.set(holdId, hold);
    lifecycle.legalHolds.push(hold);
    this.documentLifecycles.set(documentId, lifecycle);

    this.logger.info(`Placed document on legal hold: ${documentId} - ${reason}`);
    return true;
  }

  async removeFromLegalHold(documentId: EntityId, holdId: EntityId): Promise<boolean> {
    const hold = this.legalHolds.get(holdId);
    if (!hold || hold.documentId !== documentId) {
      return false;
    }

    hold.released = new Date();
    hold.releasedBy = hold.tenantId;
    this.legalHolds.set(holdId, hold);

    const lifecycle = this.documentLifecycles.get(documentId);
    if (lifecycle) {
      const holdIndex = lifecycle.legalHolds.findIndex((h) => h.id === holdId);
      if (holdIndex !== -1) {
        lifecycle.legalHolds[holdIndex] = hold;
        this.documentLifecycles.set(documentId, lifecycle);
      }
    }

    this.logger.info(`Released document from legal hold: ${documentId}`);
    return true;
  }

  async getDocumentLifecycle(documentId: EntityId): Promise<DocumentLifecycle | null> {
    let lifecycle = this.documentLifecycles.get(documentId);

    if (!lifecycle) {
      const tenantId = generateEntityId();
      lifecycle = {
        documentId,
        tenantId,
        currentTier: 'HOT',
        createdAt: new Date(),
        lastAccessedAt: new Date(),
        lastModifiedAt: new Date(),
        legalHolds: [],
        history: [
          {
            timestamp: new Date(),
            action: 'CREATE',
            tier: 'HOT',
          },
        ],
      };
      this.documentLifecycles.set(documentId, lifecycle);
    }

    return lifecycle;
  }

  async scheduleAction(documentId: EntityId, action: ScheduledAction): Promise<void> {
    this.scheduledActions.push(action);
    this.logger.info(`Scheduled ${action.action} for document ${documentId}`);
  }

  async transferToColdStorage(documentIds: EntityId[]): Promise<TransferResult> {
    let transferredCount = 0;
    let totalSize = 0;

    for (const docId of documentIds) {
      const lifecycle = this.documentLifecycles.get(docId);
      if (lifecycle && lifecycle.currentTier === 'WARM') {
        lifecycle.currentTier = 'COLD';
        lifecycle.history.push({
          timestamp: new Date(),
          action: 'TRANSFER',
          tier: 'COLD',
          reason: 'Moved to cold storage',
        });
        this.documentLifecycles.set(docId, lifecycle);
        transferredCount++;
        totalSize += Math.floor(Math.random() * 10000000);
      }
    }

    const result: TransferResult = {
      documentIds,
      sourceTier: 'WARM',
      targetTier: 'COLD',
      transferredCount,
      failedCount: documentIds.length - transferredCount,
      totalSize,
      completedAt: new Date(),
    };

    this.logger.info(
      `Transferred ${transferredCount} documents to cold storage, total size: ${totalSize} bytes`,
    );
    return result;
  }

  async getStorageOptimization(tenantId: EntityId): Promise<StorageOptimizationRecommendations> {
    const currentUsage = this.storageUsage.get(tenantId) || Math.floor(Math.random() * 1000000000);

    const recommendations: StorageRecommendation[] = [
      {
        id: generateEntityId(),
        type: 'COLD_STORAGE_ARCHIVE',
        description: 'Archive documents older than 1 year to cold storage',
        estimatedSavings: currentUsage * 0.3,
        affectedDocumentCount: 2500,
      },
      {
        id: generateEntityId(),
        type: 'DUPLICATE_REMOVAL',
        description: 'Remove 1,200 identified duplicate documents',
        estimatedSavings: currentUsage * 0.15,
        affectedDocumentCount: 1200,
      },
      {
        id: generateEntityId(),
        type: 'COMPRESSION',
        description: 'Enable compression for text-heavy documents',
        estimatedSavings: currentUsage * 0.2,
        affectedDocumentCount: 5800,
      },
    ];

    const totalSavings = recommendations.reduce((sum, r) => sum + r.estimatedSavings, 0);

    return {
      tenantId,
      currentUsage,
      recommendations,
      potentialSavings: Math.round(totalSavings),
    };
  }

  async getPolicies(tenantId: EntityId): Promise<RetentionPolicy[]> {
    return Array.from(this.policies.values()).filter((p) => p.tenantId === tenantId);
  }

  async updatePolicy(policyId: EntityId, input: RetentionPolicyInput): Promise<RetentionPolicy | null> {
    const policy = this.policies.get(policyId);
    if (!policy) return null;

    policy.name = input.name;
    policy.description = input.description;
    policy.retentionDays = input.retentionDays;
    policy.action = input.action;
    policy.conditions = input.conditions;
    policy.updatedAt = new Date();

    this.policies.set(policyId, policy);
    this.logger.info(`Updated retention policy: ${input.name}`);
    return policy;
  }

  async deletePolicy(policyId: EntityId): Promise<boolean> {
    const policy = this.policies.get(policyId);
    if (!policy) return false;

    policy.active = false;
    this.policies.set(policyId, policy);
    this.logger.info(`Deleted retention policy: ${policy.name}`);
    return true;
  }

  async getActiveLegalHolds(tenantId: EntityId): Promise<LegalHold[]> {
    return Array.from(this.legalHolds.values()).filter(
      (h) => h.tenantId === tenantId && !h.released,
    );
  }
}
