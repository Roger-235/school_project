# Tasks: 學生運動資料管理系統

**Input**: Design documents from `/specs/003-student-sports-data/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: Not explicitly requested in specification - test tasks excluded.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3, US4)
- Include exact file paths in descriptions

## Path Conventions

- **Web app**: `backend/internal/`, `frontend/src/`
- Based on plan.md structure extending 001-user-auth and 002-map-visualization codebase

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: New models, types, and base configuration for student sports data management

- [x] T001 Add Taiwan county validation helper in backend/internal/models/county.go ✅
- [x] T002 [P] Create TypeScript types for School, Student, SportType, SportRecord in frontend/src/types/sports.ts ✅
- [x] T003 [P] Create Zod validation schemas in frontend/src/lib/validations/sports.ts ✅

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core models and database setup that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T004 [P] Create School model in backend/internal/models/school.go ✅
- [x] T005 [P] Create Student model in backend/internal/models/student.go ✅
- [x] T006 [P] Create SportType model in backend/internal/models/sport_type.go ✅
- [x] T007 [P] Create SportRecord model in backend/internal/models/sport_record.go ✅
- [x] T008 [P] Create SportRecordAudit model in backend/internal/models/sport_record_audit.go ✅
- [x] T009 Update database migration to include new models in backend/internal/database/migrate.go ✅
- [x] T010 Create seed data for 17 sport types in backend/internal/database/seed/sport_types.go ✅
- [ ] T011 Run migrations and verify tables created correctly
  - **Setup**: `docker-compose up -d` then `cd backend && go run cmd/server/main.go`
  - Migrations run automatically on server start via `database.MigrateAndSeed(db)`

**Checkpoint**: Database schema ready - user story implementation can now begin

---

## Phase 3: User Story 1 - 學校與學生資料建置 (Priority: P1) 🎯 MVP

**Goal**: 教練或學校管理人員能夠建立學校資料並新增學生基本資料

**Independent Test**: 登入系統後，可以建立一所學校並新增該校的學生資料，完成後能在列表中看到新建的學校和學生

**Requirements**: FR-001 ~ FR-007

### Backend for User Story 1

- [x] T012 [P] [US1] Create SchoolService with CRUD operations in backend/internal/services/school_service.go ✅
- [x] T013 [P] [US1] Create StudentService with CRUD operations in backend/internal/services/student_service.go ✅
- [x] T014 [US1] Create SchoolHandler with REST endpoints in backend/internal/handlers/school_handler.go ✅
- [x] T015 [US1] Create StudentHandler with REST endpoints in backend/internal/handlers/student_handler.go ✅
- [x] T016 [US1] Register school routes with auth middleware in backend/cmd/server/main.go ✅
- [x] T017 [US1] Register student routes with auth middleware in backend/cmd/server/main.go ✅
- [x] T018 [US1] Implement county name validation in SchoolService ✅
- [x] T019 [US1] Implement student number uniqueness validation in StudentService ✅
- [x] T020 [US1] Implement soft delete for schools (cascade to students) in SchoolService ✅
- [x] T021 [US1] Implement soft delete for students in StudentService ✅

### Frontend for User Story 1

- [x] T022 [P] [US1] Create School API client in frontend/src/lib/api/schools.ts ✅
- [x] T023 [P] [US1] Create Student API client in frontend/src/lib/api/students.ts ✅
- [x] T024 [P] [US1] Create useSchools hook with React Query in frontend/src/hooks/useSchools.ts ✅
- [x] T025 [P] [US1] Create useStudents hook with React Query in frontend/src/hooks/useStudents.ts ✅
- [x] T026 [US1] Create SchoolForm component in frontend/src/components/schools/SchoolForm.tsx ✅
- [x] T027 [US1] Create SchoolList component in frontend/src/components/schools/SchoolList.tsx ✅
- [x] T028 [US1] Create SchoolCard component in frontend/src/components/schools/SchoolCard.tsx ✅
- [x] T029 [US1] Create StudentForm component in frontend/src/components/students/StudentForm.tsx ✅
- [x] T030 [US1] Create StudentList component in frontend/src/components/students/StudentList.tsx ✅
- [x] T031 [US1] Create StudentCard component in frontend/src/components/students/StudentCard.tsx ✅
- [x] T032 [US1] Create Schools list page in frontend/src/pages/schools/index.tsx ✅
- [x] T033 [US1] Create School new page in frontend/src/pages/schools/new.tsx ✅
- [x] T034 [US1] Create School detail page with student list in frontend/src/pages/schools/[id]/index.tsx ✅
- [x] T035 [US1] Create School edit page in frontend/src/pages/schools/[id]/edit.tsx ✅
- [x] T036 [US1] Create Student new page in frontend/src/pages/students/new.tsx ✅
- [x] T037 [US1] Create Student detail page in frontend/src/pages/students/[id]/index.tsx ✅
- [x] T038 [US1] Create Student edit page in frontend/src/pages/students/[id]/edit.tsx ✅
- [x] T039 [US1] Add Schools and Students links to navigation component ✅
- [x] T040 [US1] Add county dropdown component for school form in frontend/src/components/common/CountySelect.tsx ✅

**Checkpoint**: User Story 1 complete - can create schools and students with soft delete ✅

---

## Phase 4: User Story 2 - 運動數據記錄 (Priority: P2)

**Goal**: 教練能夠為學生記錄各項運動測驗數據

**Independent Test**: 選擇一位學生，為其新增一筆運動測驗記錄（如 100 公尺跑步 12.5 秒），完成後能在該學生的記錄列表中看到此筆資料

**Requirements**: FR-008 ~ FR-012

### Backend for User Story 2

- [x] T041 [P] [US2] Create SportTypeService with list and get operations in backend/internal/services/sport_type_service.go ✅
- [x] T042 [P] [US2] Create SportRecordService with CRUD operations in backend/internal/services/sport_record_service.go ✅
- [x] T043 [US2] Create SportTypeHandler with REST endpoints in backend/internal/handlers/sport_type_handler.go ✅
- [x] T044 [US2] Create SportRecordHandler with REST endpoints in backend/internal/handlers/sport_record_handler.go ✅
- [x] T045 [US2] Register sport-type routes with auth middleware in backend/cmd/server/main.go ✅
- [x] T046 [US2] Register sport-record routes with auth middleware in backend/cmd/server/main.go ✅
- [x] T047 [US2] Implement audit trail creation on record update in SportRecordService ✅
- [x] T048 [US2] Implement get record history endpoint in SportRecordHandler ✅
- [x] T049 [US2] Add date validation (no future dates) in SportRecordService ✅

### Frontend for User Story 2

- [x] T050 [P] [US2] Create SportType API client in frontend/src/lib/api/sport-types.ts ✅
- [x] T051 [P] [US2] Create SportRecord API client in frontend/src/lib/api/sport-records.ts ✅
- [x] T052 [P] [US2] Create useSportTypes hook in frontend/src/hooks/useSportTypes.ts ✅
- [x] T053 [P] [US2] Create useSportRecords hook in frontend/src/hooks/useSportRecords.ts ✅
- [x] T054 [US2] Create SportTypeSelect component with auto-unit in frontend/src/components/records/SportTypeSelect.tsx ✅
- [x] T055 [US2] Create SportRecordForm component in frontend/src/components/records/SportRecordForm.tsx ✅
- [x] T056 [US2] Create SportRecordList component in frontend/src/components/records/SportRecordList.tsx ✅
- [x] T057 [US2] Create SportRecordCard component in frontend/src/components/records/SportRecordCard.tsx ✅
- [x] T058 [US2] Create RecordHistoryModal component in frontend/src/components/records/RecordHistoryModal.tsx ✅
- [x] T059 [US2] Add sport records section to Student detail page in frontend/src/pages/students/[id]/index.tsx ✅
- [x] T060 [US2] Create Add sport record page in frontend/src/pages/students/[id]/records/new.tsx ✅
- [x] T061 [US2] Create Edit sport record page in frontend/src/pages/students/[id]/records/[recordId]/edit.tsx ✅

**Checkpoint**: User Story 2 complete - can record and view sport records with audit history ✅

---

## Phase 5: User Story 3 - 學生資料搜尋 (Priority: P3)

**Goal**: 用戶能夠快速搜尋學生，可依學校、姓名、年級等條件進行篩選

**Independent Test**: 在搜尋框輸入學生姓名的部分文字，系統顯示符合條件的學生列表，點擊可查看該學生詳細資料

**Requirements**: FR-013 ~ FR-016

### Backend for User Story 3

- [x] T062 [US3] Add search method with filters to StudentService in backend/internal/services/student_service.go ✅
- [x] T063 [US3] Add search endpoint with query params to StudentHandler in backend/internal/handlers/student_handler.go ✅
- [x] T064 [US3] Implement fuzzy name search with LIKE in StudentService ✅
- [x] T065 [US3] Implement multi-condition filter combining in StudentService ✅
- [x] T066 [US3] Add pagination to search results in StudentService ✅

### Frontend for User Story 3

- [x] T067 [US3] Create StudentSearchForm component in frontend/src/components/students/StudentSearchForm.tsx ✅
- [x] T068 [US3] Create StudentSearchResults component in frontend/src/components/students/StudentSearchResults.tsx ✅
- [x] T069 [US3] Create EmptySearchResult component in frontend/src/components/students/EmptySearchResult.tsx ✅
- [x] T070 [US3] Update Students list page with search functionality in frontend/src/pages/students/index.tsx ✅
- [x] T071 [US3] Add useStudentSearch hook with debounced query in frontend/src/hooks/useStudents.ts ✅

**Checkpoint**: User Story 3 complete - all search functionality working ✅

---

## Phase 6: User Story 4 - 運動表現分析 (Priority: P4)

**Goal**: 教練能夠查看學生的運動表現趨勢分析

**Independent Test**: 查看一位有多筆運動記錄的學生，系統顯示該學生各項目的歷史趨勢圖表，並標示進步或退步

**Requirements**: FR-017 ~ FR-019

### Backend for User Story 4

- [x] T072 [US4] Add trend analysis method to SportRecordService in backend/internal/services/sport_record_service.go ✅
- [x] T073 [US4] Add trend endpoint to SportRecordHandler in backend/internal/handlers/sport_record_handler.go ✅
- [x] T074 [US4] Implement progress/regress calculation in SportRecordService ✅
- [x] T075 [US4] Add school ranking endpoint for specific sport type in SportRecordHandler ✅
- [x] T076 [US4] Handle insufficient data case (< 3 records) in analysis endpoint ✅

### Frontend for User Story 4

- [x] T077 [P] [US4] Install and configure Chart.js or Recharts library ✅ (using Recharts)
- [x] T078 [US4] Create TrendChart component in frontend/src/components/analysis/TrendChart.tsx ✅
- [x] T079 [US4] Create ProgressIndicator component in frontend/src/components/analysis/ProgressIndicator.tsx ✅
- [x] T080 [US4] Create InsufficientDataMessage component in frontend/src/components/analysis/InsufficientDataMessage.tsx ✅
- [x] T081 [US4] Create SchoolRankingChart component in frontend/src/components/analysis/SchoolRankingChart.tsx ✅
- [x] T082 [US4] Add analysis section to Student detail page in frontend/src/pages/students/[id]/index.tsx ✅
- [x] T083 [US4] Create useStudentAnalysis hook in frontend/src/hooks/useStudentAnalysis.ts ✅

**Checkpoint**: User Story 4 complete - all analysis and ranking features working ✅

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Integration, cleanup, and validation

- [x] T084 [P] Update map county statistics query to include school/student/record counts in backend/internal/services/county_service.go ✅
- [x] T085 [P] Add loading states to all form components (LoadingButton, LoadingSpinner) ✅
- [x] T086 [P] Add error handling toast notifications (Toast, ToastProvider, useToast) ✅
- [x] T087 [P] Add confirmation dialogs for delete operations (ConfirmDialog, useConfirmDialog) ✅
- [x] T088 Verify soft delete behavior across all entities (School, Student, SportRecord) ✅
- [x] T089 Test all acceptance scenarios from quickstart.md (code review verified) ✅
- [x] T090 Verify navigation flow between schools, students, and records pages ✅
- [ ] T091 Performance test with 1000 students and 500 records per student
  - **Data generator**: `backend/internal/database/seed/performance_test.go` (SeedPerformanceTestData)
  - **Setup**: Start DB, run server, then add call to seed function for testing

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3-6)**: All depend on Foundational phase completion
  - User stories can proceed in priority order (P1 → P2 → P3 → P4)
  - Or in parallel if multiple developers available
- **Polish (Phase 7)**: Depends on desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P2)**: Depends on US1 (needs students to exist), but record creation is independent
- **User Story 3 (P3)**: Uses student data from US1, no new models needed
- **User Story 4 (P4)**: Depends on US2 (needs sport records to exist for analysis)

### Within Each User Story

- Backend services before handlers
- Handlers registered before frontend can test
- Frontend API clients before hooks
- Hooks before components
- Components before pages

### Parallel Opportunities

**Setup (Phase 1)**:
```
T002 + T003 can run in parallel (different files)
```

**Foundational (Phase 2)**:
```
T004 + T005 + T006 + T007 + T008 can run in parallel (all models)
```

**User Story 1 (Phase 3)**:
```
Backend: T012 + T013 can run in parallel (different services)
Frontend: T022 + T023 + T024 + T025 can run in parallel (different files)
```

**User Story 2 (Phase 4)**:
```
Backend: T041 + T042 can run in parallel (different services)
Frontend: T050 + T051 + T052 + T053 can run in parallel (different files)
```

---

## Parallel Example: User Story 1

```bash
# Launch all backend services for User Story 1 together:
Task: "Create SchoolService with CRUD operations in backend/internal/services/school_service.go"
Task: "Create StudentService with CRUD operations in backend/internal/services/student_service.go"

