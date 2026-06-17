# UnifyOS

**Production-Grade Enterprise Data Discovery, Governance, and Enrichment Platform**

UnifyOS is a complete, enterprise-scale platform for discovering, cleaning, governing, enriching, securing, and searching unstructured enterprise data across all sources—on-premises, cloud, or hybrid.

Comparable to Microsoft Purview, Informatica, BigID, Palantir Foundry, Databricks Unity Catalog, and Collibra, but open-source, extensible, and built for AI-first workflows.

## Key Capabilities

### 🔌 Enterprise Connector Platform
Connect to 30+ data sources including Microsoft 365, Google Workspace, Salesforce, ServiceNow, AWS S3, Azure, GCP, Slack, Box, Dropbox, Jira, Confluence, and more. Custom connector SDK for unlimited integrations.

### 🔍 Intelligent Data Discovery
Automatically discover, classify, and catalog billions of files across your enterprise. Support for PDF, Office, Images, Video, Audio, Code, Archives, CAD, and 50+ formats.

### 🧠 AI-Powered Enrichment
Automatic metadata generation, entity extraction, relationship detection, summarization, tagging, and knowledge graph population using state-of-the-art LLMs.

### 📊 Enterprise Search
Hybrid search combining keyword, semantic, vector, and knowledge graph search with permission-aware results and RAG integration.

### 🤖 Intelligent Copilot
Natural language interface with specialized AI agents for discovery, classification, governance, cleaning, compliance auditing, and workflow automation.

### 🛡️ Comprehensive Governance
Business glossary, data catalog, ownership, stewardship, data policies, retention, legal hold, audit logging, approval workflows, and lineage tracking.

### ✅ Compliance & Security
GDPR, HIPAA, CCPA, SOX, FedRAMP, SOC2, PCI-DSS, and NIST compliance. Zero Trust security, RBAC/ABAC, SSO, MFA, and immutable audit logs.

### 🌐 Knowledge Graph
Enterprise knowledge graph powered by Neo4j connecting documents, employees, customers, products, projects, departments, vendors, and more.

## Tech Stack

### Frontend
- **Next.js** + React + TypeScript
- **TailwindCSS** + shadcn/ui
- **TanStack Query** for data fetching
- **Zustand** for state management
- **AG Grid** for data tables
- **React Flow** for visual workflows
- **D3** for advanced visualizations
- **Monaco Editor** for code/config editing

### Backend
- **NestJS** for services
- **Fastify** for high-performance APIs
- **GraphQL** for admin APIs
- **REST** for integration APIs
- **gRPC** for service-to-service communication

### AI & LLMs
- **LangGraph** for AI agent orchestration
- **LangChain** for LLM integrations
- Support for OpenAI, Anthropic, Gemini, Ollama, and local LLMs
- **MCP** (Model Context Protocol) support

### Data
- **PostgreSQL** for relational data
- **Redis** for caching and messaging
- **MongoDB** for semi-structured data
- **Neo4j** for knowledge graphs
- **Elasticsearch** for full-text search
- **Qdrant** for vector embeddings
- **pgvector** for PostgreSQL vector operations
- **MinIO** for object storage
- **Apache Iceberg** for data lakehouse

### Streaming
- **Kafka** for event streaming
- **Debezium** for CDC (Change Data Capture)

### Data Processing
- **Apache Spark** for ETL
- **Apache Flink** for stream processing
- **Ray** for distributed ML

### Orchestration
- **Temporal** for workflow orchestration
- **Airflow** for data pipelines

### Infrastructure
- **Docker** for containerization
- **Kubernetes** for orchestration
- **Helm** for package management
- **Terraform** for IaC
- **ArgoCD** for GitOps
- **GitHub Actions** for CI/CD

### Observability
- **OpenTelemetry** for tracing
- **Prometheus** for metrics
- **Grafana** for dashboards
- **Loki** for log aggregation
- **Tempo** for distributed tracing

### Security
- **HashiCorp Vault** for secrets
- **Keycloak** for identity
- **OPA** for policy enforcement
- **SPIFFE** for identity in microservices

## Architecture

UnifyOS follows a modular, event-driven microservices architecture:

