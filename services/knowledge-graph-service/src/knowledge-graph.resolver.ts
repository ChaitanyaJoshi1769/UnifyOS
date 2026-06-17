import { Resolver, Query, Mutation, Args, Field, ObjectType } from '@nestjs/graphql';
import { GraphQLString, GraphQLInt, GraphQLFloat } from 'graphql';
import { KnowledgeGraphService } from './knowledge-graph.service';
import type { EntityId } from '@unifyos/shared-types';

@ObjectType()
export class NodeInfo {
  @Field() id: string;
  @Field() name: string;
  @Field() type: string;
  @Field() externalId: string;
}

@ObjectType()
export class EdgeInfo {
  @Field() id: string;
  @Field() sourceNodeId: string;
  @Field() targetNodeId: string;
  @Field() type: string;
  @Field() weight: number;
}

@ObjectType()
export class GraphStats {
  @Field() nodes: number;
  @Field() edges: number;
}

@Resolver()
export class KnowledgeGraphResolver {
  constructor(private readonly kgService: KnowledgeGraphService) {}

  @Mutation(() => NodeInfo)
  async createNode(
    @Args('tenantId', { type: () => GraphQLString }) tenantId: string,
    @Args('externalId', { type: () => GraphQLString }) externalId: string,
    @Args('type', { type: () => GraphQLString }) type: string,
    @Args('name', { type: () => GraphQLString }) name: string
  ): Promise<NodeInfo> {
    const node = await this.kgService.createNode(
      tenantId as EntityId,
      externalId,
      type as any,
      name
    );
    return { id: node.id, name: node.name, type: node.type, externalId: node.externalId };
  }

  @Query(() => NodeInfo, { nullable: true })
  async node(
    @Args('id', { type: () => GraphQLString }) id: string
  ): Promise<NodeInfo | null> {
    const node = await this.kgService.getNode(id as EntityId);
    if (!node) return null;
    return { id: node.id, name: node.name, type: node.type, externalId: node.externalId };
  }

  @Query(() => [NodeInfo])
  async nodes(
    @Args('tenantId', { type: () => GraphQLString }) tenantId: string
  ): Promise<NodeInfo[]> {
    const nodes = await this.kgService.listNodes(tenantId as EntityId);
    return nodes.map((n) => ({
      id: n.id,
      name: n.name,
      type: n.type,
      externalId: n.externalId,
    }));
  }

  @Mutation(() => EdgeInfo)
  async createEdge(
    @Args('tenantId', { type: () => GraphQLString }) tenantId: string,
    @Args('sourceNodeId', { type: () => GraphQLString }) sourceNodeId: string,
    @Args('targetNodeId', { type: () => GraphQLString }) targetNodeId: string,
    @Args('type', { type: () => GraphQLString }) type: string,
    @Args('weight', { type: () => GraphQLFloat, nullable: true }) weight = 0.5
  ): Promise<EdgeInfo> {
    const edge = await this.kgService.createEdge(
      tenantId as EntityId,
      sourceNodeId as EntityId,
      targetNodeId as EntityId,
      type as any,
      weight
    );
    return {
      id: edge.id,
      sourceNodeId: edge.sourceNodeId,
      targetNodeId: edge.targetNodeId,
      type: edge.type,
      weight: edge.weight,
    };
  }

  @Query(() => GraphStats)
  async graphStats(
    @Args('tenantId', { type: () => GraphQLString }) tenantId: string
  ): Promise<GraphStats> {
    const stats = await this.kgService.getGraphStats(tenantId as EntityId);
    return { nodes: stats.nodes, edges: stats.edges };
  }
}
