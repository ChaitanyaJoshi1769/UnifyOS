// ============================================================================
// Core Entity Types
// ============================================================================

export type UUID = string & { readonly __brand: 'UUID' };
export type EntityId = UUID;

export interface BaseEntity {
  id: EntityId;
  createdAt: Date;
  updatedAt: Date;
  createdBy: EntityId;
  updatedBy: EntityId;
  deleted: boolean;
  deletedAt?: Date;
}

export enum TenantType {
  ORGANIZATION = 'ORGANIZATION',
  DEPARTMENT = 'DEPARTMENT',
  PROJECT = 'PROJECT',
  BUSINESS_UNIT = 'BUSINESS_UNIT',
}

export interface Tenant extends BaseEntity {
  type: TenantType;
  name: string;
  description?: string;
  logo?: string;
  parentTenantId?: EntityId;
  settings: Record<string, unknown>;
  metadata: Record<string, unknown>;
}

// ============================================================================
// User & Authentication Types
// ============================================================================

export enum UserRole {
  SUPER_ADMIN = 'SUPER_ADMIN',
  ADMIN = 'ADMIN',
  STEWARD = 'STEWARD',
  ANALYST = 'ANALYST',
  VIEWER = 'VIEWER',
  CUSTOM = 'CUSTOM',
}

export interface User extends BaseEntity {
  tenantId: EntityId;
  email: string;
  firstName: string;
  lastName: string;
  avatar?: string;
  roles: UserRole[];
  permissions: string[];
  isActive: boolean;
  lastLogin?: Date;
  mfaEnabled: boolean;
  department?: string;
  manager?: EntityId;
}

export interface AuthToken {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  tokenType: 'Bearer';
}

// ============================================================================
// Connector Types
// ============================================================================

export enum ConnectorType {
  // Cloud Storage
  AWS_S3 = 'AWS_S3',
  AZURE_BLOB = 'AZURE_BLOB',
  GCS = 'GCS',
  // Productivity
  MICROSOFT_365 = 'MICROSOFT_365',
  GOOGLE_WORKSPACE = 'GOOGLE_WORKSPACE',
  SLACK = 'SLACK',
  // CRM & Business
  SALESFORCE = 'SALESFORCE',
  SERVICENOW = 'SERVICENOW',
  SAP = 'SAP',
  ORACLE = 'ORACLE',
  // Development
  GITHUB = 'GITHUB',
  GITLAB = 'GITLAB',
  JIRA = 'JIRA',
  CONFLUENCE = 'CONFLUENCE',
  // Storage
  BOX = 'BOX',
  DROPBOX = 'DROPBOX',
  SHAREPOINT = 'SHAREPOINT',
  // Databases
  SNOWFLAKE = 'SNOWFLAKE',
  DATABRICKS = 'DATABRICKS',
  POSTGRESQL = 'POSTGRESQL',
  MONGODB = 'MONGODB',
  // File Systems
  NAS = 'NAS',
  FTP = 'FTP',
  SFTP = 'SFTP',
  // Custom
  CUSTOM = 'CUSTOM',
}

export enum ConnectorStatus {
  CONFIGURED = 'CONFIGURED',
  CONNECTING = 'CONNECTING',
  CONNECTED = 'CONNECTED',
  DISCONNECTED = 'DISCONNECTED',
  ERROR = 'ERROR',
  SUSPENDED = 'SUSPENDED',
}

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

export interface Connector extends BaseEntity {
  tenantId: EntityId;
  config: ConnectorConfig;
  status: ConnectorStatus;
  health: {
    isHealthy: boolean;
    lastHealthCheck?: Date;
    errorMessage?: string;
    successRate: number;
  };
  statistics: {
    filesDiscovered: number;
    filesFailed: number;
    lastScanAt?: Date;
    totalScanTime?: number;
  };
}

export interface ConnectorCredential {
  id: EntityId;
  tenantId: EntityId;
  connectorType: ConnectorType;
  encryptedPayload: string;
  expiresAt?: Date;
}

// ============================================================================
// Data Discovery Types
// ============================================================================

export enum FileFormat {
  PDF = 'PDF',
  DOCX = 'DOCX',
  XLSX = 'XLSX',
  PPTX = 'PPTX',
  TXT = 'TXT',
  CSV = 'CSV',
  JSON = 'JSON',
  XML = 'XML',
  HTML = 'HTML',
  IMAGE = 'IMAGE',
  VIDEO = 'VIDEO',
  AUDIO = 'AUDIO',
  CODE = 'CODE',
  ARCHIVE = 'ARCHIVE',
  DATABASE = 'DATABASE',
  CAD = 'CAD',
  EMAIL = 'EMAIL',
  UNKNOWN = 'UNKNOWN',
}