```
┌─────────────────────────────────────────────────────┐
│           User Portals & APIs                       │
│  ┌──────────────┬──────────────┬──────────────┐    │
│  │  Admin UI    │  User UI     │  Mobile SDK  │    │
│  └──────────────┴──────────────┴──────────────┘    │
└──────────────────┬────────────────────────────────┘
                   │
┌──────────────────▼────────────────────────────────┐
│  API Gateway (GraphQL + REST + gRPC)              │
└──────────────────┬────────────────────────────────┘
                   │
        ┌──────────┴──────────┬────────────┐
        │                     │            │
┌───────▼──────┐  ┌──────────▼───┐  ┌────▼──────────┐
│ Connectors   │  │ Discovery &  │  │ Search &      │
│ Service      │  │ Parsing      │  │ Knowledge     │
│ ┌──────────┐ │  │ Service      │  │ Graph Service │
│ │Microsoft │ │  │ ┌──────────┐ │  │ ┌───────────┐ │
│ │365       │ │  │ │OCR       │ │  │ │Elasticsearch│
│ ├──────────┤ │  │ ├──────────┤ │  │ ├───────────┤ │
│ │Google    │ │  │ │Language  │ │  │ │Qdrant     │ │
│ │Workspace │ │  │ │Detection │ │  │ │(Vectors)  │ │
│ ├──────────┤ │  │ ├──────────┤ │  │ ├───────────┤ │
│ │AWS S3    │ │  │ │Entity    │ │  │ │Neo4j      │ │
│ ├──────────┤ │  │ │Extraction│ │  │ │(Graph)    │ │
│ │Azure     │ │  │ └──────────┘ │  │ └───────────┘ │
│ │Slack     │ │  └──────────────┘  └───────────────┘
│ │Salesforce│ │
│ │+ 25 more │ │
│ └──────────┘ │
└──────────────┘

        ┌──────────┬──────────────┬──────────────┐
        │          │              │              │
┌───────▼──┐ ┌────▼──────┐ ┌────▼──────┐ ┌────▼──────┐
│Metadata  │ │ Data      │ │Governance │ │Compliance │
│Service   │ │Quality &  │ │Service    │ │Service    │
│ ┌──────┐ │ │Cleaning   │ │ ┌───────┐ │ │ ┌───────┐ │
│ │Tags  │ │ │Service    │ │ │Catalog│ │ │ │GDPR   │ │
│ ├──────┤ │ │ ┌──────┐  │ │ ├───────┤ │ │ ├───────┤ │
│ │Schema│ │ │ │Dupes │  │ │ │Glossry│ │ │ │HIPAA  │ │
│ ├──────┤ │ │ ├──────┤  │ │ ├───────┤ │ │ ├───────┤ │
│ │Owner │ │ │ │ROT   │  │ │ │Lineage│ │ │ │SOX    │ │
│ │      │ │ │ └──────┘  │ │ └───────┘ │ │ └───────┘ │
│ └──────┘ │ └───────────┘ │           │ │           │
└──────────┘               └───────────┘ └───────────┘

        ┌──────────┬──────────────┬──────────────┐
        │          │              │              │
┌───────▼──┐ ┌────▼──────┐ ┌────▼──────┐ ┌────▼──────┐
│Copilot & │ │Workflow   │ │Security   │ │Analytics  │
│AI Agents │ │Service    │ │Service    │ │Service    │
│ ┌──────┐ │ │ ┌──────┐  │ │ ┌───────┐ │ │ ┌───────┐ │
│ │Disc. │ │ │ │Visual│  │ │ │RBAC   │ │ │ │Metrics│ │
│ ├──────┤ │ │ │Design│  │ │ ├───────┤ │ │ ├───────┤ │
│ │Class.│ │ │ ├──────┤  │ │ │Audit  │ │ │ │Health │ │
│ ├──────┤ │ │ │Temporal  │ │ ├───────┤ │ │ ├───────┤ │
│ │Search│ │ │ │Airflow   │ │ │MFA    │ │ │ │Usage  │ │
│ │      │ │ │ └──────┘  │ │ └───────┘ │ │ └───────┘ │
│ └──────┘ │ └───────────┘ │           │ │           │
└──────────┘               └───────────┘ └───────────┘

                        ↓
        Event Bus (Kafka) | Message Queue (Redis)
                        ↓
        ┌────────────────────────────────────┐
        │    Core Data Layer                 │
        │  ┌──────────────────────────────┐  │
        │  │  PostgreSQL (Primary Store)  │  │
        │  ├──────────────────────────────┤  │
        │  │  Redis (Cache + Sessions)    │  │
        │  ├──────────────────────────────┤  │
        │  │  MongoDB (Documents)         │  │
        │  ├──────────────────────────────┤  │
        │  │  Neo4j (Knowledge Graph)     │  │
        │  ├──────────────────────────────┤  │
        │  │  Elasticsearch (Search Index)│  │
        │  ├──────────────────────────────┤  │
        │  │  MinIO (Object Storage)      │  │
        │  └──────────────────────────────┘  │
        └────────────────────────────────────┘
```

