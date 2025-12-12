# Tasks: Data Source Unification

**Feature**: 005-data-source-unification
**Generated**: 2025-12-11
**Total Tasks**: 12 | **Estimated Effort**: Small (配置變更為主)

## Task Overview

| Phase | Tasks | Description |
|-------|-------|-------------|
| Phase 1: Setup | 2 | 確認前置條件 |
| Phase 2: Foundational | 1 | 環境變數切換 |
| Phase 3: US1 - County Statistics | 3 | 驗證地圖統計 |
| Phase 4: US2 - School/Student Data | 3 | 驗證學校/學生資料 |
| Phase 5: US3 - Authentication | 2 | 驗證認證流程 |
| Phase 6: Polish | 1 | 文件與驗收 |

---

## Phase 1: Setup

**Purpose**: 確認後端和資料庫已正確運行

- [ ] T001 確認 MySQL 資料庫運行中 (docker-compose ps)
- [ ] T002 確認後端服務運行中 (curl http://localhost:8080/health)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: 修改前端環境變數以切換到後端 API

**⚠️ CRITICAL**: 此步驟完成後，所有前端 API 調用將指向後端

- [ ] T003 修改前端環境變數 `frontend/.env.local`: 將 `NEXT_PUBLIC_API_URL=/api/v1` 改為 `NEXT_PUBLIC_API_URL=http://localhost:8080/api/v1`

**Checkpoint**: 環境變數已切換，需重啟前端服務

---

## Phase 3: User Story 1 - View Consistent County Statistics (Priority: P1) 🎯 MVP

**Goal**: 地圖頁面的縣市統計數據與資料庫實際記錄一致

**Independent Test**: 在學校頁面新增一間學校後，刷新地圖頁面確認該縣市的學校數是否增加 1

### Implementation for User Story 1

- [ ] T004 [US1] 重啟前端服務以套用新的環境變數 `cd frontend && npm run dev`
- [ ] T005 [US1] 驗證地圖頁面 `/map` 從後端載入縣市統計 (檢查 Network: 請求到 localhost:8080)
- [ ] T006 [US1] 驗證資料一致性：新增學校後刷新地圖，確認縣市學校數量更新

**Checkpoint**: 地圖統計與資料庫同步，User Story 1 完成

---

## Phase 4: User Story 2 - Unified School and Student Data (Priority: P1)

**Goal**: 學校和學生頁面資料來自同一資料來源

**Independent Test**: 在學校頁面新增學校，然後在新增學生頁面的學校下拉選單中確認新學校是否出現

### Implementation for User Story 2

- [ ] T007 [P] [US2] 驗證學校列表頁面 `/schools` 從後端載入資料 (檢查 Network: 請求到 localhost:8080)
- [ ] T008 [P] [US2] 驗證學生列表頁面 `/students` 從後端載入資料 (檢查 Network: 請求到 localhost:8080)
- [ ] T009 [US2] 驗證資料一致性：新增學校後，在新增學生頁面確認學校下拉選單包含新學校

**Checkpoint**: 學校/學生資料統一，User Story 2 完成

---

## Phase 5: User Story 3 - Seamless Authentication (Priority: P2)

**Goal**: 登入後能正常存取所有功能頁面

**Independent Test**: 登入後依序訪問所有主要頁面（儀表板、學校、學生、地圖）確認都能正常存取

### Implementation for User Story 3

- [ ] T010 [US3] 驗證登入功能正常運作 (使用 Mock API /api/auth/login)
- [ ] T011 [US3] 驗證登入後可存取所有受保護頁面：Dashboard, Schools, Students, Map

**Checkpoint**: 認證流程正常，User Story 3 完成

---

## Phase 6: Polish & Documentation

**Purpose**: 最終驗收與文件更新

- [ ] T012 執行 quickstart.md 完整驗證流程並記錄結果

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: 無依賴，可立即開始
- **Foundational (Phase 2)**: 依賴 Setup 完成
- **User Stories (Phase 3-5)**: 依賴 Foundational 完成
  - US1, US2, US3 可依優先順序執行
- **Polish (Phase 6)**: 依賴所有 User Stories 完成

### Parallel Opportunities

- T007 和 T008 可並行驗證（不同頁面）
- 本功能為配置變更，大部分為驗證任務，無需複雜並行

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. 完成 Phase 1: Setup ✓
2. 完成 Phase 2: Foundational (環境變數切換)
3. 完成 Phase 3: User Story 1 (地圖統計驗證)
4. **STOP and VALIDATE**: 確認地圖統計與資料庫一致
5. 可先部署/展示

### Incremental Delivery

1. 環境變數切換 → 基礎就緒
2. 驗證地圖統計 → User Story 1 完成 (MVP!)
3. 驗證學校/學生 → User Story 2 完成
4. 驗證認證流程 → User Story 3 完成
5. 每個 story 獨立增加價值

---

## Progress Tracking

| Phase | Total | Done | Remaining |
|-------|-------|------|-----------|
| Phase 1 | 2 | 0 | 2 |
| Phase 2 | 1 | 0 | 1 |
| Phase 3 (US1) | 3 | 0 | 3 |
| Phase 4 (US2) | 3 | 0 | 3 |
| Phase 5 (US3) | 2 | 0 | 2 |
| Phase 6 | 1 | 0 | 1 |
| **Total** | **12** | **0** | **12** |

**Completion**: 0% (0/12 tasks)

---

## Notes

- 本功能為**配置變更**，不涉及新程式碼開發
- 主要工作是驗證前端切換到後端 API 後各功能正常
- 登入功能繼續使用 Mock API（後端認證尚未實作）
- 資料庫可能是空的，需要透過 UI 新增資料進行驗證
- 若遇到問題，可參考 quickstart.md 的 Troubleshooting 章節
