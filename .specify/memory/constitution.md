# ICACP Project Constitution

## Core Principles

### I. Security First (NON-NEGOTIABLE)
Security is the foundation of all development decisions:
- **Authentication & Authorization**: All endpoints must implement proper authentication; Role-based access control (RBAC) strictly enforced
- **Data Protection**: Passwords must be hashed with bcrypt (cost ≥10); JWT secrets must be strong and environment-specific; No sensitive data in logs or error messages
- **Input Validation**: All user inputs validated on both client and server; Use Zod (frontend) and Go validation (backend); Prevent SQL injection, XSS, and CSRF attacks
- **Environment Separation**: Secrets never hardcoded; `.env` files never committed to Git; Different credentials for dev/staging/prod

### II. API-First Design
Clear contracts between frontend and backend:
- **RESTful Principles**: Resources identified by URIs; Standard HTTP methods (GET, POST, PUT, DELETE); Meaningful status codes (200, 201, 400, 401, 403, 404, 500)
- **Consistent Response Format**:
  ```json
  // Success
  {"data": {...}}

  // Error
  {"error": {"code": "ERROR_CODE", "message": "Human message", "status": 400}}
  ```
- **API Versioning**: All endpoints prefixed with `/api/v1`; Breaking changes require new version
- **Documentation**: API endpoints documented in spec files; Request/response examples required

### III. Type Safety & Validation
Leverage TypeScript and Go's type systems:
- **Frontend**: TypeScript strict mode enabled; Zod schemas for all API payloads; No `any` types without justification
- **Backend**: Go structs with proper tags; GORM models match database schema; Validation before database operations
- **Shared Contracts**: Keep data models synchronized between frontend/backend; Document schema changes in specs

### IV. Test-Driven Development
Tests ensure reliability and prevent regressions:
- **Unit Tests**: Critical business logic must have unit tests; Auth service, validation functions, middleware
- **Integration Tests**: API endpoint tests required; Database operations tested; Authentication flow end-to-end
- **Frontend Tests**: Component tests for critical UI; Form validation tests
- **Test Coverage**: Aim for >70% coverage on backend; New features require corresponding tests

### V. Code Quality & Maintainability
Write code for humans, not just machines:
- **Clean Architecture**: Separation of concerns (handlers, services, models); No business logic in HTTP handlers; Database access only through services
- **Error Handling**: Meaningful error messages; Proper error propagation; Log errors with context
- **Code Style**:
  - Go: `gofmt`, standard Go conventions
  - TypeScript: ESLint, Prettier
  - Consistent naming: camelCase (TS/JS), snake_case (Go structs), PascalCase (types)
- **Documentation**: Complex logic requires comments; README for each major component; Keep CLAUDE.md updated

## Development Workflow

### Branch Strategy
- **main/master**: Production-ready code
- **Feature branches**: `{feature-id}-{description}` (e.g., `001-user-auth`)
- **No direct commits to main**: All changes via Pull Requests

### Code Review Requirements
- **Backend changes**: Security review for auth-related code; Database schema changes reviewed; Error handling verified
- **Frontend changes**: Type safety checked; UI/UX considerations; Accessibility basics (WCAG Level A)
- **Breaking changes**: Documented in PR description; Migration plan required

### Environment Management
- **Development**: Local development with `.env` files; Mock data acceptable; Verbose logging
- **Staging**: Mirror production setup; Real data (anonymized); Test deployments here first
- **Production**: Minimal logging; Strong secrets; Monitoring enabled

## Technology Standards

### Backend (Go)
- **Framework**: Gin (routing, middleware)
- **ORM**: GORM (database operations)
- **Authentication**: JWT (golang-jwt/jwt)
- **Password Hashing**: bcrypt
- **Migrations**: GORM AutoMigrate (dev), manual SQL (prod)

### Frontend (TypeScript/Next.js)
- **Framework**: Next.js 14 (Pages Router)
- **Styling**: Tailwind CSS
- **State Management**: React Query for server state
- **Forms**: React Hook Form + Zod validation
- **HTTP Client**: Axios with interceptors

### Database
- **RDBMS**: MySQL 8.0+
- **Character Set**: utf8mb4 (emoji support)
- **Timestamps**: Always include `created_at`, `updated_at`
- **Indexes**: Add indexes for foreign keys and frequently queried fields

## Security Requirements

### Authentication
- **Password Policy**: Minimum 8 characters; At least one letter and one number; Enforce on both client and server
- **JWT**: 24-hour expiration; HS256 algorithm; Include user ID, email, role in claims
- **Session Management**: Token stored in localStorage (dev/MVP); Consider httpOnly cookies for production

### Authorization
- **Whitelist for Admins**: Admin registration requires email in whitelist; Whitelist stored in environment variable
- **Role-Based Access**: Two roles: `admin` (full access), `school_staff` (limited)
- **Endpoint Protection**: Admin-only endpoints return 403 for non-admins

### Data Protection
- **Sensitive Fields**: `password_hash` never sent to frontend (use `json:"-"`)
- **SQL Injection**: Always use parameterized queries (GORM handles this)
- **CORS**: Restrict to known frontend origins only

## Performance Standards

### Backend
- **Response Time**: 95th percentile < 500ms for non-complex queries
- **Database**: Connection pooling configured (max 10 connections)
- **N+1 Queries**: Use GORM preloading to avoid

### Frontend
- **Page Load**: Initial load < 3s
- **Bundle Size**: Monitor with Next.js analyzer; Code splitting for large dependencies
- **API Calls**: Use React Query for caching; Avoid redundant requests

## Deployment

### Backend Deployment (AWS ECS Fargate)
- **Resources**: 0.25 vCPU, 0.5GB RAM (MVP)
- **Scaling**: Manual scaling initially; Auto-scaling after load testing
- **Health Checks**: `/health` endpoint for load balancer

### Frontend Deployment (Vercel)
- **Auto Deploy**: On push to main branch
- **Environment Variables**: Set via Vercel dashboard
- **Preview Deployments**: Automatic for PRs

## Governance

### Constitution Authority
- This constitution supersedes ad-hoc decisions
- Deviations require documented justification and team approval
- All code reviews must verify constitutional compliance

### Amendment Process
1. Propose amendment with rationale
2. Team discussion and feedback
3. Update constitution with version increment
4. Update affected documentation and code
5. Communicate changes to all team members

### Quality Gates
- **No merge without**: Passing tests; Code review approval; Constitutional compliance
- **Breaking changes**: Require migration guide; Deprecation period where possible
- **Security issues**: Immediate fix priority; Post-incident review

### Living Document
- Constitution reviewed quarterly
- Update CLAUDE.md when tech stack changes
- Retrospectives inform constitutional amendments

---

**Version**: 1.0.0
**Ratified**: 2025-11-14
**Last Amended**: 2025-11-14
**Project**: ICACP (User Authentication System MVP)