## Project Structure

```
unifyos/
├── apps/
│   ├── admin-portal/        # Next.js admin dashboard
│   ├── user-portal/         # Next.js user application
│   └── mobile-sdk/          # React Native mobile app
├── services/
│   ├── api-gateway/         # GraphQL + REST API gateway
│   ├── connector-service/   # Connector orchestration
│   ├── discovery-service/   # Data discovery engine
│   ├── metadata-service/    # Metadata management
│   ├── search-service/      # Search engine
│   ├── classification-service/
│   ├── quality-service/     # Data quality & cleaning
│   ├── knowledge-graph-service/
│   ├── copilot-service/     # AI agents & automation
│   ├── governance-service/  # Governance & catalog
│   ├── compliance-service/  # Compliance reporting
│   ├── security-service/    # Auth, RBAC, audit
│   ├── lifecycle-service/   # Retention, archive, delete
│   ├── workflow-service/    # Workflow orchestration
│   └── analytics-service/   # Analytics & reporting
├── packages/
│   ├── shared-types/        # Shared TypeScript types
│   ├── shared-ui/           # React components
│   ├── shared-utils/        # Utilities & helpers
│   ├── connector-sdk/       # SDK for building connectors
│   ├── typescript-sdk/      # TypeScript SDK
│   ├── python-sdk/          # Python SDK
│   ├── java-sdk/            # Java SDK
│   └── go-sdk/              # Go SDK
├── infra/
│   ├── docker/              # Docker setup
│   ├── kubernetes/          # K8s manifests
│   ├── helm/                # Helm charts
│   ├── terraform/           # IaC
│   └── github-actions/      # CI/CD workflows
├── docs/
│   ├── architecture/        # Architecture docs
│   ├── api/                 # API documentation
│   ├── deployment/          # Deployment guides
│   ├── development/         # Development guides
│   └── operations/          # Operational runbooks
├── examples/
│   ├── connectors/          # Example connectors
│   └── workflows/           # Example workflows
├── scripts/
│   ├── setup.sh             # Local setup
│   ├── migrate.sh           # DB migrations
│   └── seed.sh              # Seed data
├── package.json             # Root workspace config
├── turbo.json               # Turborepo config
├── tsconfig.json            # Root TypeScript config
└── README.md                # This file
```

## Quick Start

### Prerequisites
- Node.js 20+
- Docker & Docker Compose
- kubectl & Helm (for Kubernetes)
- Terraform (for IaC)

### Local Development

```bash
# Clone repository
git clone https://github.com/ChaitanyaJoshi1769/UnifyOS.git
cd UnifyOS

# Install dependencies
npm install

# Start local environment
docker-compose up -d

# Run database migrations
npm run migrate

# Seed sample data
npm run seed

# Start development servers
npm run dev

# Open admin portal
open http://localhost:3000

# Open user portal
open http://localhost:3001
```

### Docker Compose

```bash
# Build and start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### Kubernetes Deployment

```bash
# Initialize Terraform
npm run tf:init

# Plan infrastructure
npm run tf:plan

# Deploy infrastructure
npm run tf:apply

# Install via Helm
npm run helm:install

# Check deployment
kubectl get pods -n unifyos
```

## Development

### Structure & Commands

```bash
# Run all services in development
npm run dev

# Build all packages
npm run build

# Run all tests
npm run test

# Check coverage
npm run test:coverage

# Lint codebase
npm run lint

# Format code
npm run format

# Type check
npm run type-check
```

### Database Migrations

```bash
# Create migration
npm run db:migrate:create -- --name "create_users_table"

