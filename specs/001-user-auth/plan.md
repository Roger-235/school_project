# Implementation Plan: User Authentication System (MVP)

**Branch**: `001-user-auth` | **Date**: 2025-11-14 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-user-auth/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Implement a secure user authentication system for ACAP MVP with two user roles (admin and school_staff). Admins can self-register via email whitelist and create school staff accounts. All users authenticate using email + password, receive JWT tokens (24h expiration), and can logout. System enforces password complexity, input validation, and security best practices. No password reset, email verification, or MFA in MVP scope.

## Technical Context

**Language/Version**: Go 1.21+ (backend), TypeScript with Next.js 14 Pages Router (frontend)
**Primary Dependencies**:
- Backend: Gin (web framework), GORM (ORM), jwt-go (JWT), bcrypt (password hashing)
- Frontend: React Query (API state), shadcn/ui + Tailwind CSS (UI), Zod (validation)

**Storage**: Amazon RDS MySQL db.t3.micro (1GB RAM, single AZ) - users table only for this feature
**Testing**: Go testing package (backend unit/integration), manual testing (frontend flows)
**Target Platform**: AWS ECS Fargate (0.25 vCPU, 0.5GB RAM) + Vercel (frontend)
**Project Type**: Web application (separate backend + frontend)
**Performance Goals**:
- Login/registration < 3s p95
- Token validation < 100ms p95
- Support 20 concurrent users

**Constraints**:
- API response time < 500ms p95
- Database queries < 100ms p95
- Max 10 database connections
- Frontend initial load < 3s on 3G

**Scale/Scope**:
- MVP demo (<5 schools pilot)
- ~20 concurrent users max
- 2 roles, 5 API endpoints (register, login, logout, create user, validate token)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### I. MVP-First Development ✅ PASS

- **Feature on approved list**: YES - "User authentication (Email + Password, 2 roles only: admin, school staff)" is item #1 on constitution's MUST Implement list
- **Minimum viable scope**: YES - No password reset, email verification, MFA, or social login per spec
- **Can ship in 3-4 months**: YES - Authentication is ~2-3 week effort within overall MVP timeline

### II. Resource Constraints ✅ PASS

- **Database**: Single `users` table fits well within 15-table limit, minimal storage footprint
- **Connection pooling**: JWT validation doesn't require DB hit (validates signature locally), only login/registration hit DB
- **Query optimization**: Simple indexed lookups on email (unique key), no N+1 patterns
- **CPU/Memory**: Bcrypt password hashing is CPU-intensive but acceptable for <20 concurrent users on 0.25 vCPU
- **Cache usage**: No caching needed for authentication endpoints (each request validates token cryptographically)

### III. Technology Stack Adherence ✅ PASS

- **Backend**: Go 1.21+ with Gin and GORM - EXACT match to constitution
- **Frontend**: Next.js 14 Pages Router with TypeScript - EXACT match to constitution
- **UI**: Tailwind CSS + shadcn/ui - EXACT match to constitution
- **State**: React Query for API state - EXACT match to constitution
- **No deviations**: All dependencies align with locked stack

### IV. Performance Standards ✅ PASS

- **API Response Time**: Login/register can meet <500ms p95 (bcrypt hashing ~50-100ms, DB query <50ms)
- **Database Queries**: Single indexed SELECT on email column <100ms p95 easily achievable
- **Concurrent Users**: 20 concurrent users supported (authentication is lightweight)
- **Frontend Load**: Login/register forms minimal (< 100KB bundle), <3s load achievable

### V. Feature Scope Boundaries ✅ PASS

- **On MUST Implement list**: YES - Constitution item #1
- **Explicitly excludes forbidden features**: YES - Spec explicitly defers password reset, email verification, MFA, social login (all on "MUST NOT Implement" list)
- **No scope creep**: Spec adheres strictly to MVP authentication needs

### VI. Simplicity & Maintainability ✅ PASS

- **Boring solutions**: Standard bcrypt + JWT pattern (industry-proven, 10+ years old)
- **No premature optimization**: Direct GORM queries, no Repository pattern needed for single table
- **Clear intent**: Authentication logic straightforward (register → hash password → insert user; login → query user → compare hash → issue JWT)
- **No complex abstractions**: Service layer only, no middleware complexity

### VII. Data Integrity & Security ✅ PASS

- **Input validation**: Spec requires frontend + backend validation (FR-022 to FR-026)
- **SQL injection**: GORM ORM prevents SQL injection via parameterized queries
- **Password hashing**: Spec requires bcrypt one-way hashing (FR-020, FR-021)
- **JWT tokens**: 24h expiration per constitution requirement
- **HTTPS**: Production deployment on AWS/Vercel enforces HTTPS
- **Error handling**: Spec requires generic login errors (FR-027), specific registration errors (FR-028)

### Complexity Budget Compliance ✅ PASS

- **Endpoints**: 5 endpoints (register admin, login, logout, create school staff, protected resource middleware) - well within <20 limit
- **Database Tables**: 1 table (`users`) - well within <15 limit
- **Frontend Pages**: 2 pages (login, register) - well within <10 limit
- **Development Time**: Estimated 2-3 weeks - well within 3-4 month MVP timeline
- **External Dependencies**:
  - Backend: 4 libs (Gin, GORM, jwt-go, bcrypt) - within <10 limit
  - Frontend: 3 libs (React Query, shadcn/ui, Zod) - within <10 limit

**GATE RESULT**: ✅ ALL CHECKS PASS - Proceed to Phase 0 Research

---

## Post-Phase 1 Constitution Re-Check

*Re-evaluation after research.md, data-model.md, contracts/, and quickstart.md completed.*

