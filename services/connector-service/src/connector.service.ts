import { Injectable } from '@nestjs/common';
import type {
  Connector,
  ConnectorConfig,
  ConnectorStatus,
  ConnectorType,
  EntityId,
} from '@unifyos/shared-types';
import { generateEntityId, ConsoleLogger } from '@unifyos/shared-utils';

export interface CreateConnectorInput {
  tenantId: EntityId;
  config: ConnectorConfig;
}

export interface UpdateConnectorInput {
  id: EntityId;
  config?: Partial<ConnectorConfig>;
}

export interface ConnectorHealth {
  isHealthy: boolean;
  successRate: number;
  lastHealthCheck?: Date;
  errorMessage?: string;
}

@Injectable()
export class ConnectorService {
  private readonly logger = new ConsoleLogger('ConnectorService');
  private connectors: Map<EntityId, Connector> = new Map();

  async createConnector(input: CreateConnectorInput): Promise<Connector> {
    const connector: Connector = {
      id: generateEntityId(),
      tenantId: input.tenantId,
      config: input.config,
      status: 'CONFIGURED' as ConnectorStatus,
      health: {
        isHealthy: false,
        successRate: 0,
      },
      statistics: {
        filesDiscovered: 0,
        filesFailed: 0,
      },
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: input.tenantId,
      updatedBy: input.tenantId,
      deleted: false,
    };

    this.connectors.set(connector.id, connector);
    this.logger.info(`Created connector: ${connector.id}`, {
      type: input.config.type,
      name: input.config.name,
    });

    return connector;
  }

  async getConnector(id: EntityId): Promise<Connector | null> {
    return this.connectors.get(id) || null;
  }

  async listConnectors(tenantId: EntityId): Promise<Connector[]> {
    return Array.from(this.connectors.values()).filter(
      (c) => c.tenantId === tenantId && !c.deleted
    );
  }

  async updateConnector(input: UpdateConnectorInput): Promise<Connector | null> {
    const connector = this.connectors.get(input.id);
    if (!connector) return null;

    if (input.config) {
      connector.config = {
        ...connector.config,
        ...input.config,
      };
    }
    connector.updatedAt = new Date();

    this.connectors.set(input.id, connector);
    return connector;
  }

  async deleteConnector(id: EntityId): Promise<boolean> {
    const connector = this.connectors.get(id);
    if (!connector) return false;

    connector.deleted = true;
    connector.deletedAt = new Date();
    this.connectors.set(id, connector);
    return true;
  }

  async testConnection(id: EntityId): Promise<{
    success: boolean;
    message: string;
  }> {
    const connector = this.connectors.get(id);
    if (!connector) {
      return { success: false, message: 'Connector not found' };
    }

    try {
      // Simulate connection test
      await new Promise((resolve) => setTimeout(resolve, 500));

      connector.status = 'CONNECTED' as ConnectorStatus;
      connector.health.isHealthy = true;
      connector.health.successRate = 100;
      connector.health.lastHealthCheck = new Date();
      this.connectors.set(id, connector);

      return { success: true, message: 'Connection successful' };
    } catch (error) {
      connector.status = 'ERROR' as ConnectorStatus;
      connector.health.isHealthy = false;
      connector.health.errorMessage = String(error);
      this.connectors.set(id, connector);

      return { success: false, message: `Connection failed: ${error}` };
    }
  }

  async startScan(id: EntityId): Promise<{
    success: boolean;
    scanId: string;
  }> {
    const connector = this.connectors.get(id);
    if (!connector) {
      return { success: false, scanId: '' };
    }

    if (connector.status !== 'CONNECTED') {
      return { success: false, scanId: '' };
    }

    const scanId = generateEntityId();
    connector.status = 'CONNECTING' as ConnectorStatus;
    this.connectors.set(id, connector);

    this.logger.info(`Started scan for connector: ${id}`, { scanId });

    return { success: true, scanId };
  }

  async getScanStatus(
    connectorId: EntityId,
    scanId: EntityId
  ): Promise<{
    status: string;
    filesDiscovered: number;
    filesFailed: number;
    progress: number;
  }> {
    const connector = this.connectors.get(connectorId);
    if (!connector) {
      return { status: 'NOT_FOUND', filesDiscovered: 0, filesFailed: 0, progress: 0 };
    }

    return {
      status: connector.status,
      filesDiscovered: connector.statistics.filesDiscovered,
      filesFailed: connector.statistics.filesFailed,
      progress: 0,
    };
  }

  async getConnectorHealth(id: EntityId): Promise<ConnectorHealth | null> {
    const connector = this.connectors.get(id);
    if (!connector) return null;

    return connector.health;
  }

  async listConnectorTypes(): Promise<ConnectorType[]> {
    return [
      'AWS_S3',
      'AZURE_BLOB',
      'GCS',
      'MICROSOFT_365',
      'GOOGLE_WORKSPACE',
      'SLACK',
      'SALESFORCE',
      'SERVICENOW',
      'GITHUB',
      'JIRA',
      'CONFLUENCE',
      'BOX',
      'DROPBOX',
    ] as ConnectorType[];
  }
}
