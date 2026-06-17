import { Injectable } from '@nestjs/common';
import type { ConnectorType } from '@unifyos/shared-types';
import { ConsoleLogger } from '@unifyos/shared-utils';

export interface IConnector {
  type: ConnectorType;
  name: string;
  description: string;
  version: string;
  validateConfig(config: Record<string, unknown>): Promise<boolean>;
  connect(credentials: Record<string, unknown>): Promise<void>;
  disconnect(): Promise<void>;
  test(): Promise<boolean>;
  scan(
    options: Record<string, unknown>
  ): Promise<{
    total: number;
    successful: number;
    failed: number;
  }>;
}

@Injectable()
export class ConnectorRegistry {
  private readonly logger = new ConsoleLogger('ConnectorRegistry');
  private connectors: Map<ConnectorType, IConnector> = new Map();

  registerConnector(connector: IConnector): void {
    this.connectors.set(connector.type, connector);
    this.logger.info(`Registered connector: ${connector.type}`);
  }

  getConnector(type: ConnectorType): IConnector | null {
    return this.connectors.get(type) || null;
  }

  listConnectors(): ConnectorType[] {
    return Array.from(this.connectors.keys());
  }

  getConnectorInfo(type: ConnectorType): {
    name: string;
    description: string;
    version: string;
  } | null {
    const connector = this.getConnector(type);
    if (!connector) return null;

    return {
      name: connector.name,
      description: connector.description,
      version: connector.version,
    };
  }
}
