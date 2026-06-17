import { Injectable } from '@nestjs/common';
import type {
  Document,
  DocumentStatus,
  EntityId,
  FileFormat,
} from '@unifyos/shared-types';
import { generateEntityId, ConsoleLogger } from '@unifyos/shared-utils';
import { ParsingService } from './parsing/parsing.service';

export interface DiscoverDocumentInput {
  tenantId: EntityId;
  connectorId: EntityId;
  path: string;
  name: string;
  size: number;
  mimeType: string;
  createdAt: Date;
  modifiedAt: Date;
  owner?: string;
  content?: Buffer;
}

export interface IndexDocumentInput {
  tenantId: EntityId;
  documentId: EntityId;
  content: string;
}

@Injectable()
export class DiscoveryService {
  private readonly logger = new ConsoleLogger('DiscoveryService');
  private documents: Map<EntityId, Document> = new Map();

  constructor(private readonly parsingService: ParsingService) {}

  async discoverDocument(input: DiscoverDocumentInput): Promise<Document> {
    const document: Document = {
      id: generateEntityId(),
      tenantId: input.tenantId,
      connectorId: input.connectorId,
      path: input.path,
      metadata: {
        name: input.name,
        extension: input.name.split('.').pop() || '',
        format: await this.parsingService.detectFormat(
          input.name,
          input.content || Buffer.alloc(0)
        ),
        mimeType: input.mimeType,
        size: input.size,
        createdAt: input.createdAt,
        modifiedAt: input.modifiedAt,
        accessedAt: undefined,
        owner: input.owner,
        checksum: '',
        isEncrypted: false,
        language: 'en',
      },
      status: 'DISCOVERED' as DocumentStatus,
      size: input.size,
      format: await this.parsingService.detectFormat(
        input.name,
        input.content || Buffer.alloc(0)
      ),
      owner: input.owner,
      tags: [],
      labels: [],
      language: 'en',
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: input.tenantId,
      updatedBy: input.tenantId,
      deleted: false,
    };

    this.documents.set(document.id, document);

    this.logger.info(`Discovered document: ${document.id}`, {
      name: input.name,
      path: input.path,
      size: input.size,
    });

    return document;
  }

  async parseDocument(documentId: EntityId, content: Buffer): Promise<Document | null> {
    const document = this.documents.get(documentId);
    if (!document) return null;

    try {
      document.status = 'PARSING' as DocumentStatus;
      this.documents.set(documentId, document);

      const parseResult = await this.parsingService.parseFile(
        document.metadata.name,
        content,
        document.format
      );

      document.content = parseResult.content;
      document.language = parseResult.metadata.language;
      document.metadata.language = parseResult.metadata.language;
      document.status = 'PARSED' as DocumentStatus;
      document.updatedAt = new Date();

      this.documents.set(documentId, document);

      this.logger.info(`Parsed document: ${documentId}`, {
        language: parseResult.metadata.language,
        wordCount: parseResult.metadata.wordCount,
      });

      return document;
    } catch (error) {
      document.status = 'ERROR' as DocumentStatus;
      this.documents.set(documentId, document);

      this.logger.error(`Failed to parse document: ${documentId}`, error as Error);
      throw error;
    }
  }

  async indexDocument(documentId: EntityId): Promise<Document | null> {
    const document = this.documents.get(documentId);
    if (!document) return null;

    document.status = 'INDEXED' as DocumentStatus;
    document.updatedAt = new Date();
    this.documents.set(documentId, document);

    this.logger.info(`Indexed document: ${documentId}`);

    return document;
  }

  async getDocument(id: EntityId): Promise<Document | null> {
    return this.documents.get(id) || null;
  }

  async listDocuments(
    tenantId: EntityId,
    filter?: {
      connectorId?: EntityId;
      status?: DocumentStatus;
      format?: FileFormat;
    }
  ): Promise<Document[]> {
    let docs = Array.from(this.documents.values()).filter(
      (d) => d.tenantId === tenantId && !d.deleted
    );

    if (filter?.connectorId) {
      docs = docs.filter((d) => d.connectorId === filter.connectorId);
    }

    if (filter?.status) {
      docs = docs.filter((d) => d.status === filter.status);
    }

    if (filter?.format) {
      docs = docs.filter((d) => d.format === filter.format);
    }

    return docs;
  }

  async updateDocumentMetadata(
    documentId: EntityId,
    metadata: Record<string, unknown>
  ): Promise<Document | null> {
    const document = this.documents.get(documentId);
    if (!document) return null;

    Object.assign(document.metadata, metadata);
    document.updatedAt = new Date();

    this.documents.set(documentId, document);

    return document;
  }

  async addTags(documentId: EntityId, tags: string[]): Promise<Document | null> {
    const document = this.documents.get(documentId);
    if (!document) return null;

    document.tags = Array.from(new Set([...document.tags, ...tags]));
    document.updatedAt = new Date();

    this.documents.set(documentId, document);

    return document;
  }

  async addLabels(
    documentId: EntityId,
    labels: string[]
  ): Promise<Document | null> {
    const document = this.documents.get(documentId);
    if (!document) return null;

    document.labels = Array.from(new Set([...document.labels, ...labels]));
    document.updatedAt = new Date();

    this.documents.set(documentId, document);

    return document;
  }

  async getDocumentStats(tenantId: EntityId): Promise<{
    total: number;
    discovered: number;
    parsed: number;
    indexed: number;
    failed: number;
    byFormat: Record<FileFormat, number>;
  }> {
    const docs = await this.listDocuments(tenantId);

    const stats = {
      total: docs.length,
      discovered: docs.filter((d) => d.status === 'DISCOVERED').length,
      parsed: docs.filter((d) => d.status === 'PARSED').length,
      indexed: docs.filter((d) => d.status === 'INDEXED').length,
      failed: docs.filter((d) => d.status === 'ERROR').length,
      byFormat: {} as Record<FileFormat, number>,
    };

    for (const doc of docs) {
      stats.byFormat[doc.format] = (stats.byFormat[doc.format] || 0) + 1;
    }

    return stats;
  }

  async deleteDocument(id: EntityId): Promise<boolean> {
    const document = this.documents.get(id);
    if (!document) return false;

    document.deleted = true;
    document.deletedAt = new Date();
    document.status = 'DELETED' as DocumentStatus;

    this.documents.set(id, document);

    return true;
  }
}
