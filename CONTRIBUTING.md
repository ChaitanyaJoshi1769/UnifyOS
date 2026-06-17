# Contributing to UnifyOS

Thank you for your interest in contributing to UnifyOS! This document provides guidelines and instructions for contributing to the project.

## Code of Conduct

All contributors are expected to follow the [Code of Conduct](./CODE_OF_CONDUCT.md). Please be respectful and professional in all interactions.

## Getting Started

### Prerequisites
- Node.js 20+
- Docker & Docker Compose
- Git
- Familiarity with TypeScript, React, and NestJS

### Setup

```bash
# Clone the repository
git clone https://github.com/ChaitanyaJoshi1769/UnifyOS.git
cd UnifyOS

# Install dependencies
npm install

# Copy environment file
cp .env.example .env.local

# Start local infrastructure
docker-compose up -d

# Run migrations
npm run migrate

# Start development servers
npm run dev
```

## Development Workflow

### Branch Naming
- `feature/description` - New features
- `fix/description` - Bug fixes
- `docs/description` - Documentation
- `refactor/description` - Refactoring
- `test/description` - Tests
- `chore/description` - Build, dependencies, etc.

### Commit Messages
Follow conventional commits:

```
type(scope): description

Detailed explanation if needed.

Fixes #issue-number
```

Types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`

### Pull Requests

1. Create a feature branch from `main`
2. Make your changes with clear, focused commits
3. Add tests for new functionality
4. Update documentation as needed
5. Run linting and tests: `npm run lint && npm run test`
6. Push to your fork and create a pull request

PR requirements:
- Passes all checks
- Code review approved
- Test coverage maintained (>90%)
- Documentation updated

## Code Guidelines

### TypeScript
- Strict mode enabled
- Explicit return types required
- No `any` types without justification
- Use meaningful variable names

### NestJS Services
- Providers should be dependency-injected
- Use decorators appropriately
- Implement error handling
- Add logging with context
- Create unit tests

### React Components
- Use functional components with hooks
- Prop types should be explicit
- Create reusable components
- Test user interactions
- Optimize performance

### Database
- All schema changes via migrations
- Use transactions for related changes
- Add indexes for performance
- Document breaking changes

### Testing
- Unit tests for business logic
- Integration tests for APIs
- E2E tests for critical flows
- Aim for >90% coverage

```bash
# Run tests
npm run test

# Check coverage
npm run test:coverage

# Run specific test
npm run test -- --testPathPattern=auth
```

### Linting & Formatting

```bash
# Check linting
npm run lint

# Auto-format code
npm run format

# Type check
npm run type-check
```

## Documentation

- Update README.md for user-facing changes
- Add ADRs (Architecture Decision Records) for architectural changes
- Document new APIs in OpenAPI/GraphQL schemas
- Keep deployment docs current

## Submitting Issues

When reporting bugs, include:
- Clear, descriptive title
- Steps to reproduce
- Expected vs actual behavior
- Environment details (OS, versions)
- Logs/screenshots if applicable

For feature requests, include:
- Use case/motivation
- Proposed solution (if any)
- Alternative approaches considered

## Review Process

1. **Automated Checks**: CI pipeline runs tests and linting
2. **Code Review**: At least one maintainer review
3. **Testing**: Manual testing by reviewer if needed
4. **Approval**: Maintainer approval required
5. **Merge**: Squash and merge to maintain clean history

## Release Process

1. Update version in `package.json`
2. Update `CHANGELOG.md`
3. Create release branch
4. Tag release in Git
5. Publish Docker images
6. Create GitHub release

## Performance & Optimization

When making changes, consider:
- Query performance (use EXPLAIN)
- API response times
- Memory usage
- Build time impact
- Bundle size for frontend

## Security

- Never commit secrets or credentials
- Use environment variables for config
- Report security issues responsibly
- Keep dependencies updated
- Follow OWASP guidelines

## Questions & Support

- Check existing issues/discussions first
- Use GitHub Discussions for questions
- Join our Slack community
- Check documentation at `/docs`

## Recognition

Contributors are recognized in:
- README.md contributors section
- Release notes
- Community page

Thank you for contributing to UnifyOS!
