# Implementation Plan: Data Source Unification

**Branch**: `005-data-source-unification` | **Date**: 2025-12-11 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/005-data-source-unification/spec.md`

## Summary

將所有前端 API 調用統一指向 Go 後端（localhost:8080），使用 MySQL 資料庫作為單一資料來源。主要工作是修改前端環境變數配置，確認後端 CORS 設定，並驗證所有 API 端點正常運作。

## Technical Context

**Language/Version**: Go 1.21+ (backend), TypeScript/Next.js 14 (frontend)
**Primary Dependencies**: Gin, GORM, Axios, React Query
**Storage**: MySQL 8.0+
**Testing**: Manual integration testing (existing API endpoints)
**Target Platform**: Web (localhost development)
**Project Type**: Web application (frontend + backend)
**Performance Goals**: Standard web app expectations (<500ms p95)
**Constraints**: None specific to this feature
**Scale/Scope**: Development environment only

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Gate | Requirement | Status |
|------|-------------|--------|
| Security First | CORS restricted to known frontend origins | ✅ PASS (main.go:157-176) |
| API-First Design | RESTful, versioned endpoints | ✅ PASS (/api/v1 prefix) |
| Type Safety | TypeScript strict, Zod validation | ✅ PASS (existing setup) |
| Consistent Response Format | `{data: ...}` or `{error: ...}` | ✅ PASS (verified in handlers) |
| Environment Separation | Secrets in .env, not hardcoded | ✅ PASS (dotenv usage) |

**Result**: All gates pass. No violations requiring justification.

## Project Structure

### Documentation (this feature)

```text
specs/005-data-source-unification/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output (N/A - no new models)
├── quickstart.md        # Phase 1 output
└── tasks.md             # Phase 2 output (/speckit.tasks command)
```

### Source Code (repository root)

```text
backend/
├── cmd/server/main.go           # Entry point with CORS config ✓
├── internal/
│   ├── handlers/                # HTTP handlers ✓
│   ├── services/
│   │   └── county_service.go    # DB-based county statistics ✓
│   ├── models/                  # GORM models ✓
│   └── database/                # Migrations ✓
└── .env                         # Database credentials

frontend/
├── .env.local                   # API URL config (to be modified)
├── src/
│   ├── lib/
│   │   └── api.ts               # Axios client with NEXT_PUBLIC_API_URL
│   ├── hooks/
│   │   └── useCountyStats.ts    # County stats hook
│   └── pages/
│       └── api/v1/              # Mock APIs (to be bypassed)
```

**Structure Decision**: Existing web application structure is appropriate. No new directories needed.

## Key Implementation Points

### 1. Environment Configuration Change

**Current** (`frontend/.env.local`):
```
NEXT_PUBLIC_API_URL=/api/v1
```

**Target**:
```
NEXT_PUBLIC_API_URL=http://localhost:8080/api/v1
```

### 2. CORS Configuration

Backend already configured correctly in `main.go:157-176`:
- Allows `http://localhost:3000` by default
- Configurable via `FRONTEND_URL` environment variable
- Supports all required HTTP methods

### 3. API Endpoint Mapping

| Frontend Hook | Mock API Path | Backend API Path | Status |
|---------------|---------------|------------------|--------|
| useSchools | /api/v1/schools | /api/v1/schools | ✅ Ready |
| useStudents | /api/v1/students | /api/v1/students | ✅ Ready |
| useSportRecords | /api/v1/sport-records | /api/v1/sport-records | ✅ Ready |
| useSportTypes | /api/v1/sport-types | /api/v1/sport-types | ✅ Ready |
| useCountyStats | /api/v1/counties/statistics | /api/v1/counties/statistics | ✅ Ready |

### 4. Authentication Consideration

- Current Mock API login (`/api/auth/login`) uses frontend API route
- Backend auth not yet implemented (marked as TODO in main.go)
- **Decision**: Keep login using Mock API path, only switch data APIs to backend
- **Alternative**: Create environment variable to selectively route auth vs data APIs

## Risk Assessment

| Risk | Impact | Mitigation |
|------|--------|------------|
| Database empty after switch | High - No data displayed | Create seed data script or document manual data entry |
| Response format mismatch | Medium - Frontend errors | Verify backend response format matches frontend expectations |
| Auth token not sent to backend | Medium - 401 errors | Axios interceptor already adds Authorization header |
| CORS errors | High - API calls blocked | Backend CORS already configured for localhost:3000 |

## Complexity Tracking

> No violations requiring justification. Feature is a configuration change with minimal code impact.
