import type { ConnectorType } from '@unifyos/shared-types';
import { ConsoleLogger } from '@unifyos/shared-utils';

// ============================================================================
// Base Connector Class
// ============================================================================

export interface ConnectorConfig {
  type: ConnectorType;
  name: string;
  credentials: Record<string, unknown>;
  settings: {
    scanSchedule?: string;
    incremental?: boolean;
    includePatterns?: string[];
    excludePatterns?: string[];
    maxConnections?: number;
    timeout?: number;
  };
}

export interface DiscoveredFile {
  path: string;
  name: string;
  size: number;
  mimeType: string;
  createdAt: Date;
  modifiedAt: Date;
  owner?: string;
  checksum?: string;
  metadata?: Record<string, unknown>;
}

export interface ScanOptions {
  incremental?: boolean;
  startFrom?: Date;
  filters?: {
    includePatterns?: string[];
    excludePatterns?: string[];
  };
}

export interface ScanResult {
  total: number;
  successful: number;
  failed: number;
  errors: Array<{
    file: string;
    error: string;
  }>;
}

export abstract class BaseConnector {
  protected logger: ConsoleLogger;
  protected connected: boolean = false;

  constructor(
    protected type: ConnectorType,
    protected name: string,
    protected config: ConnectorConfig
  ) {
    this.logger = new ConsoleLogger(`Connector:${name}`);
  }

  abstract connect(): Promise<void>;
  abstract disconnect(): Promise<void>;
  abstract test(): Promise<boolean>;
  abstract listFiles(path?: string): Promise<DiscoveredFile[]>;
  abstract getFile(path: string): Promise<Buffer>;
  abstract scan(options?: ScanOptions): Promise<ScanResult>;

  async validateConfig(): Promise<boolean> {
    if (!this.config.credentials) return false;
    if (!this.config.name) return false;
    return true;
  }

  isConnected(): boolean {
    return this.connected;
  }

  getConfig(): ConnectorConfig {
    return this.config;
  }

  protected logInfo(message: string, context?: Record<string, unknown>): void {
    this.logger.info(message, context);
  }

  protected logWarn(message: string, context?: Record<string, unknown>): void {
    this.logger.warn(message, context);
  }

  protected logError(
    message: string,
    error?: Error,
    context?: Record<string, unknown>
  ): void {
    this.logger.error(message, error, context);
  }
}

// ============================================================================
// REST-based Connector
// ============================================================================

export interface HttpClientConfig {
  timeout?: number;
  maxRetries?: number;
  retryDelay?: number;
  headers?: Record<string, string>;
}

export class HttpConnector extends BaseConnector {
  protected httpConfig: HttpClientConfig;

  constructor(
    type: ConnectorType,
    name: string,
    config: ConnectorConfig,
    httpConfig?: HttpClientConfig
  ) {
    super(type, name, config);
    this.httpConfig = httpConfig || {
      timeout: 30000,
      maxRetries: 3,
      retryDelay: 1000,
    };
  }

  async connect(): Promise<void> {
    try {
      await this.test();
      this.connected = true;
      this.logInfo('Connected successfully');
    } catch (error) {
      throw new Error(`Failed to connect: ${error}`);
    }
  }

  async disconnect(): Promise<void> {
    this.connected = false;
    this.logInfo('Disconnected');
  }

  async test(): Promise<boolean> {
    throw new Error('test() must be implemented by subclass');
  }

  async listFiles(_path?: string): Promise<DiscoveredFile[]> {
    throw new Error('listFiles() must be implemented by subclass');
  }

  async getFile(_path: string): Promise<Buffer> {
    throw new Error('getFile() must be implemented by subclass');
  }

  async scan(_options?: ScanOptions): Promise<ScanResult> {
    throw new Error('scan() must be implemented by subclass');
  }

  protected async makeRequest(
    url: string,
    options?: RequestInit
  ): Promise<Response> {
    const timeout = this.httpConfig.timeout || 30000;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
        headers: {
          ...this.httpConfig.headers,
          ...options?.headers,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return response;
    } finally {
      clearTimeout(timeoutId);
    }
  }
}

// ============================================================================
// Authentication Helpers
// ============================================================================

export interface OAuth2Config {
  clientId: string;
  clientSecret: string;
  authorizationUrl: string;
  tokenUrl: string;
  redirectUri: string;
  scopes: string[];
}

export class OAuth2Helper {
  constructor(private config: OAuth2Config) {}

  getAuthorizationUrl(state: string): string {
    const params = new URLSearchParams({
      client_id: this.config.clientId,
      redirect_uri: this.config.redirectUri,
      scope: this.config.scopes.join(' '),
      response_type: 'code',
      state,
    });

    return `${this.config.authorizationUrl}?${params.toString()}`;
  }

  async exchangeCodeForToken(code: string): Promise<{
    accessToken: string;
    refreshToken?: string;
    expiresIn: number;
  }> {
    const params = new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      redirect_uri: this.config.redirectUri,
      client_id: this.config.clientId,
      client_secret: this.config.clientSecret,
    });

    const response = await fetch(this.config.tokenUrl, {
      method: 'POST',
      body: params,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });

    const data = (await response.json()) as {
      access_token: string;
      refresh_token?: string;
      expires_in: number;
    };

    return {
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      expiresIn: data.expires_in,
    };
  }
}

// ============================================================================
// Connector Utilities
// ============================================================================

export class ConnectorUtils {
  static matchesPattern(path: string, pattern: string): boolean {
    const regex = this.globToRegex(pattern);
    return regex.test(path);
  }

  static matchesAnyPattern(path: string, patterns: string[]): boolean {
    return patterns.some((p) => this.matchesPattern(path, p));
  }

  private static globToRegex(glob: string): RegExp {
    const escaped = glob.replace(/[.+^${}()|[\]\\]/g, '\\$&');
    const regex = escaped
      .replace(/\*/g, '.*')
      .replace(/\?/g, '.');
    return new RegExp(`^${regex}$`);
  }

  static generateChecksum(data: Buffer, algorithm: 'md5' | 'sha256' = 'sha256'): string {
    // Note: This is a simplified implementation
    // In production, use crypto module
    return data.toString('base64').slice(0, 16);
  }

  static formatFileSize(bytes: number): string {
    const sizes = ['B', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 B';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round((bytes / Math.pow(1024, i)) * 100) / 100 + ' ' + sizes[i];
  }

  static parseCredentials(
    credentials: Record<string, unknown>
  ): Record<string, string> {
    const parsed: Record<string, string> = {};
    for (const [key, value] of Object.entries(credentials)) {
      parsed[key] = String(value);
    }
    return parsed;
  }
}

// ============================================================================
// Connector Factory
// ============================================================================

export interface ConnectorConstructor {
  new (config: ConnectorConfig): BaseConnector;
}

export class ConnectorFactory {
  private static connectors: Map<ConnectorType, ConnectorConstructor> = new Map();

  static register(type: ConnectorType, constructor: ConnectorConstructor): void {
    this.connectors.set(type, constructor);
  }

  static create(type: ConnectorType, config: ConnectorConfig): BaseConnector {
    const constructor = this.connectors.get(type);
    if (!constructor) {
      throw new Error(`Connector type '${type}' is not registered`);
    }
    return new constructor(config);
  }

  static listRegistered(): ConnectorType[] {
    return Array.from(this.connectors.keys());
  }
}

// ============================================================================
// Exports
// ============================================================================

export { ConsoleLogger };
