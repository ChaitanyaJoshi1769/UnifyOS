import { Resolver, Query, Mutation, Args, Field, ObjectType } from '@nestjs/graphql';
import { GraphQLString, GraphQLInt, GraphQLFloat, GraphQLList } from 'graphql';
import { AnalyticsService } from './analytics.service';
import type { EntityId } from '@unifyos/shared-types';

@ObjectType()
export class MetricDataInfo {
  @Field() name: string;
  @Field() value: number;
  @Field() timestamp: string;
}

@ObjectType()
export class DashboardInfo {
  @Field() id: string;
  @Field() name: string;
  @Field() type: string;
  @Field() createdAt: string;
}

@ObjectType()
export class ServiceHealthInfo {
  @Field() service: string;
  @Field() status: string;
  @Field() responseTime: number;
}

@ObjectType()
export class HealthStatusInfo {
  @Field() status: string;
  @Field() timestamp: string;
  @Field(() => [ServiceHealthInfo]) services: ServiceHealthInfo[];
}

@ObjectType()
export class UsageAnalyticsInfo {
  @Field() period: string;
  @Field() activeUsers: number;
  @Field() documentCount: number;
  @Field() searchCount: number;
  @Field() apiCalls: number;
}

@ObjectType()
export class CostAnalyticsInfo {
  @Field() period: string;
  @Field() computeCost: number;
  @Field() storageCost: number;
  @Field() transferCost: number;
  @Field() totalCost: number;
}

@Resolver()
export class AnalyticsResolver {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Mutation(() => GraphQLString)
  async recordMetric(
    @Args('name', { type: () => GraphQLString }) name: string,
    @Args('value', { type: () => GraphQLFloat }) value: number,
  ): Promise<string> {
    await this.analyticsService.recordMetric({
      name,
      value,
      timestamp: new Date(),
      tags: {},
    });
    return `Metric recorded: ${name}`;
  }

  @Mutation(() => GraphQLString)
  async recordEvent(
    @Args('tenantId', { type: () => GraphQLString }) tenantId: string,
    @Args('eventName', { type: () => GraphQLString }) eventName: string,
  ): Promise<string> {
    await this.analyticsService.recordEvent({
      name: eventName,
      tenantId: tenantId as EntityId,
      properties: {},
      timestamp: new Date(),
    });
    return `Event recorded: ${eventName}`;
  }

  @Query(() => DashboardInfo)
  async getDashboard(
    @Args('dashboardId', { type: () => GraphQLString }) dashboardId: string,
  ): Promise<DashboardInfo | null> {
    const dashboard = await this.analyticsService.getDashboard(dashboardId as EntityId);
    if (!dashboard) return null;

    return {
      id: dashboard.id,
      name: dashboard.name,
      type: dashboard.type,
      createdAt: dashboard.createdAt.toISOString(),
    };
  }

  @Mutation(() => DashboardInfo)
  async createDashboard(
    @Args('tenantId', { type: () => GraphQLString }) tenantId: string,
    @Args('name', { type: () => GraphQLString }) name: string,
    @Args('type', { type: () => GraphQLString }) type: string,
  ): Promise<DashboardInfo> {
    const dashboard = await this.analyticsService.createDashboard(tenantId as EntityId, {
      name,
      type,
    });

    return {
      id: dashboard.id,
      name: dashboard.name,
      type: dashboard.type,
      createdAt: dashboard.createdAt.toISOString(),
    };
  }

  @Query(() => [MetricDataInfo])
  async getMetrics(
    @Args('tenantId', { type: () => GraphQLString }) tenantId: string,
  ): Promise<MetricDataInfo[]> {
    const metrics = await this.analyticsService.getMetrics(tenantId as EntityId, {});

    return metrics.slice(-100).map((m) => ({
      name: m.name,
      value: m.value,
      timestamp: m.timestamp,
    }));
  }

  @Query(() => HealthStatusInfo)
  async getHealthStatus(
    @Args('tenantId', { type: () => GraphQLString }) tenantId: string,
  ): Promise<HealthStatusInfo> {
    const health = await this.analyticsService.getHealthStatus(tenantId as EntityId);

    return {
      status: health.status,
      timestamp: health.timestamp,
      services: Object.entries(health.services).map(([service, info]) => ({
        service,
        status: info.status,
        responseTime: info.responseTime,
      })),
    };
  }

  @Query(() => UsageAnalyticsInfo)
  async getUsageAnalytics(
    @Args('tenantId', { type: () => GraphQLString }) tenantId: string,
    @Args('period', { type: () => GraphQLString, defaultValue: '24h' }) period: string,
  ): Promise<UsageAnalyticsInfo> {
    const usage = await this.analyticsService.getUsageAnalytics(tenantId as EntityId, period);

    return {
      period: usage.period,
      activeUsers: usage.activeUsers,
      documentCount: usage.documentCount,
      searchCount: usage.searchCount,
      apiCalls: usage.apiCalls,
    };
  }

  @Query(() => CostAnalyticsInfo)
  async getCostAnalytics(
    @Args('tenantId', { type: () => GraphQLString }) tenantId: string,
    @Args('period', { type: () => GraphQLString, defaultValue: 'monthly' }) period: string,
  ): Promise<CostAnalyticsInfo> {
    const costs = await this.analyticsService.getCostAnalytics(tenantId as EntityId, period);

    return {
      period: costs.period,
      computeCost: costs.computeCost,
      storageCost: costs.storageCost,
      transferCost: costs.transferCost,
      totalCost: costs.totalCost,
    };
  }

  @Query(() => [DashboardInfo])
  async listDashboards(
    @Args('tenantId', { type: () => GraphQLString }) tenantId: string,
  ): Promise<DashboardInfo[]> {
    const dashboards = await this.analyticsService.listDashboards(tenantId as EntityId);

    return dashboards.map((d) => ({
      id: d.id,
      name: d.name,
      type: d.type,
      createdAt: d.createdAt.toISOString(),
    }));
  }
}
