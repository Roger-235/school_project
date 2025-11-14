<!--
Sync Impact Report:
- Version change: N/A (initial) → 1.0.0
- Modified principles: None (new constitution)
- Added sections:
  - Core Principles (7 principles)
  - MVP Scope Management
  - Development Workflow
  - Governance
- Removed sections: None
- Templates requiring updates:
  ✅ plan-template.md - reviewed, constitution check section aligns
  ✅ spec-template.md - reviewed, user stories and requirements align
  ✅ tasks-template.md - reviewed, task phases align with MVP-first approach
  ✅ All command files - reviewed, no agent-specific references found
- Follow-up TODOs: None - all placeholders filled
-->

# ACAP (全台原住民學童運動員培育系統) Constitution - MVP Edition

## Core Principles

### I. MVP-First Development (NON-NEGOTIABLE)

**Rule**: Every feature MUST be scoped to the minimum viable implementation that demonstrates value for budget approval.

- New features start with the question: "What's the absolute minimum to demo this capability?"
- Features not on the "✅ 必做功能" list in this constitution MUST NOT be implemented without explicit approval
- When in doubt between two approaches, choose the simpler one that can ship in 3-4 months
- "Future enhancement" suggestions MUST be documented but deferred

**Rationale**: The MVP's sole purpose is securing formal budget. Feature creep jeopardizes the timeline and dilutes the demo impact.

### II. Resource Constraints (NON-NEGOTIABLE)

**Rule**: All implementations MUST respect the AWS infrastructure limits defined in this constitution.

- Database: Amazon RDS MySQL db.t3.micro (1GB RAM, single AZ)
  - MUST use connection pooling (max 10 connections)
  - MUST optimize all queries for minimal resource usage
  - NO N+1 query patterns allowed
- Backend: ECS Fargate (0.25 vCPU, 0.5GB RAM)
  - MUST use efficient algorithms and data structures
  - MUST implement graceful degradation under load
- Cache: Redis ElastiCache cache.t3.micro
  - MUST cache: county stats (15 min), school lists (30 min), dashboard (10 min)
  - Cache hit ratio MUST exceed 80%

**Rationale**: Budget constraints are fixed for MVP phase. Exceeding these limits means infrastructure redesign or budget overrun.

### III. Technology Stack Adherence

**Rule**: Technology choices are locked for MVP consistency and team velocity.

**Backend**:
- Language: Go 1.21+ ONLY
- Framework: Gin (web framework)
- ORM: GORM
- NO other frameworks or ORMs without documented justification

**Frontend**:
- Framework: Next.js 14 with Pages Router (NOT App Router)
- Language: TypeScript (strict mode enabled)
- UI: Tailwind CSS + shadcn/ui ONLY
- State: React Query + Context API (NO Redux/MobX)
- Maps: Leaflet.js ONLY
- Charts: Recharts ONLY

**Rationale**: Locked stack prevents "technology churn" and ensures all team members work with familiar tools.

### IV. Performance Standards

**Rule**: All features MUST meet these performance targets on the constrained infrastructure.

- API Response Time: < 500ms p95 for all endpoints
- Database Queries: < 100ms p95
- Cache Hit Ratio: > 80%
- Frontend Initial Load: < 3s on 3G connection
- Frontend Page Transitions: < 1s
- Concurrent Users: Support 20 concurrent users minimum (展示用足夠)

**Rationale**: Demo effectiveness depends on snappy performance. Slow demos lose audience confidence.

### V. Feature Scope Boundaries

**Rule**: The following features are EXPLICITLY FORBIDDEN in MVP unless user explicitly overrides.

**✅ MUST Implement**:
1. User authentication (Email + Password, 2 roles only: admin, school staff)
2. Taiwan map visualization (county-level coloring, click for stats)
3. County detail page (school map markers, basic stats, school list)
4. School detail page (student list with pagination, basic charts)
5. Student data management (add, edit, view forms)
6. Basic dashboard (total students, top 5 counties, simple charts)

**❌ MUST NOT Implement** (unless explicitly requested):
- Batch import (Excel/CSV)
- Complex reporting system
- Fine-grained permissions (only 2 roles allowed)
- Email notifications
- Password reset (manual admin process acceptable)
- Student growth tracking
- Predictive analytics
- Mobile apps
- Real-time notifications

**Rationale**: Clear boundaries prevent scope drift and keep the team focused on demo-critical features.

### VI. Simplicity & Maintainability

**Rule**: Code MUST prioritize clarity and maintainability over cleverness.

- Choose boring, proven solutions over cutting-edge approaches
- NO premature optimization - profile before optimizing
- NO complex abstractions without clear need (e.g., Repository pattern requires justification)
- Code MUST include clear comments explaining "why", not "what"
- Database schema MUST use simple, normalized design (no over-engineering)

