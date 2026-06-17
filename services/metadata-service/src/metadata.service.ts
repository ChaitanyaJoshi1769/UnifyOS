import { Injectable } from '@nestjs/common';
import type { DocumentMetadata, EntityId, MetadataField } from '@unifyos/shared-types';
import { generateEntityId, ConsoleLogger } from '@unifyos/shared-utils';

@Injectable()
export class MetadataService {
  private readonly logger = new ConsoleLogger('MetadataService');
  private metadata: Map<EntityId, DocumentMetadata> = new Map();

  async enrichMetadata(
    documentId: EntityId,
    tenantId: EntityId,
    enrichment: {
      title?: string;
      description?: string;
      author?: string;
      keywords?: string[];
      topics?: Array<{ name: string; confidence: number }>;
      entities?: Array<{ type: string; value: string; confidence: number }>;
    }
  ): Promise<DocumentMetadata> {
    let meta = this.metadata.get(documentId);

    if (!meta) {
      meta = {
        id: generateEntityId(),
        tenantId,
        documentId,
        title: enrichment.title,
        description: enrichment.description,
        author: enrichment.author,
        keywords: enrichment.keywords || [],
        topics: enrichment.topics || [],
        entities: enrichment.entities || [],
        relationships: [],
        customFields: {},
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: tenantId,
        updatedBy: tenantId,
        deleted: false,
      };
    } else {
      meta.title = enrichment.title || meta.title;
      meta.description = enrichment.description || meta.description;
      meta.author = enrichment.author || meta.author;
      meta.keywords = enrichment.keywords || meta.keywords;
      meta.topics = enrichment.topics || meta.topics;
      meta.entities = enrichment.entities || meta.entities;
      meta.enrichedAt = new Date();
      meta.enrichedBy = tenantId;
      meta.updatedAt = new Date();
    }

    this.metadata.set(documentId, meta);
    this.logger.info(`Enriched metadata for document: ${documentId}`);
    return meta;
  }

  async addCustomField(
    documentId: EntityId,
    fieldName: string,
    field: MetadataField
  ): Promise<DocumentMetadata | null> {
    const meta = this.metadata.get(documentId);
    if (!meta) return null;

    meta.customFields[fieldName] = field;
    meta.updatedAt = new Date();
    this.metadata.set(documentId, meta);
    return meta;
  }

  async getMetadata(documentId: EntityId): Promise<DocumentMetadata | null> {
    return this.metadata.get(documentId) || null;
  }

  async updateRelationship(
    documentId: EntityId,
    targetId: EntityId,
    type: string,
    confidence: number
  ): Promise<DocumentMetadata | null> {
    const meta = this.metadata.get(documentId);
    if (!meta) return null;

    meta.relationships.push({
      targetId,
      type,
      confidence,
    });
    meta.updatedAt = new Date();
    this.metadata.set(documentId, meta);
    return meta;
  }
}
