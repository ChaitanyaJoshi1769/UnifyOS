import { Injectable } from '@nestjs/common';
import type { KnowledgeGraphNode, KnowledgeGraphEdge, EntityId, EntityType, RelationType } from '@unifyos/shared-types';
import { generateEntityId, ConsoleLogger } from '@unifyos/shared-utils';

@Injectable()
export class KnowledgeGraphService {
  private readonly logger = new ConsoleLogger('KnowledgeGraphService');
  private nodes: Map<EntityId, KnowledgeGraphNode> = new Map();
  private edges: Map<EntityId, KnowledgeGraphEdge> = new Map();

  async createNode(
    tenantId: EntityId,
    externalId: string,
    type: EntityType,
    name: string,
    properties: Record<string, unknown> = {}
  ): Promise<KnowledgeGraphNode> {
    const node: KnowledgeGraphNode = {
      id: generateEntityId(),
      tenantId,
      externalId,
      type,
      name,
      properties,
      metadata: { createdAt: new Date() },
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: tenantId,
      updatedBy: tenantId,
      deleted: false,
    };

    this.nodes.set(node.id, node);
    this.logger.info(`Created node: ${name} (${type})`);
    return node;
  }

  async createEdge(
    tenantId: EntityId,
    sourceNodeId: EntityId,
    targetNodeId: EntityId,
    type: RelationType,
    weight: number = 0.5
  ): Promise<KnowledgeGraphEdge> {
    const sourceNode = this.nodes.get(sourceNodeId);
    const targetNode = this.nodes.get(targetNodeId);

    if (!sourceNode || !targetNode) {
      throw new Error('One or both nodes not found');
    }

    const edge: KnowledgeGraphEdge = {
      id: generateEntityId(),
      tenantId,
      sourceNodeId,
      targetNodeId,
      type,
      weight,
      metadata: {},
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: tenantId,
      updatedBy: tenantId,
      deleted: false,
    };

    this.edges.set(edge.id, edge);
    this.logger.info(`Created edge: ${sourceNode.name} -[${type}]-> ${targetNode.name}`);
    return edge;
  }

  async getNode(id: EntityId): Promise<KnowledgeGraphNode | null> {
    return this.nodes.get(id) || null;
  }

  async findNodeByExternalId(externalId: string): Promise<KnowledgeGraphNode | null> {
    for (const node of this.nodes.values()) {
      if (node.externalId === externalId && !node.deleted) {
        return node;
      }
    }
    return null;
  }

  async listNodes(tenantId: EntityId, type?: EntityType): Promise<KnowledgeGraphNode[]> {
    let nodes = Array.from(this.nodes.values()).filter(
      (n) => n.tenantId === tenantId && !n.deleted
    );

    if (type) {
      nodes = nodes.filter((n) => n.type === type);
    }

    return nodes;
  }

  async getRelationships(nodeId: EntityId): Promise<
    Array<{
      node: KnowledgeGraphNode;
      edge: KnowledgeGraphEdge;
      direction: 'outgoing' | 'incoming';
    }>
  > {
    const relationships: Array<{
      node: KnowledgeGraphNode;
      edge: KnowledgeGraphEdge;
      direction: 'outgoing' | 'incoming';
    }> = [];

    for (const edge of this.edges.values()) {
      if (edge.sourceNodeId === nodeId && !edge.deleted) {
        const targetNode = this.nodes.get(edge.targetNodeId);
        if (targetNode) {
          relationships.push({ node: targetNode, edge, direction: 'outgoing' });
        }
      }

      if (edge.targetNodeId === nodeId && !edge.deleted) {
        const sourceNode = this.nodes.get(edge.sourceNodeId);
        if (sourceNode) {
          relationships.push({ node: sourceNode, edge, direction: 'incoming' });
        }
      }
    }

    return relationships;
  }

  async findPath(
    startNodeId: EntityId,
    endNodeId: EntityId,
    maxDepth: number = 5
  ): Promise<EntityId[] | null> {
    const path: EntityId[] = [startNodeId];
    const visited = new Set<EntityId>([startNodeId]);

    const dfs = (current: EntityId, depth: number): boolean => {
      if (current === endNodeId) return true;
      if (depth >= maxDepth) return false;

      for (const edge of this.edges.values()) {
        if (edge.sourceNodeId === current && !visited.has(edge.targetNodeId)) {
          visited.add(edge.targetNodeId);
          path.push(edge.targetNodeId);

          if (dfs(edge.targetNodeId, depth + 1)) {
            return true;
          }

          path.pop();
          visited.delete(edge.targetNodeId);
        }
      }

      return false;
    };

    return dfs(startNodeId, 0) ? path : null;
  }

  async deleteNode(id: EntityId): Promise<boolean> {
    const node = this.nodes.get(id);
    if (!node) return false;

    node.deleted = true;
    node.deletedAt = new Date();

    // Also mark related edges as deleted
    for (const edge of this.edges.values()) {
      if (edge.sourceNodeId === id || edge.targetNodeId === id) {
        edge.deleted = true;
      }
    }

    this.nodes.set(id, node);
    return true;
  }

  async getGraphStats(tenantId: EntityId): Promise<{
    nodes: number;
    edges: number;
    nodesByType: Record<EntityType, number>;
    edgesByType: Record<RelationType, number>;
  }> {
    const nodes = Array.from(this.nodes.values()).filter(
      (n) => n.tenantId === tenantId && !n.deleted
    );
    const edges = Array.from(this.edges.values()).filter(
      (e) => e.tenantId === tenantId && !e.deleted
    );

    const nodesByType: Record<string, number> = {};
    const edgesByType: Record<string, number> = {};

    for (const node of nodes) {
      nodesByType[node.type] = (nodesByType[node.type] || 0) + 1;
    }

    for (const edge of edges) {
      edgesByType[edge.type] = (edgesByType[edge.type] || 0) + 1;
    }

    return {
      nodes: nodes.length,
      edges: edges.length,
      nodesByType: nodesByType as Record<EntityType, number>,
      edgesByType: edgesByType as Record<RelationType, number>,
    };
  }
}
