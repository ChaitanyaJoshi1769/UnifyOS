import { Resolver, Query, Mutation, Args, Field, ObjectType } from '@nestjs/graphql';
import { GraphQLString } from 'graphql';
import { ClassificationService } from './classification.service';
import type { EntityId } from '@unifyos/shared-types';

@ObjectType()
export class ClassificationInfo {
  @Field()
  documentId: string;

  @Field()
  sensitivity: string;

  @Field()
  riskScore: number;

  @Field()
  riskLevel: string;

  @Field()
  hasPII: boolean;

  @Field()
  hasPHI: boolean;

  @Field()
  hasPCI: boolean;

  @Field()
  classifiedAt: string;
}

@Resolver()
export class ClassificationResolver {
  constructor(private readonly classificationService: ClassificationService) {}

  @Mutation(() => ClassificationInfo)
  async classifyDocument(
    @Args('documentId', { type: () => GraphQLString }) documentId: string,
    @Args('content', { type: () => GraphQLString }) content: string,
    @Args('tenantId', { type: () => GraphQLString }) tenantId: string
  ): Promise<ClassificationInfo> {
    const result = await this.classificationService.classifyDocument(
      documentId as EntityId,
      content,
      tenantId as EntityId
    );

    return {
      documentId: result.documentId,
      sensitivity: result.sensitivityLevel,
      riskScore: result.riskScore,
      riskLevel: result.riskLevel,
      hasPII: result.containsPII,
      hasPHI: result.containsPHI,
      hasPCI: result.containsPCI,
      classifiedAt: result.classifiedAt.toISOString(),
    };
  }

  @Query(() => ClassificationInfo, { nullable: true })
  async classification(
    @Args('documentId', { type: () => GraphQLString }) documentId: string
  ): Promise<ClassificationInfo | null> {
    const result = await this.classificationService.getClassificationResult(
      documentId as EntityId
    );
    if (!result) return null;

    return {
      documentId: result.documentId,
      sensitivity: result.sensitivityLevel,
      riskScore: result.riskScore,
      riskLevel: result.riskLevel,
      hasPII: result.containsPII,
      hasPHI: result.containsPHI,
      hasPCI: result.containsPCI,
      classifiedAt: result.classifiedAt.toISOString(),
    };
  }
}