export interface FileMetadata {
  name: string;
  extension: string;
  format: FileFormat;
  mimeType: string;
  size: number;
  createdAt: Date;
  modifiedAt: Date;
  accessedAt?: Date;
  owner?: string;
  checksum: string; // MD5 or SHA256
  isEncrypted: boolean;
  language: string;
}

export enum DocumentStatus {
  DISCOVERED = 'DISCOVERED',
  PARSING = 'PARSING',
  PARSED = 'PARSED',
  INDEXED = 'INDEXED',
  ERROR = 'ERROR',
  ARCHIVED = 'ARCHIVED',
  DELETED = 'DELETED',
}

export interface Document extends BaseEntity {
  tenantId: EntityId;
  connectorId: EntityId;
  path: string;
  metadata: FileMetadata;
  status: DocumentStatus;
  content?: string; // Full text content
  contentHash?: string;
  size: number;
  format: FileFormat;
  owner?: string;
  permissions?: {
    owner?: string[];
    group?: string[];
    public?: boolean;
  };
  tags: string[];
  labels: string[];
  summary?: string;
  embedding?: number[]; // Vector embedding
  language: string;
  confidence?: number;
  versions?: DocumentVersion[];
}

export interface DocumentVersion {
  id: EntityId;
  documentId: EntityId;
  version: number;
  checksum: string;
  createdAt: Date;
  createdBy: EntityId;
  description?: string;
}

// ============================================================================
// Classification Types
// ============================================================================

export enum SensitivityLevel {
  PUBLIC = 'PUBLIC',
  INTERNAL = 'INTERNAL',
  CONFIDENTIAL = 'CONFIDENTIAL',
  RESTRICTED = 'RESTRICTED',
  SECRET = 'SECRET',
}

export enum DataClassification {
  // PII/Privacy
  PII = 'PII',
  SENSITIVE_PII = 'SENSITIVE_PII',
  // Healthcare
  PHI = 'PHI',
  HIPAA = 'HIPAA',
  // Financial
  PCI = 'PCI',
  FINANCIAL = 'FINANCIAL',
  ACCOUNTING = 'ACCOUNTING',
  // Compliance
  GDPR = 'GDPR',
  CCPA = 'CCPA',
  SOX = 'SOX',
  // Business
  INTELLECTUAL_PROPERTY = 'INTELLECTUAL_PROPERTY',
  TRADE_SECRET = 'TRADE_SECRET',
  STRATEGIC = 'STRATEGIC',
  // Document Types
  CONTRACT = 'CONTRACT',
  INVOICE = 'INVOICE',
  PURCHASE_ORDER = 'PURCHASE_ORDER',
  PATENT = 'PATENT',
  // HR
  HR_RECORD = 'HR_RECORD',
  EMPLOYMENT_AGREEMENT = 'EMPLOYMENT_AGREEMENT',
  // Engineering
  SOURCE_CODE = 'SOURCE_CODE',
  ARCHITECTURE = 'ARCHITECTURE',
  TECHNICAL_SPEC = 'TECHNICAL_SPEC',
  // Legal
  LEGAL_DOCUMENT = 'LEGAL_DOCUMENT',
  NDA = 'NDA',
  // Default
  UNCLASSIFIED = 'UNCLASSIFIED',
}

export interface ClassificationResult {
  documentId: EntityId;
  classifications: Array<{
    type: DataClassification;
    confidence: number;
    reason?: string;
  }>;
  sensitivityLevel: SensitivityLevel;
  containsPII: boolean;
  containsPHI: boolean;
  containsPCI: boolean;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  riskScore: number; // 0-100
  detectedEntities: DetectedEntity[];
  recommendedActions: string[];
  classifiedAt: Date;
  classifiedBy: EntityId;
}

export interface DetectedEntity {
  type: string; // EMAIL, PHONE, SSN, CC_NUMBER, etc.
  value: string;
  confidence: number;
  position: {
    start: number;
    end: number;
  };
  shouldRedact: boolean;
}

// ============================================================================
// Metadata & Enrichment Types
// ============================================================================

export interface MetadataField {
  name: string;
  value: unknown;
  type: 'string' | 'number' | 'boolean' | 'date' | 'array' | 'object';
  confidence?: number;
  source?: string;
}

