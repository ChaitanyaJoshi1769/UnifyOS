import { Resolver, Query, Args, Field, ObjectType } from '@nestjs/graphql';
import { GraphQLString, GraphQLInt } from 'graphql';
import { SearchService } from './search.service';

@ObjectType()
export class SearchResultType {
  @Field() id: string;
  @Field() title: string;
  @Field() snippet: string;
  @Field() score: number;
}

@ObjectType()
export class SearchResultsType {
  @Field(() => [SearchResultType]) results: SearchResultType[];
  @Field() total: number;
  @Field() executionTime: number;
}

@Resolver()
export class SearchResolver {
  constructor(private readonly searchService: SearchService) {}

  @Query(() => SearchResultsType)
  async search(
    @Args('query', { type: () => GraphQLString }) query: string,
    @Args('limit', { type: () => GraphQLInt, nullable: true }) limit = 10
  ): Promise<SearchResultsType> {
    const results = await this.searchService.search({
      query,
      limit,
      offset: 0,
    });
    return {
      results: results.results.map(r => ({
        id: r.documentId,
        title: r.title,
        snippet: r.snippet,
        score: r.score,
      })),
      total: results.total,
      executionTime: results.executionTime,
    };
  }
}
