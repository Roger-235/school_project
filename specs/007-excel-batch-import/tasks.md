# Tasks: Excel Batch Import

**Input**: Design documents from `/specs/007-excel-batch-import/`
**Prerequisites**: plan.md (required), spec.md (required), research.md, data-model.md, contracts/

**Tests**: Tests are NOT explicitly requested in the feature specification. Only essential validation tasks included.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Backend**: `backend/internal/` (handlers, services, models)
- **Frontend**: `frontend/src/` (components, pages, hooks, lib, types)

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Install dependencies and create base structure

- [ ] T001 Install excelize dependency in backend: `cd backend && go get github.com/xuri/excelize/v2`
- [ ] T002 [P] Create import types in `frontend/src/types/import.ts`
- [ ] T003 [P] Create import model structs in `backend/internal/models/import.go`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [ ] T004 Implement PreviewStore (in-memory storage with TTL) in `backend/internal/services/preview_store.go`
- [ ] T005 Implement date parsing utilities in `backend/internal/services/import_utils.go`
- [ ] T006 [P] Create ImportService base structure in `backend/internal/services/import_service.go`
- [ ] T007 [P] Create ImportHandler base structure in `backend/internal/handlers/import_handler.go`
- [ ] T008 Register import routes in `backend/cmd/server/main.go`
- [ ] T009 [P] Create API client base in `frontend/src/lib/api/import.ts`
- [ ] T010 [P] Create useImport hook base in `frontend/src/hooks/useImport.ts`

**Checkpoint**: Foundation ready - user story implementation can now begin

---

## Phase 3: User Story 1 - Student List Import (Priority: P1) 🎯 MVP

**Goal**: 老師可以下載學生名單模板、填寫資料、上傳並批次建立學生

**Independent Test**: 下載模板 → 填寫 5 位學生 → 上傳 → 預覽 → 確認匯入 → 驗證資料庫中學生已建立

### Backend Implementation (US1)

- [ ] T011 [US1] Create student list Excel template generation in `backend/internal/services/template_service.go`
- [ ] T012 [US1] Implement student template download endpoint in `backend/internal/handlers/import_handler.go` (GET /templates/students)
- [ ] T013 [US1] Implement student Excel parsing in `backend/internal/services/import_service.go` (parseStudentExcel)
- [ ] T014 [US1] Implement student row validation in `backend/internal/services/import_service.go` (validateStudentRow)
- [ ] T015 [US1] Implement student preview endpoint in `backend/internal/handlers/import_handler.go` (POST /students/preview)
- [ ] T016 [US1] Implement student import execution in `backend/internal/services/import_service.go` (ExecuteStudentImport)
- [ ] T017 [US1] Implement student execute endpoint in `backend/internal/handlers/import_handler.go` (POST /students/execute)

### Frontend Implementation (US1)

- [ ] T018 [P] [US1] Create FileUpload component in `frontend/src/components/import/FileUpload.tsx`
- [ ] T019 [P] [US1] Create SchoolSelector component in `frontend/src/components/import/SchoolSelector.tsx`
- [ ] T020 [US1] Create PreviewTable component in `frontend/src/components/import/PreviewTable.tsx`
- [ ] T021 [US1] Create ImportResult component in `frontend/src/components/import/ImportResult.tsx`
- [ ] T022 [US1] Create StudentImportWizard component in `frontend/src/components/import/StudentImportWizard.tsx`
- [ ] T023 [US1] Create student import page in `frontend/src/pages/import/students.tsx`
- [ ] T024 [US1] Add import navigation link in `frontend/src/components/layout/Header.tsx`

**Checkpoint**: User Story 1 完成 - 學生名單批次匯入功能可獨立測試

---

## Phase 4: User Story 2 - Sport Records Import (Priority: P1)

**Goal**: 老師可以下載運動記錄模板、填寫體適能成績、上傳並批次建立運動記錄

**Independent Test**: 確保學生已存在 → 下載模板 → 填寫 3 位學生 2 項成績 → 上傳 → 預覽 → 確認匯入 → 驗證運動記錄已建立

**Depends On**: Phase 2 (Foundational) - NOT dependent on US1

### Backend Implementation (US2)

