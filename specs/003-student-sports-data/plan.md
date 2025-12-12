# Implementation Plan: 學生運動資料管理系統

**Branch**: `003-student-sports-data` | **Date**: 2025-12-01 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/003-student-sports-data/spec.md`

## Summary

建立完整的學生運動資料管理系統，讓教練和學校管理人員能夠建立學校與學生基本資料、記錄運動表現數據、搜尋學生資料，以及分析運動表現趨勢。系統重用 001-user-auth 的認證機制，並遵循 ACAP Constitution v1.0.0 的技術標準。

**MVP 範圍**: User Story 1 - 學校與學生資料建置 (P1)

## Technical Context

**Language/Version**: Go 1.21+ (Backend), TypeScript 5.x (Frontend)
**Primary Dependencies**: Gin (routing), GORM (ORM), Next.js 14 Pages Router, React Query v5, Tailwind CSS
**Storage**: MySQL 8.0+ (utf8mb4), Redis (caching from 002-map-visualization)
**Testing**: Go testing package, Jest + React Testing Library
**Target Platform**: Web (Desktop browsers, minimum 1024x768)
**Project Type**: Web application (frontend + backend)
**Performance Goals**: API response < 500ms (p95), Page load < 3s
**Constraints**: 20 concurrent users (MVP), Soft delete for data integrity
**Scale/Scope**: 1000 students per school, 500 records per student

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Requirement | Status | Notes |
|-------------|--------|-------|
| Security First - Authentication | ✅ Pass | Reuses 001-user-auth JWT mechanism |
| Security First - Data Protection | ✅ Pass | Passwords handled by existing auth |
| Security First - Input Validation | ✅ Pass | Zod (frontend) + Go validation (backend) |
| API-First Design | ✅ Pass | RESTful /api/v1 prefix, consistent response format |
| Type Safety | ✅ Pass | TypeScript strict mode, Go structs with tags |
| Test-Driven Development | ✅ Pass | Unit + integration tests planned |
| Clean Architecture | ✅ Pass | Separation: handlers, services, models |
| Database Standards | ✅ Pass | MySQL 8.0+, utf8mb4, timestamps, indexes |

## Project Structure

### Documentation (this feature)

```text
specs/003-student-sports-data/
├── spec.md              # Feature specification
├── plan.md              # This file
├── research.md          # Phase 0 output - technology decisions
├── data-model.md        # Phase 1 output - entity definitions
├── quickstart.md        # Phase 1 output - testing scenarios
├── contracts/           # Phase 1 output - API specifications
│   ├── school-api.md
│   ├── student-api.md
│   ├── sport-type-api.md
│   └── sport-record-api.md
├── checklists/
│   └── requirements.md  # Quality checklist
└── tasks.md             # Phase 2 output (/speckit.tasks command)
```

### Source Code (repository root)

```text
backend/
├── cmd/
│   └── server/
│       └── main.go
├── internal/
│   ├── models/
│   │   ├── school.go          # NEW: School entity
│   │   ├── student.go         # NEW: Student entity
│   │   ├── sport_type.go      # NEW: SportType entity
│   │   └── sport_record.go    # NEW: SportRecord entity
│   ├── services/
│   │   ├── school_service.go  # NEW: School CRUD
│   │   ├── student_service.go # NEW: Student CRUD + search
│   │   └── sport_record_service.go # NEW: Record management
│   ├── handlers/
│   │   ├── school_handler.go  # NEW: School API handlers
│   │   ├── student_handler.go # NEW: Student API handlers
│   │   └── sport_record_handler.go # NEW: Record API handlers
│   ├── middleware/
│   │   └── auth.go            # REUSE from 001-user-auth
│   └── database/
│       └── seed/
│           └── sport_types.go # NEW: Seed data for 17 sport types
└── tests/

frontend/
├── src/
│   ├── components/
│   │   ├── schools/           # NEW: School management UI
│   │   ├── students/          # NEW: Student management UI
│   │   └── records/           # NEW: Sport record UI
│   ├── pages/
│   │   ├── schools/           # NEW: School pages
│   │   │   ├── index.tsx      # School list
│   │   │   ├── [id].tsx       # School detail
│   │   │   └── new.tsx        # Create school
│   │   └── students/          # NEW: Student pages
│   │       ├── index.tsx      # Student list/search
│   │       ├── [id].tsx       # Student detail + records
│   │       └── new.tsx        # Create student
│   ├── hooks/
│   │   ├── useSchools.ts      # NEW: School data hooks
│   │   ├── useStudents.ts     # NEW: Student data hooks
│   │   └── useSportRecords.ts # NEW: Record data hooks
│   └── lib/
│       └── api/
│           ├── schools.ts     # NEW: School API client
│           ├── students.ts    # NEW: Student API client
│           └── sport-records.ts # NEW: Record API client
└── tests/
```

**Structure Decision**: Web application structure (Option 2) - extends existing 001-user-auth and 002-map-visualization codebase with new modules for school, student, and sport record management.

## Complexity Tracking

> No violations - all requirements align with Constitution standards.

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| N/A | N/A | N/A |

## Dependencies

### Existing (from 001-user-auth & 002-map-visualization)

- Gin framework for routing
- GORM for database operations
- JWT authentication middleware
- React Query for data fetching
- Axios for HTTP client
- Tailwind CSS for styling

### New Dependencies

**Backend**:
- None required (GORM handles new models)

**Frontend**:
- None required (existing stack sufficient)

## Integration Points

1. **Authentication**: Reuse `auth.AuthMiddleware()` from 001-user-auth
2. **County Data**: School's county field must match 002-map-visualization county names (22 Taiwan counties)
3. **Navigation**: Add schools/students links to existing navigation component

## Risk Assessment

| Risk | Impact | Mitigation |
|------|--------|------------|
| County name inconsistency | Medium | Validate against 22 county list from 002-map-visualization |
| Student number uniqueness | Low | Database unique constraint per school |
| Large record history | Medium | Pagination + indexing on sport_records table |
| Data migration (existing students) | N/A | New system, no migration needed |

## Next Steps

Phase 0 artifacts:
- [x] plan.md (this file)
- [x] research.md - Technology decisions

Phase 1 artifacts:
- [x] data-model.md - Entity definitions
- [x] contracts/ - API specifications
  - [x] school-api.md
  - [x] student-api.md
  - [x] sport-type-api.md
  - [x] sport-record-api.md
- [x] quickstart.md - Testing scenarios

Phase 2 (via /speckit.tasks):
- [ ] tasks.md - Implementation tasks

**Ready for Phase 2**: Run `/speckit.tasks` to generate implementation task list.