export interface DocumentMetadata extends BaseEntity {
  tenantId: EntityId;
  documentId: EntityId;
  title?: string;
  description?: string;
  author?: string;
  department?: string;
  businessUnit?: string;
  project?: string;
  keywords: string[];
  topics: Array<{
    name: string;
    confidence: number;
  }>;
  entities: Array<{
    type: string;
    value: string;
    confidence: number;
  }>;
  relationships: Array<{
    targetId: EntityId;
    type: string;
    confidence: number;
  }>;
  customFields: Record<string, MetadataField>;
  schema?: string; // Schema ID
  enrichedAt?: Date;
  enrichedBy?: EntityId;
}

// ============================================================================
// Data Quality Types
// ============================================================================

export enum QualityIssueType {
  DUPLICATE = 'DUPLICATE',
  NEAR_DUPLICATE = 'NEAR_DUPLICATE',
  MISSING_METADATA = 'MISSING_METADATA',
  INVALID_METADATA = 'INVALID_METADATA',
  BROKEN_REFERENCE = 'BROKEN_REFERENCE',
  CORRUPTED_FILE = 'CORRUPTED_FILE',
  OBSOLETE_FILE = 'OBSOLETE_FILE',
  ORPHAN_FILE = 'ORPHAN_FILE',
  NAMING_VIOLATION = 'NAMING_VIOLATION',
  VERSION_CONFLICT = 'VERSION_CONFLICT',
  ENCODING_ISSUE = 'ENCODING_ISSUE',
}

export interface QualityIssue extends BaseEntity {
  tenantId: EntityId;
  documentId: EntityId;
  type: QualityIssueType;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  description: string;
  detectedAt: Date;
  detectedBy: EntityId;
  relatedDocuments?: EntityId[];
  suggestedActions: Array<{
    action: string;
    description: string;
    confidence: number;
    automated: boolean;
  }>;
  resolved: boolean;
  resolvedAt?: Date;
  resolvedBy?: EntityId;
}

export interface QualityMetrics {
  completeness: number; // 0-100
  accuracy: number; // 0-100
  consistency: number; // 0-100
  validity: number; // 0-100
  uniqueness: number; // 0-100
  timelineess: number; // 0-100
  overall: number; // 0-100
}

// ============================================================================
// Knowledge Graph Types
// ============================================================================

export enum EntityType {
  DOCUMENT = 'DOCUMENT',
  PERSON = 'PERSON',
  ORGANIZATION = 'ORGANIZATION',
  PRODUCT = 'PRODUCT',
  PROJECT = 'PROJECT',
  DEPARTMENT = 'DEPARTMENT',
  LOCATION = 'LOCATION',
  CONTRACT = 'CONTRACT',
  POLICY = 'POLICY',
  ASSET = 'ASSET',
  VENDOR = 'VENDOR',
  CUSTOMER = 'CUSTOMER',
  APPLICATION = 'APPLICATION',
  DATABASE = 'DATABASE',
  PROCESS = 'PROCESS',
  REGULATION = 'REGULATION',
}

export enum RelationType {
  OWNS = 'OWNS',
  CREATED_BY = 'CREATED_BY',
  MODIFIED_BY = 'MODIFIED_BY',
  REFERENCES = 'REFERENCES',
  DEPENDS_ON = 'DEPENDS_ON',
  RELATED_TO = 'RELATED_TO',
  PART_OF = 'PART_OF',
  CONTAINS = 'CONTAINS',
  MENTIONS = 'MENTIONS',
  INVOLVES = 'INVOLVES',
  GOVERNS = 'GOVERNS',
  COMPLIES_WITH = 'COMPLIES_WITH',
  IMPLEMENTS = 'IMPLEMENTS',
}

export interface KnowledgeGraphNode extends BaseEntity {
  tenantId: EntityId;
  externalId: string; // Reference to entity (document ID, employee ID, etc.)
  type: EntityType;
  name: string;
  description?: string;
  properties: Record<string, unknown>;
  metadata: Record<string, unknown>;
}

export interface KnowledgeGraphEdge extends BaseEntity {
  tenantId: EntityId;
  sourceNodeId: EntityId;
  targetNodeId: EntityId;
  type: RelationType;
  weight: number; // 0-1, confidence score
  metadata: Record<string, unknown>;
}

// ============================================================================
// Search Types
// ============================================================================

export enum SearchType {
  KEYWORD = 'KEYWORD',
  SEMANTIC = 'SEMANTIC',
  VECTOR = 'VECTOR',
  GRAPH = 'GRAPH',
  HYBRID = 'HYBRID',
  RAG = 'RAG',
}