### I. MVP-First Development ✅ PASS

- **Design Complexity**: Single-table database, 5 REST endpoints, standard bcrypt+JWT pattern
- **Implementation Scope**: Estimated 2-3 weeks per quickstart guide
- **No Scope Creep**: All design artifacts strictly follow spec requirements, no additional features added

### II. Resource Constraints ✅ PASS

- **Database Schema**: 1 table (`users`) with 7 columns, well within limits
- **API Endpoints**: 5 endpoints documented in auth-api.yaml, within <20 limit
- **Performance Optimization**: Indexed email lookups (<100ms), JWT validation without DB hit, bcrypt cost 10 appropriate for load

### III. Technology Stack Adherence ✅ PASS

- **Backend Dependencies**: Gin, GORM, jwt-go, bcrypt, cors - all align with constitution
- **Frontend Dependencies**: Next.js 14 Pages Router, React Query, Zod, Tailwind CSS - exact matches
- **No Deviations**: Zero unapproved libraries introduced

### IV. Performance Standards ✅ PASS

- **Benchmarks Documented**: Login <3s p95, token validation <100ms, DB queries <50ms (research.md)
- **Load Profile**: Designed for 20 concurrent users, well within infrastructure capacity
- **Optimization Strategy**: Connection pooling (10 max), indexed queries, stateless JWT

### V. Feature Scope Boundaries ✅ PASS

- **API Contracts**: auth-api.yaml documents only specified endpoints, no extras
- **Data Model**: Single `users` entity, no audit logs or complex relationships (appropriate for MVP)
- **Quickstart Guide**: Implementation steps match spec exactly, no additional features

### VI. Simplicity & Maintainability ✅ PASS

- **Code Structure**: Clear separation (handler/service/model), no Repository pattern overhead
- **Standard Patterns**: Industry-standard bcrypt+JWT, RESTful design, direct GORM queries
- **Documentation**: Comprehensive quickstart with step-by-step implementation guide

### VII. Data Integrity & Security ✅ PASS

- **Security Measures**: bcrypt hashing, JWT signature validation, CORS configuration, input validation (data-model.md)
- **SQL Injection Prevention**: GORM parameterized queries throughout
- **Sensitive Data Handling**: password_hash never serialized to JSON, JWT secret from env var

### Complexity Budget Re-Check ✅ PASS

**Post-Design Counts**:
- **Endpoints**: 5 (register, login, logout, me, create user) - well within <20 ✓
- **Database Tables**: 1 (users) - well within <15 ✓
- **Frontend Pages**: 3 documented (login, register, create-user) - well within <10 ✓
- **Backend Dependencies**: 6 (Gin, GORM, MySQL driver, jwt-go, bcrypt, cors) - within <10 ✓
- **Frontend Dependencies**: 6 (Next.js, React, React Query, Zod, axios, Tailwind) - within <10 ✓

**FINAL GATE RESULT**: ✅ ALL CHECKS PASS - Ready for Phase 2 (Task Generation)

## Project Structure

### Documentation (this feature)

```text
specs/001-user-auth/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
│   ├── auth-api.yaml    # OpenAPI spec for auth endpoints
│   └── jwt-schema.json  # JWT payload schema
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
backend/
├── cmd/
│   └── server/
│       └── main.go                 # Application entry point
├── internal/
│   ├── auth/
│   │   ├── handler.go              # Auth HTTP handlers
│   │   ├── service.go              # Business logic (register, login, validate)
│   │   ├── middleware.go           # JWT validation middleware
│   │   └── whitelist.go            # Email whitelist loader
│   ├── models/
│   │   └── user.go                 # User entity (GORM model)
│   ├── database/
│   │   └── db.go                   # Database connection + migrations
│   └── config/
│       └── config.go               # Environment config loader
├── tests/
│   ├── integration/
│   │   └── auth_test.go            # Full auth flow tests
│   └── unit/
│       ├── auth_service_test.go    # Service layer tests
│       └── whitelist_test.go       # Whitelist validation tests
├── go.mod
├── go.sum
└── Dockerfile

frontend/
├── src/
│   ├── pages/
│   │   ├── login.tsx               # Login page
│   │   ├── register.tsx            # Admin self-registration page
│   │   ├── admin/
│   │   │   └── create-user.tsx     # Admin creates school staff
│   │   └── _app.tsx                # App wrapper with auth context
│   ├── components/
│   │   ├── auth/
│   │   │   ├── LoginForm.tsx       # Login form component
│   │   │   ├── RegisterForm.tsx    # Registration form component
│   │   │   └── ProtectedRoute.tsx  # Route guard HOC
│   │   └── ui/                     # shadcn/ui components
│   ├── lib/
│   │   ├── api.ts                  # API client (axios/fetch wrapper)
│   │   ├── auth.ts                 # Auth utilities (token storage, validation)
│   │   └── validation.ts           # Zod schemas for forms
│   ├── hooks/
│   │   └── useAuth.ts              # React Query hooks for auth
│   └── context/
│       └── AuthContext.tsx         # Auth state context
├── tests/
│   └── manual/
│       └── test-plan.md            # Manual test scenarios
├── package.json
├── tsconfig.json
└── next.config.js
```

**Structure Decision**: Web application structure (Option 2) selected because:
- Feature requires both backend API and frontend UI
- Backend (Go/Gin) serves RESTful API for authentication operations
- Frontend (Next.js/TypeScript) provides user-facing forms and token management
- Clear separation allows independent deployment (ECS Fargate + Vercel)
- Aligns with constitution's technology stack requirements

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

No violations detected. All constitution checks passed without requiring justification.
