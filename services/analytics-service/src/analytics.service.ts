import { Injectable } from '@nestjs/common';
import type { EntityId } from '@unifyos/shared-types';
import { generateEntityId, ConsoleLogger } from '@unifyos/shared-utils';

interface Metric {
  name: string;
  value: number;
  timestamp: Date;
  tags: Record<string, string>;
}

interface AnalyticsEvent {
  name: string;
  userId?: EntityId;
  tenantId: EntityId;
  properties: Record<string, unknown>;
  timestamp: Date;
}

interface MetricFilter {
  name?: string;
  startTime?: Date;
  endTime?: Date;
  tags?: Record<string, string>;
}

interface MetricData {
  name: string;
  value: number;
  timestamp: string;
  tags: Record<string, string>;
}

interface Dashboard {
  id: EntityId;
  tenantId: EntityId;
  name: string;
  type: string;
  widgets: DashboardWidget[];
  createdAt: Date;
  updatedAt: Date;
}

interface DashboardWidget {
  id: string;
  title: string;
  type: string;
  config: Record<string, unknown>;
  metricNames: string[];
}

interface DashboardInput {
  name: string;
  type: string;
  widgets?: DashboardWidget[];
}

interface HealthStatus {
  status: 'HEALTHY' | 'DEGRADED' | 'UNHEALTHY';
  services: Record<string, { status: string; responseTime: number }>;
  timestamp: string;
}

interface UsageAnalytics {
  period: string;
  activeUsers: number;
  documentCount: number;
  searchCount: number;
  apiCalls: number;
  storageUsed: number;
}

interface CostAnalytics {
  period: string;
  computeCost: number;
  storageCost: number;
  transferCost: number;
  totalCost: number;
}

@Injectable()
export class AnalyticsService {
  private readonly logger = new ConsoleLogger('AnalyticsService');
  private metrics: Metric[] = [];
  private events: AnalyticsEvent[] = [];
  private dashboards: Map<EntityId, Dashboard> = new Map();
  private metricBuffer: Map<string, number[]> = new Map();

  async recordMetric(metric: Metric): Promise<void> {
    this.metrics.push(metric);
    if (this.metrics.length > 100000) {
      this.metrics.shift();
    }

    const key = metric.name;
    const values = this.metricBuffer.get(key) || [];
    values.push(metric.value);
    if (values.length > 1000) values.shift();
    this.metricBuffer.set(key, values);

    this.logger.debug(`Recorded metric: ${metric.name} = ${metric.value}`);
  }

  async recordEvent(event: AnalyticsEvent): Promise<void> {
    this.events.push(event);
    if (this.events.length > 100000) {
      this.events.shift();
    }
    this.logger.debug(`Recorded event: ${event.name}`);
  }

  async getDashboard(dashboardId: EntityId): Promise<Dashboard | null> {
    return this.dashboards.get(dashboardId) || null;
  }

