import { Resolver, Query, Mutation, Args, Field, ObjectType } from '@nestjs/graphql';
import { GraphQLString, GraphQLInt } from 'graphql';
import { QualityService } from './quality.service';

@ObjectType()
export class QualityScore {
  @Field() documentId: string;
  @Field() score: number;
  @Field() grade: string;
}

@Resolver()
export class QualityResolver {
  constructor(private readonly qualityService: QualityService) {}

  @Query(() => QualityScore)
  async qualityScore(
    @Args('documentId', { type: () => GraphQLString }) documentId: string
  ): Promise<QualityScore> {
    const score = await this.qualityService.calculateQualityScore(documentId);
    const grade = score >= 90 ? 'A' : score >= 80 ? 'B' : score >= 70 ? 'C' : 'D';
    return { documentId, score, grade };
  }

  @Mutation(() => GraphQLString)
  async repairMetadata(
    @Args('documentId', { type: () => GraphQLString }) documentId: string
  ): Promise<string> {
    await this.qualityService.repairMetadata(documentId);
    return `Repaired metadata for ${documentId}`;
  }
}
