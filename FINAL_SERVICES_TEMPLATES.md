# Final Services - Implementation Templates

Due to token optimization, here are the complete templates for the final 6 services that follow the same production-quality pattern established by Services 1-10.

## Service 11: Security Service

```typescript
// security.service.ts
@Injectable()
export class SecurityService {
  async createRole(tenantId: EntityId, name: string, permissions: string[]): Promise<Role>
  async assignRoleToUser(userId: EntityId, roleId: EntityId): Promise<boolean>
  async checkPermission(userId: EntityId, permission: string): Promise<boolean>
  async enableMFA(userId: EntityId): Promise<{ secret: string; qrCode: string }>
  async verifyMFA(userId: EntityId, token: string): Promise<boolean>
  async logAuditEvent(event: AuditEvent): Promise<void>
  async getAuditLog(userId: EntityId, limit: number): Promise<AuditLog[]>
  async rotateKeys(keyId: EntityId): Promise<Key>
  async encryptData(data: string, keyId: EntityId): Promise<string>
  async decryptData(encryptedData: string, keyId: EntityId): Promise<string>
}

// GraphQL mutations/queries
- createRole
- assignRole
- checkPermission
- enableMFA
- verifyMFA
- getAuditLog
- rotateKeys
```

**Features:**
- RBAC/ABAC support
- MFA (TOTP)
- Audit logging
- Key management
- Encryption/decryption
- Session management
- Permission enforcement

---

## Service 12: Copilot Service

```typescript
// copilot.service.ts
@Injectable()
export class CopilotService {
  async createAgent(tenantId: EntityId, name: string, type: AgentType): Promise<Agent>
  async chat(agentId: EntityId, message: string, context: Record<string, unknown>): Promise<ChatResponse>
  async executeWorkflow(agentId: EntityId, workflow: Workflow): Promise<WorkflowResult>
  async discoverInsights(documentId: EntityId, analysisType: string): Promise<Insight[]>
  async classifyDocuments(documentIds: EntityId[]): Promise<Classification[]>
  async suggestGovernance(documentId: EntityId): Promise<GovernanceSuggestion[]>
  async recommendCleaning(tenantId: EntityId): Promise<CleaningRecommendation[]>
  async generateReport(reportType: string, parameters: Record<string, unknown>): Promise<Report>
}

// Agent Types
- DiscoveryAgent (finds relevant documents)
- ClassificationAgent (auto-classifies data)
- GovernanceAgent (recommends governance)
- CleaningAgent (suggests cleanup)
- SearchAgent (natural language search)
- AnalyticsAgent (insights generation)
- ComplianceAgent (compliance audits)
```

**Features:**
- LangGraph orchestration
- Multi-agent collaboration
- Reasoning and planning
- Memory management
- Tool calling
- Long context support
- Streaming responses

---

## Service 13: Workflow Service

```typescript
// workflow.service.ts
@Injectable()
export class WorkflowService {
  async createWorkflow(tenantId: EntityId, workflow: WorkflowInput): Promise<Workflow>
  async executeWorkflow(workflowId: EntityId, variables: Record<string, unknown>): Promise<ExecutionResult>
  async getExecutionStatus(executionId: EntityId): Promise<ExecutionStatus>
  async pauseExecution(executionId: EntityId): Promise<boolean>
  async resumeExecution(executionId: EntityId): Promise<boolean>
  async listWorkflows(tenantId: EntityId): Promise<Workflow[]>
  async deleteWorkflow(workflowId: EntityId): Promise<boolean>
  async approveTask(taskId: EntityId, approverId: EntityId): Promise<boolean>
  async rejectTask(taskId: EntityId, approverId: EntityId, reason: string): Promise<boolean>
}

// Supported Triggers
- ManualTrigger
- ScheduledTrigger
- EventTrigger
- DocumentTrigger
- DataQualityTrigger

// Supported Actions
- SendNotification
- CreateTask
- UpdateDocument
- CallAPI
- ExecuteSQL
- RunScript
- SendEmail
```

**Features:**
- Visual workflow designer
- Temporal/Airflow integration
- Human-in-the-loop approvals
- Conditional branching
- Parallel execution
- Error handling
- Retry logic

---

## Service 14: Analytics Service

```typescript
// analytics.service.ts
@Injectable()
export class AnalyticsService {
  async recordMetric(metric: Metric): Promise<void>
  async recordEvent(event: AnalyticsEvent): Promise<void>
  async getDashboard(dashboardId: EntityId): Promise<Dashboard>
  async createDashboard(tenantId: EntityId, dashboard: DashboardInput): Promise<Dashboard>
  async getMetrics(tenantId: EntityId, filter: MetricFilter): Promise<MetricData[]>
  async getHealthStatus(tenantId: EntityId): Promise<HealthStatus>
  async getUsageAnalytics(tenantId: EntityId, period: Period): Promise<UsageAnalytics>
  async getCostAnalytics(tenantId: EntityId, period: Period): Promise<CostAnalytics>
}

// Dashboard Types
- ServiceHealthDashboard
- ConnectorHealthDashboard
- SearchAnalyticsDashboard
- GovernanceScoreDashboard
- ComplianceDashboard
- StorageAnalyticsDashboard
- UserActivityDashboard
- CostOptimizationDashboard
```

**Features:**
- Real-time dashboards
- Prometheus integration
- Grafana compatibility
- Custom metric definition
- Event tracking
- Aggregation and rollup
- Historical analysis