  async createDashboard(
    tenantId: EntityId,
    input: DashboardInput,
  ): Promise<Dashboard> {
    const dashboard: Dashboard = {
      id: generateEntityId(),
      tenantId,
      name: input.name,
      type: input.type,
      widgets: input.widgets || this.getDefaultWidgets(input.type),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.dashboards.set(dashboard.id, dashboard);
    this.logger.info(`Created dashboard: ${input.name}`);
    return dashboard;
  }

  private getDefaultWidgets(dashboardType: string): DashboardWidget[] {
    const widgetMap: Record<string, DashboardWidget[]> = {
      ServiceHealthDashboard: [
        {
          id: 'svc-health-1',
          title: 'Service Status',
          type: 'status-indicator',
          config: { refreshInterval: 10000 },
          metricNames: ['service.health'],
        },
        {
          id: 'svc-health-2',
          title: 'Response Times',
          type: 'line-chart',
          config: { period: '1h' },
          metricNames: ['service.response_time'],
        },
      ],
      SearchAnalyticsDashboard: [
        {
          id: 'search-1',
          title: 'Search Volume',
          type: 'line-chart',
          config: { period: '24h' },
          metricNames: ['search.queries'],
        },
        {
          id: 'search-2',
          title: 'Search Performance',
          type: 'bar-chart',
          config: {},
          metricNames: ['search.latency'],
        },
      ],
      ComplianceDashboard: [
        {
          id: 'comp-1',
          title: 'Compliance Score',
          type: 'gauge',
          config: { min: 0, max: 100 },
          metricNames: ['compliance.score'],
        },
        {
          id: 'comp-2',
          title: 'Framework Status',
          type: 'table',
          config: {},
          metricNames: ['compliance.framework_status'],
        },
      ],
    };

    return widgetMap[dashboardType] || [
      {
        id: 'default-1',
        title: 'Metrics',
        type: 'line-chart',
        config: {},
        metricNames: [],
      },
    ];
  }

  async getMetrics(tenantId: EntityId, filter: MetricFilter): Promise<MetricData[]> {
    let filtered = this.metrics.filter(
      (m) => !filter.startTime || m.timestamp >= filter.startTime,
    );

    if (filter.endTime) {
      filtered = filtered.filter((m) => m.timestamp <= filter.endTime);
    }

    if (filter.name) {
      filtered = filtered.filter((m) => m.name === filter.name);
    }

    return filtered.map((m) => ({
      name: m.name,
      value: m.value,
      timestamp: m.timestamp.toISOString(),
      tags: m.tags,
    }));
  }

  async getHealthStatus(tenantId: EntityId): Promise<HealthStatus> {
    const serviceStatuses: Record<string, { status: string; responseTime: number }> = {
      'api-gateway': { status: 'HEALTHY', responseTime: 45 },
      'connector-service': { status: 'HEALTHY', responseTime: 120 },
      'discovery-service': { status: 'HEALTHY', responseTime: 250 },
      'classification-service': { status: 'HEALTHY', responseTime: 180 },
      'search-service': { status: 'HEALTHY', responseTime: 80 },
      'knowledge-graph-service': { status: 'HEALTHY', responseTime: 150 },
      'governance-service': { status: 'HEALTHY', responseTime: 95 },
      'compliance-service': { status: 'HEALTHY', responseTime: 110 },
    };

    const avgResponseTime = Object.values(serviceStatuses).reduce(
      (sum, s) => sum + s.responseTime,
      0,
    ) / Object.keys(serviceStatuses).length;

    const status =
      avgResponseTime > 500
        ? ('UNHEALTHY' as const)
        : avgResponseTime > 300
          ? ('DEGRADED' as const)
          : ('HEALTHY' as const);

    return {
      status,
      services: serviceStatuses,
      timestamp: new Date().toISOString(),
    };
  }

  async getUsageAnalytics(tenantId: EntityId, period: string): Promise<UsageAnalytics> {
    const tenantEvents = this.events.filter((e) => e.tenantId === tenantId);

    const searchEvents = tenantEvents.filter((e) => e.name === 'search.executed').length;
    const documentEvents = tenantEvents.filter((e) => e.name === 'document.indexed').length;
    const userEvents = new Set(tenantEvents.map((e) => e.userId)).size;

    return {
      period,
      activeUsers: userEvents,
      documentCount: documentEvents,
      searchCount: searchEvents,
      apiCalls: tenantEvents.length,
      storageUsed: Math.floor(Math.random() * 100000000000),
    };
  }

  async getCostAnalytics(tenantId: EntityId, period: string): Promise<CostAnalytics> {
    const computeCost = Math.random() * 10000;
    const storageCost = Math.random() * 5000;
    const transferCost = Math.random() * 2000;

    return {
      period,
      computeCost: Math.round(computeCost * 100) / 100,
      storageCost: Math.round(storageCost * 100) / 100,
      transferCost: Math.round(transferCost * 100) / 100,
      totalCost: Math.round((computeCost + storageCost + transferCost) * 100) / 100,
    };
  }

  async listDashboards(tenantId: EntityId): Promise<Dashboard[]> {
    return Array.from(this.dashboards.values()).filter((d) => d.tenantId === tenantId);
  }

  async updateDashboard(dashboardId: EntityId, input: DashboardInput): Promise<Dashboard | null> {
    const dashboard = this.dashboards.get(dashboardId);
    if (!dashboard) return null;

    dashboard.name = input.name;
    dashboard.type = input.type;
    dashboard.widgets = input.widgets || dashboard.widgets;
    dashboard.updatedAt = new Date();

    this.dashboards.set(dashboardId, dashboard);
    this.logger.info(`Updated dashboard: ${input.name}`);
    return dashboard;
  }

  async deleteDashboard(dashboardId: EntityId): Promise<boolean> {
    return this.dashboards.delete(dashboardId);
  }

  getMetricAggregation(metricName: string, aggregationType: 'avg' | 'sum' | 'max' | 'min'): number {
    const values = this.metricBuffer.get(metricName) || [];
    if (values.length === 0) return 0;

    switch (aggregationType) {
      case 'avg':
        return values.reduce((a, b) => a + b, 0) / values.length;
      case 'sum':
        return values.reduce((a, b) => a + b, 0);
      case 'max':
        return Math.max(...values);
      case 'min':
        return Math.min(...values);
      default:
        return 0;
    }
  }
}
