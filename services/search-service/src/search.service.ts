import { Injectable } from '@nestjs/common';
import type { SearchResult, SearchResults, EntityId, SearchQuery } from '@unifyos/shared-types';
import { ConsoleLogger } from '@unifyos/shared-utils';

@Injectable()
export class SearchService {
  private readonly logger = new ConsoleLogger('SearchService');
  private index: Map<string, SearchResult[]> = new Map();

  async search(query: SearchQuery): Promise<SearchResults> {
    const tenantId = query.filters?.tenantId || '';
    const results = this.index.get(tenantId as string) || [];

    const filtered = results.filter(r =>
      r.title.toLowerCase().includes(query.query.toLowerCase()) ||
      r.snippet.toLowerCase().includes(query.query.toLowerCase())
    );

    const paginated = filtered.slice(
      query.offset || 0,
      (query.offset || 0) + (query.limit || 10)
    );

    return {
      query: query.query,
      results: paginated,
      total: filtered.length,
      hasMore: (query.offset || 0) + (query.limit || 10) < filtered.length,
      executionTime: 150,
    };
  }

  async index(documentId: EntityId, content: string, tenantId: EntityId): Promise<void> {
    const result: SearchResult = {
      documentId,
      title: content.split('\n')[0],
      snippet: content.substring(0, 200),
      score: 1.0,
      path: '',
      classifications: [],
      tags: [],
    };

    const key = tenantId as string;
    if (!this.index.has(key)) this.index.set(key, []);
    this.index.get(key)?.push(result);

    this.logger.info(`Indexed document: ${documentId}`);
  }

  async vectorSearch(
    embedding: number[],
    tenantId: EntityId,
    limit: number = 10
  ): Promise<SearchResult[]> {
    const results = this.index.get(tenantId as string) || [];
    return results.slice(0, limit);
  }
}
