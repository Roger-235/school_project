# Implementation Plan: 前端導覽流程增強 (Navigation Enhancement)

**Branch**: `004-navigation-enhancement` | **Date**: 2025-12-10 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/004-navigation-enhancement/spec.md`

## Summary

統一所有認證頁面（9個）使用 `MainLayout` 佈局元件取代 `ProtectedRoute`，確保每個頁面都有全域 Header 導航列和 Breadcrumb 路徑導航。此功能為純前端重構，無需後端變更。

## Technical Context

**Language/Version**: TypeScript 5.x with Next.js 14 (Pages Router)
**Primary Dependencies**: React 18, Next.js 14, MainLayout component, Header component, Breadcrumb component
**Storage**: N/A (純前端重構，無資料庫變更)
**Testing**: Manual testing per quickstart.md (Jest/React Testing Library optional)
**Target Platform**: Web browsers (desktop-first, responsive)
**Project Type**: Web application (frontend only for this feature)
**Performance Goals**: 頁面導航 < 300ms, 無增加額外 bundle size
**Constraints**: 不破壞現有功能，保持地圖頁面全螢幕體驗
**Scale/Scope**: 9 個頁面需要修改

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Gate | Status | Notes |
|------|--------|-------|
| Security First | ✅ PASS | MainLayout 已內建認證檢查，等同 ProtectedRoute |
| API-First Design | ✅ PASS | 無 API 變更，純前端重構 |
| Type Safety | ✅ PASS | 維持 TypeScript 嚴格模式，Breadcrumb props 有型別定義 |
| Test-Driven | ✅ PASS | Manual testing scenarios defined in quickstart.md |
| Code Quality | ✅ PASS | 遵循現有 Clean Architecture，元件分離 |
| Branch Strategy | ✅ PASS | `004-navigation-enhancement` 符合命名規範 |

**Result**: 所有 Gates 通過，可進入 Phase 0

## Project Structure

### Documentation (this feature)

```text
specs/004-navigation-enhancement/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output (minimal for this feature)
├── quickstart.md        # Phase 1 output
├── contracts/           # N/A (no API changes)
└── tasks.md             # Phase 2 output
```

### Source Code (repository root)

```text
frontend/
├── src/
│   ├── components/
│   │   ├── layout/
│   │   │   ├── MainLayout.tsx      # 主佈局元件 (已存在)
│   │   │   ├── Header.tsx          # 全域導航列 (已存在)
│   │   │   └── Breadcrumb.tsx      # 麵包屑導航 (已存在)
│   │   └── auth/
│   │       └── ProtectedRoute.tsx  # 認證保護 (將被取代)
│   └── pages/
│       ├── schools/
│       │   ├── new.tsx             # 需修改
│       │   └── [id]/
│       │       ├── index.tsx       # 需修改
│       │       └── edit.tsx        # 需修改
│       ├── students/
│       │   ├── new.tsx             # 需修改
│       │   └── [id]/
│       │       ├── index.tsx       # 需修改
│       │       ├── edit.tsx        # 需修改
│       │       └── records/
│       │           ├── new.tsx     # 需修改
│       │           └── [recordId]/
│       │               └── edit.tsx # 需修改
│       └── map.tsx                 # 需修改 (fullWidth 模式)
└── tests/
    └── manual/
        └── test-plan.md
```

**Structure Decision**: 使用現有的 Web application 結構，僅修改 9 個頁面檔案，不新增元件。

## Complexity Tracking

> 無違規需要說明，本功能為簡單重構。

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| N/A | N/A | N/A |