# Run migrations
npm run db:migrate:up

# Rollback
npm run db:migrate:down
```

### Testing

Every service includes:
- **Unit tests** (Jest)
- **Integration tests** (with test databases)
- **E2E tests** (full stack)
- **Performance tests**

Target coverage: **>90%**

```bash
# Run tests for all packages
npm run test

# Run tests for specific package
npm run test -- --filter=@unifyos/core

# Watch mode
npm run test -- --watch

# Coverage
npm run test:coverage
```

## API Documentation

### GraphQL API (Admin)
- **Admin Dashboard**: GraphQL API at `/graphql`
- **Schema**: Auto-generated at build time
- **Playground**: Available at `/graphql/playground`

### REST API (Integration)
- **Base URL**: `/api/v1`
- **OpenAPI/Swagger**: Available at `/api/v1/docs`
- **Status**: `/api/v1/health`

### gRPC API (Service-to-Service)
- **Port**: 5000
- **Proto definitions**: `packages/shared-types/proto/`

## Configuration

### Environment Variables

Copy `.env.example` to `.env.local` and configure:

```bash
# Database
DATABASE_URL=postgresql://user:pass@localhost:5432/unifyos
REDIS_URL=redis://localhost:6379

# LLM
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...

# Storage
MINIO_ENDPOINT=http://localhost:9000
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=minioadmin

# Search
ELASTICSEARCH_URL=http://localhost:9200

# Authentication
JWT_SECRET=your-secret-key
KEYCLOAK_URL=http://localhost:8080

# Services
API_GATEWAY_PORT=3000
ADMIN_PORTAL_PORT=3000
USER_PORTAL_PORT=3001
```

## Deployment

### Production Deployment

```bash
# Build Docker images
docker-compose build

# Push to registry
docker push your-registry/unifyos-api-gateway:latest

# Deploy with Terraform
terraform -chdir=infra/terraform apply

# Deploy with ArgoCD
argocd app create unifyos \
  --repo https://github.com/ChaitanyaJoshi1769/UnifyOS \
  --path infra/kubernetes/production
```

### Scaling

- **Horizontal scaling**: Services auto-scale based on CPU/memory
- **Database**: PostgreSQL with read replicas
- **Cache**: Redis cluster for high availability
- **Search**: Elasticsearch with multiple nodes
- **Storage**: MinIO with replication

## Security

### Zero Trust Architecture
- All service-to-service communication encrypted
- mTLS enforced
- Service identity via SPIFFE
- Policy enforcement via OPA

### Data Protection
- Encryption at rest (AES-256)
- Encryption in transit (TLS 1.3)
- Field-level encryption for sensitive data
- Key rotation via Vault

### Access Control
- RBAC (Role-Based Access Control)
- ABAC (Attribute-Based Access Control)
- ReBAC (Relationship-Based Access Control)
- SSO via Keycloak
- MFA support

### Audit & Compliance
- Immutable audit logs
- GDPR, HIPAA, SOX, FedRAMP compliance
- Compliance reporting dashboards
- Policy enforcement

## Monitoring & Observability

### Metrics
- Prometheus scrapes all services
- Grafana dashboards for visualization
- Pre-built dashboards for:
  - Service health
  - API latency
  - Database performance
  - Pipeline health
  - Connector status

### Logs
- Centralized logging via Loki
- Service logs indexed and queryable
- Structured logging with context

### Tracing
- Distributed tracing via Tempo
- OpenTelemetry instrumentation
- Trace correlation across services

### Alerting
- Alert manager for incident detection
- Slack/PagerDuty integration
- Custom alert rules per service

## Contributing

See [CONTRIBUTING.md](./docs/CONTRIBUTING.md) for guidelines.

## License

Apache License 2.0 - See [LICENSE](./LICENSE)

## Support

- **Documentation**: [docs/](./docs/)
- **Issues**: [GitHub Issues](https://github.com/ChaitanyaJoshi1769/UnifyOS/issues)
- **Discussions**: [GitHub Discussions](https://github.com/ChaitanyaJoshi1769/UnifyOS/discussions)

## Acknowledgments

Built with reference to industry leaders like Palantir Foundry, Databricks Unity Catalog, Microsoft Purview, and Informatica. Designed for enterprises that need production-grade data governance without compromise.