- [ ] T025 [US2] Create sport records Excel template generation in `backend/internal/services/template_service.go`
- [ ] T026 [US2] Implement records template download endpoint in `backend/internal/handlers/import_handler.go` (GET /templates/records)
- [ ] T027 [US2] Implement records Excel parsing in `backend/internal/services/import_service.go` (parseRecordsExcel)
- [ ] T028 [US2] Implement student lookup by student_number + name in `backend/internal/services/import_service.go`
- [ ] T029 [US2] Implement records row validation in `backend/internal/services/import_service.go` (validateRecordRow)
- [ ] T030 [US2] Implement records preview endpoint in `backend/internal/handlers/import_handler.go` (POST /records/preview)
- [ ] T031 [US2] Implement records import execution in `backend/internal/services/import_service.go` (ExecuteRecordsImport)
- [ ] T032 [US2] Implement records execute endpoint in `backend/internal/handlers/import_handler.go` (POST /records/execute)

### Frontend Implementation (US2)

- [ ] T033 [P] [US2] Create ScopeSelector component (school/grade/class) in `frontend/src/components/import/ScopeSelector.tsx`
- [ ] T034 [US2] Create RecordsImportWizard component in `frontend/src/components/import/RecordsImportWizard.tsx`
- [ ] T035 [US2] Create records import page in `frontend/src/pages/import/records.tsx`

**Checkpoint**: User Story 2 完成 - 運動記錄批次匯入功能可獨立測試

---

## Phase 5: User Story 3 - Preview Validation (Priority: P2)

**Goal**: 上傳後顯示詳細的預覽畫面，標示每列的驗證狀態（正確/警告/錯誤）

**Independent Test**: 上傳包含正確、警告、錯誤資料的 Excel → 確認預覽正確標示各列狀態

**Note**: 基礎預覽功能已在 US1/US2 實作，此 Story 增強驗證細節

### Backend Implementation (US3)

- [ ] T036 [US3] Add duplicate student_number detection in `backend/internal/services/import_service.go`
- [ ] T037 [US3] Add reasonable range warnings for sport values in `backend/internal/services/import_service.go`
- [ ] T038 [US3] Add file format and size validation in `backend/internal/handlers/import_handler.go`
- [ ] T039 [US3] Add header row validation in `backend/internal/services/import_service.go`

### Frontend Implementation (US3)

- [ ] T040 [US3] Enhance PreviewTable with row status icons and colors in `frontend/src/components/import/PreviewTable.tsx`
- [ ] T041 [US3] Add error message tooltips in PreviewTable in `frontend/src/components/import/PreviewTable.tsx`
- [ ] T042 [US3] Add summary stats (valid/warning/error counts) display in PreviewTable

**Checkpoint**: User Story 3 完成 - 預覽驗證功能增強

---

## Phase 6: User Story 4 - Import Result Summary (Priority: P2)

**Goal**: 匯入完成後顯示結果摘要，包含成功筆數、跳過筆數、錯誤原因

**Independent Test**: 執行包含成功和失敗列的匯入 → 確認結果報告顯示正確統計

**Note**: 基礎結果顯示已在 US1/US2 實作，此 Story 增強報告細節

### Frontend Implementation (US4)

- [ ] T043 [US4] Enhance ImportResult with detailed error list in `frontend/src/components/import/ImportResult.tsx`
- [ ] T044 [US4] Add export error report feature (optional) in `frontend/src/components/import/ImportResult.tsx`
- [ ] T045 [US4] Add "import another" and "view students" navigation in ImportResult

**Checkpoint**: User Story 4 完成 - 匯入結果報告功能增強

---

## Phase 7: User Story 5 - Partial Fill Support (Priority: P3)

**Goal**: 運動記錄可以只填寫部分欄位（如只填身高體重），空白欄位自動跳過

**Independent Test**: 上傳只填寫 2 項成績的 Excel → 確認只建立已填寫的項目記錄

### Backend Implementation (US5)

- [ ] T046 [US5] Modify records parsing to handle partial fills in `backend/internal/services/import_service.go`
- [ ] T047 [US5] Add "no data" warning for rows with no sport values in `backend/internal/services/import_service.go`
- [ ] T048 [US5] Modify records execution to create multiple records per row in `backend/internal/services/import_service.go`

### Frontend Implementation (US5)

- [ ] T049 [US5] Update PreviewTable to show partial fill indicator in `frontend/src/components/import/PreviewTable.tsx`
- [ ] T050 [US5] Add help text explaining partial fill behavior in RecordsImportWizard