export interface SearchQuery {
  query: string;
  type: SearchType;
  filters?: {
    tenantId?: EntityId;
    classification?: DataClassification[];
    sensitivityLevel?: SensitivityLevel[];
    documentType?: FileFormat[];
    connectorId?: EntityId[];
    owner?: string;
    tags?: string[];
    dateRange?: {
      from?: Date;
      to?: Date;
    };
    sizeRange?: {
      min?: number;
      max?: number;
    };
  };
  limit?: number;
  offset?: number;
  sort?: Array<{
    field: string;
    order: 'ASC' | 'DESC';
  }>;
}

export interface SearchResult {
  documentId: EntityId;
  title: string;
  snippet: string;
  score: number; // 0-1, relevance score
  path: string;
  owner?: string;
  modified?: Date;
  classifications: DataClassification[];
  tags: string[];
  highlights?: string[];
}

export interface SearchResults {
  query: string;
  results: SearchResult[];
  total: number;
  hasMore: boolean;
  executionTime: number; // milliseconds
}

// ============================================================================
// Governance Types
// ============================================================================

export interface DataOwner {
  userId: EntityId;
  email: string;
  name: string;
  department?: string;
}

export interface DataSteward {
  userId: EntityId;
  email: string;
  name: string;
  responsibilities: string[];
  department?: string;
}

export interface DataCatalogEntry extends BaseEntity {
  tenantId: EntityId;
  documentId: EntityId;
  name: string;
  description: string;
  owner: DataOwner;
  stewards: DataSteward[];
  businessGlossaryTerms: string[];
  lineage?: {
    upstream: EntityId[];
    downstream: EntityId[];
  };
  quality: QualityMetrics;
  lastReviewedAt?: Date;
  lastReviewedBy?: EntityId;
  reviewCycle: 'QUARTERLY' | 'SEMI_ANNUAL' | 'ANNUAL';
}

export interface BusinessGlossaryTerm extends BaseEntity {
  tenantId: EntityId;
  term: string;
  definition: string;
  owner: DataOwner;
  steward: DataSteward;
  acronym?: string;
  relatedTerms: string[];
  dataAssets: EntityId[];
  policies: EntityId[];
}

export interface DataPolicy extends BaseEntity {
  tenantId: EntityId;
  name: string;
  description: string;
  category: 'RETENTION' | 'ACCESS' | 'USAGE' | 'QUALITY' | 'SECURITY' | 'COMPLIANCE';
  classification?: DataClassification;
  rules: PolicyRule[];
  owner: DataOwner;
  approvedBy?: EntityId;
  effectiveDate: Date;
  expiryDate?: Date;
  status: 'DRAFT' | 'PUBLISHED' | 'SUPERSEDED' | 'ARCHIVED';
}

export interface PolicyRule {
  name: string;
  condition: Record<string, unknown>;
  action: Record<string, unknown>;
  priority: number;
}

// ============================================================================
// Compliance Types
// ============================================================================

export enum ComplianceFramework {
  GDPR = 'GDPR',
  HIPAA = 'HIPAA',
  CCPA = 'CCPA',
  SOX = 'SOX',
  ISO_27001 = 'ISO_27001',
  FEDRAMP = 'FEDRAMP',
  SOC2 = 'SOC2',
  PCI_DSS = 'PCI_DSS',
  NIST = 'NIST',
}

export interface ComplianceMapping extends BaseEntity {
  tenantId: EntityId;
  framework: ComplianceFramework;
  requirement: string;
  mappedPolicies: EntityId[];
  mappedControls: EntityId[];
  status: 'COMPLIANT' | 'NON_COMPLIANT' | 'PARTIALLY_COMPLIANT';
  evidence: string[];
  lastAssessedAt?: Date;
  lastAssessedBy?: EntityId;
  remediationDeadline?: Date;
}

export interface ComplianceReport extends BaseEntity {
  tenantId: EntityId;
  framework: ComplianceFramework;
  period: {
    from: Date;
    to: Date;
  };
  summary: string;
  findings: Array<{
    id: string;
    title: string;
    description: string;
    severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    recommendation: string;
    evidence: string[];
  }>;
  overallStatus: 'COMPLIANT' | 'NON_COMPLIANT' | 'PARTIALLY_COMPLIANT';
  complianceScore: number; // 0-100
  generatedAt: Date;
  generatedBy: EntityId;
}

// ============================================================================
// Retention & Lifecycle Types
// ============================================================================

export enum RetentionAction {
  RETAIN = 'RETAIN',
  ARCHIVE = 'ARCHIVE',
  DELETE = 'DELETE',
  REVIEW = 'REVIEW',
}