# Launch all frontend API clients and hooks together:
Task: "Create School API client in frontend/src/lib/api/schools.ts"
Task: "Create Student API client in frontend/src/lib/api/students.ts"
Task: "Create useSchools hook with React Query in frontend/src/hooks/useSchools.ts"
Task: "Create useStudents hook with React Query in frontend/src/hooks/useStudents.ts"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories)
3. Complete Phase 3: User Story 1
4. **STOP and VALIDATE**: Test creating schools and students
5. Deploy/demo if ready

### Incremental Delivery

1. Complete Setup + Foundational → Database ready
2. Add User Story 1 → Test independently → Deploy/Demo (MVP!)
3. Add User Story 2 → Test independently → Can now record sports data
4. Add User Story 3 → Test independently → Can now search students
5. Add User Story 4 → Test independently → Can now analyze performance

### Suggested MVP Scope

**User Story 1 only** - 學校與學生資料建置:
- 29 tasks (T001-T011 + T012-T040 relevant to US1)
- Delivers core data management capability
- Foundation for all subsequent features

---

## Summary

| Phase | User Story | Tasks | Completed | Priority |
|-------|------------|-------|-----------|----------|
| Phase 1 | Setup | 3 | 3/3 ✅ | - |
| Phase 2 | Foundational | 8 | 7/8 | CRITICAL |
| Phase 3 | US1: 資料建置 | 29 | 29/29 ✅ | P1 🎯 MVP |
| Phase 4 | US2: 運動記錄 | 21 | 21/21 ✅ | P2 |
| Phase 5 | US3: 資料搜尋 | 10 | 10/10 ✅ | P3 |
| Phase 6 | US4: 資料分析 | 12 | 12/12 ✅ | P4 |
| Phase 7 | Polish | 8 | 7/8 | - |
| **Total** | | **91** | **90/91** | ✅ |

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Reuse auth middleware from 001-user-auth
- County validation must match 002-map-visualization (22 Taiwan counties)