**Checkpoint**: User Story 5 完成 - 部分填寫功能可用

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [ ] T051 [P] Implement cancel preview endpoint (DELETE /preview/:id) in `backend/internal/handlers/import_handler.go`
- [ ] T052 [P] Add preview expiration cleanup goroutine in `backend/internal/services/preview_store.go`
- [ ] T053 Add loading states and progress indicators in import wizards
- [ ] T054 [P] Add error boundary for import pages in `frontend/src/pages/import/`
- [ ] T055 Update CLAUDE.md with import feature documentation
- [ ] T056 Run quickstart.md validation: verify all scenarios work

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3-7)**: All depend on Foundational phase completion
  - US1 and US2 can proceed in parallel (both P1 priority)
  - US3 depends on US1 OR US2 (enhances preview)
  - US4 depends on US1 OR US2 (enhances result)
  - US5 depends on US2 (specific to records)
- **Polish (Phase 8)**: Can start after US1 complete, best after all stories

### User Story Dependencies

```
Phase 2 (Foundational) ────┬──► Phase 3 (US1: Student Import) ──┬──► Phase 5 (US3: Preview)
                          │                                     │
                          │                                     ├──► Phase 6 (US4: Result)
                          │                                     │
                          └──► Phase 4 (US2: Records Import) ──┴──► Phase 7 (US5: Partial)
```

### Within Each User Story

- Backend before frontend (API first)
- Models/types before services
- Services before handlers
- Handlers before frontend pages

### Parallel Opportunities

- T002, T003: Types and models in parallel
- T006, T007, T009, T010: Base structures in parallel
- T018, T019: Frontend components in parallel
- T033: ScopeSelector can be built parallel to other US2 tasks
- Phase 3 (US1) and Phase 4 (US2) can run in parallel

---

## Parallel Example: Phase 2 Foundational

```bash
# Launch all base structures in parallel:
Task: "Create ImportService base structure in backend/internal/services/import_service.go"
Task: "Create ImportHandler base structure in backend/internal/handlers/import_handler.go"
Task: "Create API client base in frontend/src/lib/api/import.ts"
Task: "Create useImport hook base in frontend/src/hooks/useImport.ts"
```

---

## Parallel Example: User Story 1 Frontend

```bash
# Launch parallel frontend components:
Task: "Create FileUpload component in frontend/src/components/import/FileUpload.tsx"
Task: "Create SchoolSelector component in frontend/src/components/import/SchoolSelector.tsx"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (T001-T003)
2. Complete Phase 2: Foundational (T004-T010)
3. Complete Phase 3: User Story 1 (T011-T024)
4. **STOP and VALIDATE**: Test student import independently
5. Deploy/demo if ready - teachers can import student lists!

### Incremental Delivery

1. Setup + Foundational → Foundation ready
2. Add User Story 1 → Test → Deploy (MVP: Student Import)
3. Add User Story 2 → Test → Deploy (Records Import)
4. Add User Story 3 → Test → Deploy (Enhanced Preview)
5. Add User Story 4 → Test → Deploy (Enhanced Results)
6. Add User Story 5 → Test → Deploy (Partial Fill)
7. Polish → Final deployment

### Parallel Team Strategy

With 2 developers:

1. Team completes Setup + Foundational together
2. Once Foundational is done:
   - Developer A: User Story 1 (Student Import)
   - Developer B: User Story 2 (Records Import)
3. Both MVP features ready for testing in parallel

---

## Task Summary

| Phase | Tasks | Parallel | Description |
|-------|-------|----------|-------------|
| Phase 1: Setup | 3 | 2 | Dependencies and base types |
| Phase 2: Foundational | 7 | 4 | Core infrastructure |
| Phase 3: US1 (P1) | 14 | 2 | Student list import |
| Phase 4: US2 (P1) | 11 | 1 | Sport records import |
| Phase 5: US3 (P2) | 7 | 0 | Preview validation |
| Phase 6: US4 (P2) | 3 | 0 | Result summary |
| Phase 7: US5 (P3) | 5 | 0 | Partial fill support |
| Phase 8: Polish | 6 | 3 | Cross-cutting concerns |
| **Total** | **56** | **12** | |

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- MVP: Just US1 (Student Import) is valuable on its own
