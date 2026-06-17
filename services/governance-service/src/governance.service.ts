import { Injectable } from '@nestjs/common';
import type {
  DataCatalogEntry,
  BusinessGlossaryTerm,
  DataPolicy,
  DataOwner,
  DataSteward,
  EntityId,
  QualityMetrics
} from '@unifyos/shared-types';
import { generateEntityId, ConsoleLogger } from '@unifyos/shared-utils';

@Injectable()
export class GovernanceService {
  private readonly logger = new ConsoleLogger('GovernanceService');
  private catalogEntries: Map<EntityId, DataCatalogEntry> = new Map();
  private glossaryTerms: Map<EntityId, BusinessGlossaryTerm> = new Map();
  private policies: Map<EntityId, DataPolicy> = new Map();

  async createCatalogEntry(
    tenantId: EntityId,
    documentId: EntityId,
    name: string,
    description: string,
    owner: DataOwner
  ): Promise<DataCatalogEntry> {
    const entry: DataCatalogEntry = {
      id: generateEntityId(),
      tenantId,
      documentId,
      name,
      description,
      owner,
      stewards: [],
      businessGlossaryTerms: [],
      lineage: { upstream: [], downstream: [] },
      quality: {
        completeness: 0,
        accuracy: 0,
        consistency: 0,
        validity: 0,
        uniqueness: 0,
        timelineess: 0,
        overall: 0,
      },
      reviewCycle: 'ANNUAL',
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: tenantId,
      updatedBy: tenantId,
      deleted: false,
    };

    this.catalogEntries.set(entry.id, entry);
    this.logger.info(`Created catalog entry: ${name}`);
    return entry;
  }

  async addSteward(
    catalogEntryId: EntityId,
    steward: DataSteward
  ): Promise<DataCatalogEntry | null> {
    const entry = this.catalogEntries.get(catalogEntryId);
    if (!entry) return null;

    entry.stewards.push(steward);
    entry.updatedAt = new Date();
    this.catalogEntries.set(catalogEntryId, entry);
    return entry;
  }

  async updateQualityMetrics(
    catalogEntryId: EntityId,
    quality: QualityMetrics
  ): Promise<DataCatalogEntry | null> {
    const entry = this.catalogEntries.get(catalogEntryId);
    if (!entry) return null;

    entry.quality = quality;
    entry.updatedAt = new Date();
    this.catalogEntries.set(catalogEntryId, entry);
    return entry;
  }

  async createGlossaryTerm(
    tenantId: EntityId,
    term: string,
    definition: string,
    owner: DataOwner,
    steward: DataSteward
  ): Promise<BusinessGlossaryTerm> {
    const glossaryTerm: BusinessGlossaryTerm = {
      id: generateEntityId(),
      tenantId,
      term,
      definition,
      owner,
      steward,
      relatedTerms: [],
      dataAssets: [],
      policies: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: tenantId,
      updatedBy: tenantId,
      deleted: false,
    };

    this.glossaryTerms.set(glossaryTerm.id, glossaryTerm);
    this.logger.info(`Created glossary term: ${term}`);
    return glossaryTerm;
  }

  async linkTermToCatalog(
    catalogEntryId: EntityId,
    termId: EntityId
  ): Promise<boolean> {
    const entry = this.catalogEntries.get(catalogEntryId);
    const term = this.glossaryTerms.get(termId);

    if (!entry || !term) return false;

    if (!entry.businessGlossaryTerms.includes(term.term)) {
      entry.businessGlossaryTerms.push(term.term);
    }

    if (!term.dataAssets.includes(catalogEntryId)) {
      term.dataAssets.push(catalogEntryId);
    }

    entry.updatedAt = new Date();
    term.updatedAt = new Date();

    this.catalogEntries.set(catalogEntryId, entry);
    this.glossaryTerms.set(termId, term);

    return true;
  }

  async createPolicy(
    tenantId: EntityId,
    name: string,
    description: string,
    category: string,
    owner: DataOwner
  ): Promise<DataPolicy> {
    const policy: DataPolicy = {
      id: generateEntityId(),
      tenantId,
      name,
      description,
      category: category as any,
      rules: [],
      owner,
      effectiveDate: new Date(),
      status: 'DRAFT',
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: tenantId,
      updatedBy: tenantId,
      deleted: false,
    };

    this.policies.set(policy.id, policy);
    this.logger.info(`Created policy: ${name}`);
    return policy;
  }

  async publishPolicy(policyId: EntityId): Promise<DataPolicy | null> {
    const policy = this.policies.get(policyId);
    if (!policy) return null;

    policy.status = 'PUBLISHED';
    policy.effectiveDate = new Date();
    policy.updatedAt = new Date();
    this.policies.set(policyId, policy);

    this.logger.info(`Published policy: ${policy.name}`);
    return policy;
  }

  async getCatalogEntry(id: EntityId): Promise<DataCatalogEntry | null> {
    return this.catalogEntries.get(id) || null;
  }

  async listCatalogEntries(tenantId: EntityId): Promise<DataCatalogEntry[]> {
    return Array.from(this.catalogEntries.values()).filter(
      (e) => e.tenantId === tenantId && !e.deleted
    );
  }

  async listPolicies(tenantId: EntityId): Promise<DataPolicy[]> {
    return Array.from(this.policies.values()).filter(
      (p) => p.tenantId === tenantId && !p.deleted
    );
  }

  async getGovernanceStats(tenantId: EntityId): Promise<{
    catalogEntries: number;
    glossaryTerms: number;
    policies: number;
    publishedPolicies: number;
  }> {
    const catalogEntries = Array.from(this.catalogEntries.values()).filter(
      (e) => e.tenantId === tenantId && !e.deleted
    ).length;

    const glossaryTerms = Array.from(this.glossaryTerms.values()).filter(
      (t) => t.tenantId === tenantId && !t.deleted
    ).length;

    const policies = Array.from(this.policies.values()).filter(
      (p) => p.tenantId === tenantId && !p.deleted
    ).length;

    const publishedPolicies = Array.from(this.policies.values()).filter(
      (p) => p.tenantId === tenantId && !p.deleted && p.status === 'PUBLISHED'
    ).length;

    return { catalogEntries, glossaryTerms, policies, publishedPolicies };
  }
}