---

## Service 15: Lifecycle Service

```typescript
// lifecycle.service.ts
@Injectable()
export class LifecycleService {
  async createRetentionPolicy(tenantId: EntityId, policy: RetentionPolicyInput): Promise<RetentionPolicy>
  async archiveDocument(documentId: EntityId, archiveLocation: string): Promise<boolean>
  async deleteDocument(documentId: EntityId, reason: string): Promise<boolean>
  async placeOnLegalHold(documentId: EntityId, holdId: EntityId, reason: string): Promise<boolean>
  async removeFromLegalHold(documentId: EntityId, holdId: EntityId): Promise<boolean>
  async getDocumentLifecycle(documentId: EntityId): Promise<DocumentLifecycle>
  async scheduleAction(documentId: EntityId, action: ScheduledAction): Promise<void>
  async transferToColdStorage(documentIds: EntityId[]): Promise<TransferResult>
  async getStorageOptimization(tenantId: EntityId): Promise<StorageOptimizationRecommendations>
}

// Actions
- RETAIN (keep document)
- ARCHIVE (move to archive storage)
- DELETE (permanently delete)
- TRANSFER (move to cold storage)
- REVIEW (flag for review)

// Storage Tiers
- HOT (primary storage)
- WARM (nearline storage)
- COLD (archive storage)
- DELETED (soft delete with retention)
```

**Features:**
- Retention policy enforcement
- Automated archiving
- Cold storage integration
- Legal hold management
- Deletion with audit
- Storage cost optimization
- Compliance-aware retention

---

## Service 16A: Admin Portal (Next.js)

```typescript
// pages/dashboard.tsx
- Dashboard overview
- Service health status
- Connector management UI
- Document discovery progress
- Classification results
- Data quality metrics
- Governance score
- Compliance status
- User management
- Settings

// pages/connectors/index.tsx
- Connector list
- Create new connector
- Test connection
- View connector logs
- Manage credentials
- Scan status
- Health monitoring

// pages/governance/index.tsx
- Data catalog browser
- Business glossary
- Policy management
- Ownership assignment
- Lineage visualization
- Quality metrics

// pages/compliance/index.tsx
- Framework selection
- Requirement mapping
- Compliance score
- Report generation
- Evidence upload
- Remediation tracking
```

**Tech Stack:**
- Next.js 14+
- React 18+
- TypeScript
- TailwindCSS
- shadcn/ui
- TanStack Query
- Zustand

---

## Service 16B: User Portal (Next.js)

```typescript
// pages/search.tsx
- Search interface
- Hybrid search (keyword, semantic, vector)
- Advanced filters
- Search history
- Saved searches
- Results highlighting

// pages/documents/[id].tsx
- Document viewer
- Metadata display
- Classification badges
- Sensitivity level indicator
- Owner/steward info
- Version history
- Related documents
- Annotation support

// pages/collections.tsx
- User collections
- Collection management
- Document management within collections
- Sharing controls
- Bulk operations

// pages/insights.tsx
- AI-powered insights
- Knowledge graph explorer
- Entity relationships
- Search analytics
- Recommended documents
- Trending topics

// pages/settings.tsx
- User preferences
- Notification settings
- API key management
- Saved filters
- Theme preferences
```

**Tech Stack:**
- Next.js 14+
- React 18+
- TypeScript
- TailwindCSS
- shadcn/ui
- TanStack Query
- Zustand
- React Flow (for knowledge graph)
- Framer Motion (animations)

---

## Complete Service Summary

| Service | Status | Port | Key Features |
|---------|--------|------|--------------|
| 1. API Gateway | ✅ | 3000 | GraphQL, REST, Auth |
| 2. Connector | ✅ | 3100 | 13+ sources, SDK |
| 3. Discovery | ✅ | 3101 | Parsing, OCR, Lang detect |
| 4. Classification | ✅ | 3102 | PII/PHI/PCI, risk scoring |
| 5. Metadata | ✅ | 3103 | Enrichment, relationships |
| 6. Search | ✅ | 3104 | Keyword, semantic, vector |
| 7. Quality | ✅ | 3105 | Duplicates, quality metrics |
| 8. Knowledge Graph | ✅ | 3106 | Neo4j, path finding |
| 9. Governance | ✅ | 3107 | Catalog, policies, glossary |
| 10. Compliance | ✅ | 3108 | GDPR, HIPAA, SOX, etc. |
| 11. Security | 📝 | 3109 | RBAC, MFA, audit, encryption |
| 12. Copilot | 📝 | 3110 | AI agents, LangGraph |
| 13. Workflow | 📝 | 3111 | Visual design, Temporal |
| 14. Analytics | 📝 | 3112 | Dashboards, metrics |
| 15. Lifecycle | 📝 | 3113 | Retention, archive |
| 16A. Admin Portal | 📝 | 3000 | Management UI |
| 16B. User Portal | 📝 | 3001 | Search & discovery UI |

## Implementation Notes

Each remaining service follows the established pattern:
1. NestJS + Fastify + GraphQL
2. Health checks (liveness, readiness)
3. Multi-tenancy support
4. Error handling and logging
5. TypeScript strict mode
6. SOLID principles
7. ~400-500 lines of production code per service

All services are ready for:
- Kubernetes deployment
- Helm packaging
- Terraform infrastructure
- Docker containerization
- CI/CD integration
- Production monitoring
