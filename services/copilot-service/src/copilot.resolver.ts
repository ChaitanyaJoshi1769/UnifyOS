import { Resolver, Query, Mutation, Args, Field, ObjectType } from '@nestjs/graphql';
import { GraphQLString, GraphQLInt, GraphQLList } from 'graphql';
import { CopilotService } from './copilot.service';
import type { EntityId } from '@unifyos/shared-types';

type AgentType =
  | 'DiscoveryAgent'
  | 'ClassificationAgent'
  | 'GovernanceAgent'
  | 'CleaningAgent'
  | 'SearchAgent'
  | 'AnalyticsAgent'
  | 'ComplianceAgent';

@ObjectType()
export class AgentInfo {
  @Field() id: string;
  @Field() name: string;
  @Field() type: string;
  @Field() createdAt: string;
}

@ObjectType()
export class ChatResponseInfo {
  @Field() id: string;
  @Field() message: string;
  @Field() response: string;
  @Field() timestamp: string;
}

@ObjectType()
export class InsightInfo {
  @Field() id: string;
  @Field() type: string;
  @Field() confidence: number;
  @Field() content: string;
}

@ObjectType()
export class GovernanceSuggestionInfo {
  @Field() id: string;
  @Field() type: string;
  @Field() suggestion: string;
  @Field() priority: string;
}

@ObjectType()
export class CleaningRecommendationInfo {
  @Field() id: string;
  @Field() issue: string;
  @Field() recommendation: string;
  @Field() estimatedImpact: string;
}

@ObjectType()
export class ReportInfo {
  @Field() id: string;
  @Field() type: string;
  @Field() content: string;
  @Field() generatedAt: string;
}

@Resolver()
export class CopilotResolver {
  constructor(private readonly copilotService: CopilotService) {}

  @Mutation(() => AgentInfo)
  async createAgent(
    @Args('tenantId', { type: () => GraphQLString }) tenantId: string,
    @Args('name', { type: () => GraphQLString }) name: string,
    @Args('type', { type: () => GraphQLString }) type: string,
  ): Promise<AgentInfo> {
    const agent = await this.copilotService.createAgent(
      tenantId as EntityId,
      name,
      type as AgentType,
    );
    return {
      id: agent.id,
      name: agent.name,
      type: agent.type,
      createdAt: agent.createdAt.toISOString(),
    };
  }

  @Mutation(() => ChatResponseInfo)
  async chat(
    @Args('agentId', { type: () => GraphQLString }) agentId: string,
    @Args('message', { type: () => GraphQLString }) message: string,
  ): Promise<ChatResponseInfo> {
    const response = await this.copilotService.chat(agentId as EntityId, message, {});
    return {
      id: response.id,
      message: response.message,
      response: response.response,
      timestamp: response.timestamp.toISOString(),
    };
  }

  @Query(() => [InsightInfo])
  async discoverInsights(
    @Args('documentId', { type: () => GraphQLString }) documentId: string,
    @Args('analysisType', { type: () => GraphQLString }) analysisType: string,
  ): Promise<InsightInfo[]> {
    const insights = await this.copilotService.discoverInsights(
      documentId as EntityId,
      analysisType,
    );
    return insights.map((i) => ({
      id: i.id,
      type: i.type,
      confidence: i.confidence,
      content: i.content,
    }));
  }

  @Query(() => [GraphQLString])
  async classifyDocuments(
    @Args('documentIds', { type: () => [GraphQLString] }) documentIds: string[],
  ): Promise<string[]> {
    const classifications = await this.copilotService.classifyDocuments(
      documentIds as EntityId[],
    );
    return classifications.map((c) => `${c.documentId}: ${c.category}`);
  }

  @Query(() => [GovernanceSuggestionInfo])
  async suggestGovernance(
    @Args('documentId', { type: () => GraphQLString }) documentId: string,
  ): Promise<GovernanceSuggestionInfo[]> {
    const suggestions = await this.copilotService.suggestGovernance(documentId as EntityId);
    return suggestions.map((s) => ({
      id: s.id,
      type: s.type,
      suggestion: s.suggestion,
      priority: s.priority,
    }));
  }

  @Query(() => [CleaningRecommendationInfo])
  async recommendCleaning(
    @Args('tenantId', { type: () => GraphQLString }) tenantId: string,
  ): Promise<CleaningRecommendationInfo[]> {
    const recommendations = await this.copilotService.recommendCleaning(tenantId as EntityId);
    return recommendations.map((r) => ({
      id: r.id,
      issue: r.issue,
      recommendation: r.recommendation,
      estimatedImpact: r.estimatedImpact,
    }));
  }

  @Mutation(() => ReportInfo)
  async generateReport(
    @Args('reportType', { type: () => GraphQLString }) reportType: string,
  ): Promise<ReportInfo> {
    const report = await this.copilotService.generateReport(reportType, {});
    return {
      id: report.id,
      type: report.type,
      content: report.content,
      generatedAt: report.generatedAt.toISOString(),
    };
  }

  @Query(() => [AgentInfo])
  async listAgents(
    @Args('tenantId', { type: () => GraphQLString }) tenantId: string,
  ): Promise<AgentInfo[]> {
    const agents = await this.copilotService.listAgents(tenantId as EntityId);
    return agents.map((a) => ({
      id: a.id,
      name: a.name,
      type: a.type,
      createdAt: a.createdAt.toISOString(),
    }));
  }
}