**Rationale**: MVP code will be inherited by the production team. Complex code increases handoff risk.

### VII. Data Integrity & Security

**Rule**: Despite being MVP, security and data integrity are NON-NEGOTIABLE.

- Input validation: ALL user inputs MUST be validated (backend + frontend)
- SQL injection: ALWAYS use parameterized queries via GORM (NO raw SQL without review)
- XSS protection: ALWAYS sanitize outputs in frontend
- Authentication: JWT tokens with reasonable expiration (24h)
- HTTPS: MUST be enforced in production (via Vercel/CloudFront)
- Sensitive data: NO passwords or tokens in logs or error messages
- CORS: Properly configured for frontend-backend communication

**Rationale**: Security breaches during demo would be fatal. Data integrity issues undermine credibility.

## MVP Scope Management

### Feature Request Process

1. **Initial Filter**: Is this feature on the "✅ 必做功能" list?
   - YES → Proceed with design
   - NO → Document as "Future Enhancement" and defer

2. **Complexity Check**: Can this be implemented in < 5 person-days?
   - YES → Proceed
   - NO → Break down or defer

3. **Resource Check**: Does this fit within infrastructure constraints?
   - YES → Proceed
   - NO → Redesign or defer

4. **Demo Value Check**: Does this significantly improve demo impact?
   - YES → Prioritize
   - NO → Lower priority or defer

### Complexity Budget

The entire MVP MUST fit within these limits:

- Total Development Time: 3-4 months
- Backend Endpoints: < 20 RESTful endpoints
- Database Tables: < 15 tables
- Frontend Pages: < 10 pages/routes
- External Dependencies: < 10 third-party libraries per stack (backend/frontend)

Exceeding any limit requires explicit justification and user approval.

## Development Workflow

### Code Quality Gates (Every PR)

1. **Constitution Compliance**:
   - Verify feature is on approved list
   - Check resource usage patterns
   - Confirm technology stack adherence

2. **Performance Validation**:
   - Database queries reviewed for efficiency
   - Caching strategy implemented where applicable
   - No obvious performance red flags

3. **Security Review**:
   - Input validation present
   - No raw SQL (except justified exceptions)
   - Output sanitization for XSS

4. **Simplicity Check**:
   - Code is readable and maintainable
   - No unnecessary abstractions
   - Clear comments on non-obvious logic

### Testing Strategy (Lightweight for MVP)

- **Backend**:
  - Unit tests for business logic (core services only)
  - Integration tests for critical paths (authentication, data CRUD)
  - NO 100% coverage requirement (target: 60% for core paths)

- **Frontend**:
  - Manual testing for all user flows
  - Automated E2E tests OPTIONAL (defer if time-constrained)
  - Focus on cross-browser compatibility (Chrome, Safari, Firefox)

- **Performance**:
  - Load test dashboard with 20 concurrent users
  - Verify database stays within connection pool limits
  - Cache hit ratio monitoring in place

**Rationale**: Comprehensive testing is valuable but not critical for MVP demo. Focus on "does it work for the demo scenario?"

### Git Workflow

- **Branches**: Feature branches off `master` (e.g., `feature/county-map`)
- **Commits**: Clear, descriptive messages in English or Chinese
- **PRs**: Require 1 approval, but prioritize velocity over perfection
- **Deployment**: Manual deployments to staging for testing before demo

## Governance

### Constitution Authority

This constitution SUPERSEDES all other development practices, preferences, or conventions for the ACAP MVP phase.

When conflict arises:
1. Constitution wins over personal preference
2. MVP scope boundaries win over "nice to have" features
3. Resource constraints win over ideal solutions

### Amendment Process

Constitution changes require:
1. **Documented Justification**: Why is the change needed?
2. **Impact Assessment**: What features/code are affected?
3. **User Approval**: Explicit sign-off from project stakeholder

Amendments trigger version bumps:
- **MAJOR** (X.0.0): Removing/redefining core principles or scope boundaries
- **MINOR** (x.Y.0): Adding new principles or expanding guidance
- **PATCH** (x.y.Z): Clarifications, typo fixes, non-semantic changes

### Compliance Review

Every sprint/week:
- Review completed features against constitution
- Identify scope creep and address immediately
- Update "Future Enhancements" list with deferred items

Every PR:
- Reviewer checks constitution compliance
- Reject PRs that violate scope boundaries without justification

### Runtime Development Guidance

For day-to-day development decisions not covered by this constitution, developers should:
1. Consult existing project documentation (README.md, plan.md files)
2. Apply "simplest solution that works" heuristic
3. When in doubt, ask for clarification rather than assume

**Version**: 1.0.0 | **Ratified**: 2025-11-14 | **Last Amended**: 2025-11-14