export interface RetentionPolicy extends BaseEntity {
  tenantId: EntityId;
  name: string;
  description: string;
  classification?: DataClassification;
  retentionPeriod: {
    duration: number;
    unit: 'DAYS' | 'MONTHS' | 'YEARS';
  };
  action: RetentionAction;
  legalHold: boolean;
  exceptions?: string[];
  owner: DataOwner;
  status: 'ACTIVE' | 'INACTIVE';
}

export interface DocumentLifecycle extends BaseEntity {
  tenantId: EntityId;
  documentId: EntityId;
  status: DocumentStatus;
  currentAction?: RetentionAction;
  scheduledAction?: {
    action: RetentionAction;
    scheduledAt: Date;
  };
  history: Array<{
    status: DocumentStatus;
    action: RetentionAction;
    timestamp: Date;
    performedBy: EntityId;
    reason?: string;
  }>;
  legalHoldUntil?: Date;
}

// ============================================================================
// Workflow Types
// ============================================================================

export enum WorkflowStatus {
  DRAFT = 'DRAFT',
  PUBLISHED = 'PUBLISHED',
  ARCHIVED = 'ARCHIVED',
  ACTIVE = 'ACTIVE',
  PAUSED = 'PAUSED',
}

export enum NodeType {
  START = 'START',
  END = 'END',
  TASK = 'TASK',
  DECISION = 'DECISION',
  APPROVAL = 'APPROVAL',
  TRIGGER = 'TRIGGER',
  ACTION = 'ACTION',
  CONDITION = 'CONDITION',
}

export interface WorkflowNode {
  id: string;
  type: NodeType;
  label: string;
  config: Record<string, unknown>;
  position: {
    x: number;
    y: number;
  };
}

export interface WorkflowEdge {
  id: string;
  source: string;
  target: string;
  label?: string;
  condition?: Record<string, unknown>;
}

export interface Workflow extends BaseEntity {
  tenantId: EntityId;
  name: string;
  description: string;
  status: WorkflowStatus;
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
  triggers: string[];
  variables: Record<string, unknown>;
  owner: EntityId;
  createdBy: EntityId;
  lastModifiedBy: EntityId;
}

export interface WorkflowExecution extends BaseEntity {
  tenantId: EntityId;
  workflowId: EntityId;
  documentId?: EntityId;
  status: 'RUNNING' | 'COMPLETED' | 'FAILED' | 'PAUSED';
  startedAt: Date;
  completedAt?: Date;
  failureReason?: string;
  variables: Record<string, unknown>;
  executionPath: string[];
  output?: Record<string, unknown>;
}

// ============================================================================
// API & Integration Types
// ============================================================================

export interface APIKey extends BaseEntity {
  tenantId: EntityId;
  name: string;
  description?: string;
  keyHash: string; // Hashed for security
  scopes: string[];
  isActive: boolean;
  expiresAt?: Date;
  lastUsedAt?: Date;
  createdBy: EntityId;
}

export interface WebhookSubscription extends BaseEntity {
  tenantId: EntityId;
  name: string;
  url: string;
  events: string[];
  isActive: boolean;
  headers?: Record<string, string>;
  retryPolicy: {
    maxRetries: number;
    backoffMultiplier: number;
  };
  createdBy: EntityId;
}

export interface AuditLog extends BaseEntity {
  tenantId: EntityId;
  userId: EntityId;
  action: string;
  resourceType: string;
  resourceId: EntityId;
  changes?: Record<string, { before: unknown; after: unknown }>;
  status: 'SUCCESS' | 'FAILURE';
  errorMessage?: string;
  ipAddress?: string;
  userAgent?: string;
  timestamp: Date;
}

// ============================================================================
// Analytics & Reporting Types
// ============================================================================

export interface AnalyticsMetric {
  name: string;
  value: number;
  unit: string;
  timestamp: Date;
  dimensions?: Record<string, string>;
}

export interface Dashboard extends BaseEntity {
  tenantId: EntityId;
  name: string;
  description?: string;
  owner: EntityId;
  widgets: DashboardWidget[];
  isPublic: boolean;
  tags: string[];
}

export interface DashboardWidget {
  id: string;
  type: string;
  title: string;
  config: Record<string, unknown>;
  position: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

// ============================================================================
// Error Types
// ============================================================================

export interface APIError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
  timestamp: Date;
  requestId: string;
}

// ============================================================================
// Pagination Types
// ============================================================================

export interface PaginationParams {
  limit: number;
  offset: number;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  limit: number;
  offset: number;
  hasMore: boolean;
}

// ============================================================================
// Helper Functions
// ============================================================================

export function createUUID(): UUID {
  return crypto.randomUUID() as UUID;
}
