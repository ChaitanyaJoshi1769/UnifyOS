import {
  Resolver,
  Query,
  Mutation,
  Args,
  Field,
  ObjectType,
  InputType,
} from '@nestjs/graphql';
import { GraphQLString, GraphQLBoolean, GraphQLInt } from 'graphql';
import { ConnectorService } from './connector.service';
import type { EntityId } from '@unifyos/shared-types';

@ObjectType()
export class ConnectorType {
  @Field()
  id: string;

  @Field()
  name: string;

  @Field()
  status: string;

  @Field()
  type: string;

  @Field()
  isHealthy: boolean;

  @Field()
  successRate: number;

  @Field()
  filesDiscovered: number;

  @Field(() => GraphQLString, { nullable: true })
  lastScanAt?: string;
}

@InputType()
export class CreateConnectorInput {
  @Field()
  tenantId: string;

  @Field()
  name: string;

  @Field()
  type: string;

  @Field()
  configJson: string;
}

@ObjectType()
export class TestConnectionResult {
  @Field()
  success: boolean;

  @Field()
  message: string;
}

@ObjectType()
export class ScanResult {
  @Field()
  scanId: string;

  @Field()
  success: boolean;
}

@Resolver()
export class ConnectorResolver {
  constructor(private readonly connectorService: ConnectorService) {}

  @Query(() => [ConnectorType])
  async connectors(
    @Args('tenantId', { type: () => GraphQLString }) tenantId: string
  ): Promise<ConnectorType[]> {
    const connectors = await this.connectorService.listConnectors(
      tenantId as EntityId
    );
    return connectors.map((c) => ({
      id: c.id,
      name: c.config.name,
      status: c.status,
      type: c.config.type,
      isHealthy: c.health.isHealthy,
      successRate: c.health.successRate,
      filesDiscovered: c.statistics.filesDiscovered,
      lastScanAt: c.statistics.lastScanAt?.toISOString(),
    }));
  }

  @Query(() => ConnectorType, { nullable: true })
  async connector(
    @Args('id', { type: () => GraphQLString }) id: string
  ): Promise<ConnectorType | null> {
    const connector = await this.connectorService.getConnector(id as EntityId);
    if (!connector) return null;

    return {
      id: connector.id,
      name: connector.config.name,
      status: connector.status,
      type: connector.config.type,
      isHealthy: connector.health.isHealthy,
      successRate: connector.health.successRate,
      filesDiscovered: connector.statistics.filesDiscovered,
      lastScanAt: connector.statistics.lastScanAt?.toISOString(),
    };
  }

  @Mutation(() => ConnectorType)
  async createConnector(
    @Args('input') input: CreateConnectorInput
  ): Promise<ConnectorType> {
    const config = JSON.parse(input.configJson);
    const connector = await this.connectorService.createConnector({
      tenantId: input.tenantId as EntityId,
      config: {
        type: input.type as any,
        name: input.name,
        credentials: {},
        settings: {},
      },
    });

    return {
      id: connector.id,
      name: connector.config.name,
      status: connector.status,
      type: connector.config.type,
      isHealthy: connector.health.isHealthy,
      successRate: connector.health.successRate,
      filesDiscovered: connector.statistics.filesDiscovered,
    };
  }

  @Mutation(() => TestConnectionResult)
  async testConnection(
    @Args('connectorId', { type: () => GraphQLString }) connectorId: string
  ): Promise<TestConnectionResult> {
    return this.connectorService.testConnection(connectorId as EntityId);
  }

  @Mutation(() => ScanResult)
  async startScan(
    @Args('connectorId', { type: () => GraphQLString }) connectorId: string
  ): Promise<ScanResult> {
    const result = await this.connectorService.startScan(connectorId as EntityId);
    return {
      scanId: result.scanId,
      success: result.success,
    };
  }

  @Query(() => [GraphQLString])
  async connectorTypes(): Promise<string[]> {
    const types = await this.connectorService.listConnectorTypes();
    return types as string[];
  }
}
