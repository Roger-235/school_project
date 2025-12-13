# Implementation Plan: Excel Batch Import

**Branch**: `007-excel-batch-import` | **Date**: 2025-12-13 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/007-excel-batch-import/spec.md`

## Summary

This feature enables teachers to batch import student lists and sport records via Excel files (.xlsx), dramatically reducing data entry time. The implementation uses `excelize` (Go library) for Excel parsing on the backend, with a preview/validation workflow before actual import execution.

## Technical Context

**Language/Version**: Go 1.21+ (backend), TypeScript 5.x with Next.js 14 Pages Router (frontend)
**Primary Dependencies**: Gin (routing), GORM (ORM), excelize (Excel parsing), React Hook Form + Zod (form validation), React Query (data fetching)
**Storage**: MySQL 8.0+ (existing database with students, sport_records, sport_types tables)
**Testing**: Go testing package (backend), Jest + React Testing Library (frontend)
**Target Platform**: Web application (desktop browsers primarily)
**Project Type**: Web application (backend + frontend)
**Performance Goals**: Import 500 rows in < 30 seconds; Preview generation < 5 seconds
**Constraints**: Max file size 5MB; Single transaction for data integrity; 95th percentile response < 500ms
**Scale/Scope**: ~100 concurrent users; typical import size 30-50 rows per session

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Requirement | Status | Notes |
|-----------|-------------|--------|-------|
| Security First | Input validation on client/server | ✅ PASS | Excel data validated server-side before DB insert |
| Security First | No sensitive data in logs | ✅ PASS | Only log import metadata, not student PII |
| API-First Design | RESTful endpoints with /api/v1 prefix | ✅ PASS | New endpoints under /api/v1/import/* |
| API-First Design | Consistent response format | ✅ PASS | Use existing {data: ...} / {error: ...} format |
| Type Safety | TypeScript strict mode, Zod validation | ✅ PASS | Define ImportRow, ImportResult types |
| Type Safety | Go structs with validation tags | ✅ PASS | Define request/response structs |
| Code Quality | Separation of concerns | ✅ PASS | Handler → Service → Repository pattern |
| Code Quality | Error handling with context | ✅ PASS | Return specific validation errors per row |

**Gate Result**: PASS - No violations identified

## Project Structure

### Documentation (this feature)

```text
specs/007-excel-batch-import/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
│   └── import-api.md    # Import API contract
└── tasks.md             # Phase 2 output (from /speckit.tasks)
```

### Source Code (repository root)

```text
backend/
├── internal/
│   ├── models/
│   │   └── import.go           # NEW: ImportSession, ImportRow models
│   ├── services/
│   │   └── import_service.go   # NEW: Excel parsing, validation logic
│   └── handlers/
│       └── import_handler.go   # NEW: Upload, preview, execute endpoints
└── cmd/server/main.go          # Add import routes

frontend/
├── src/
│   ├── components/
│   │   └── import/             # NEW: Import UI components
│   │       ├── ImportWizard.tsx
│   │       ├── FileUpload.tsx
│   │       ├── ScopeSelector.tsx
│   │       ├── PreviewTable.tsx
│   │       └── ImportResult.tsx
│   ├── pages/
│   │   └── import/             # NEW: Import pages
│   │       ├── students.tsx    # Student list import
│   │       └── records.tsx     # Sport records import
│   ├── hooks/
│   │   └── useImport.ts        # NEW: Import API hooks
│   ├── lib/
│   │   └── api/
│   │       └── import.ts       # NEW: Import API client
│   └── types/
│       └── import.ts           # NEW: Import types
└── public/
    └── templates/              # NEW: Downloadable Excel templates
        ├── student-list-template.xlsx
        └── sport-records-template.xlsx
```

**Structure Decision**: Web application structure following existing backend/frontend separation. New code organized under `import/` subdirectories to maintain feature isolation.

## Complexity Tracking

No constitution violations requiring justification.
