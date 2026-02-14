# Feature Specification: Data Source Unification

**Feature Branch**: `005-data-source-unification`
**Created**: 2025-12-11
**Status**: Draft
**Input**: User description: "統一前後端資料來源 - 將所有前端 API 調用統一指向 Go 後端，使用 MySQL 資料庫作為單一資料來源"

## Problem Statement

目前前端各頁面使用獨立的 Mock API 資料，導致資料不一致：
- 地圖視覺化頁面 (/map) 顯示的縣市統計與實際學校/學生數量不符
- 學校列表 API 有 74 間學校，但學生 API 內部只引用 5 間學校
- 各 Mock API 的資料是硬編碼的，無法反映真實的資料關聯

## User Scenarios & Testing

### User Story 1 - View Consistent County Statistics (Priority: P1)

作為管理員，我希望在地圖視覺化頁面看到的縣市統計數據（學校數、學生數）與實際資料庫中的記錄一致，這樣我才能信任系統顯示的資訊來做決策。

**Why this priority**: 這是資料一致性的核心問題。如果統計數據與實際資料不符，整個系統的可信度都會受到質疑。

**Independent Test**: 可以透過在學校頁面新增一間學校後，刷新地圖頁面確認該縣市的學校數是否增加 1 來獨立驗證。

**Acceptance Scenarios**:

1. **Given** 系統已啟動且資料庫中有資料, **When** 用戶訪問地圖頁面, **Then** 各縣市顯示的學校數量應與該縣市在資料庫中的實際學校數量一致
2. **Given** 用戶在學校管理頁面新增了一間臺北市的學校, **When** 用戶刷新地圖頁面, **Then** 臺北市的學校統計數量應增加 1
3. **Given** 系統已啟動但資料庫中無資料, **When** 用戶訪問地圖頁面, **Then** 所有縣市應顯示為「無資料」狀態

---

### User Story 2 - Unified School and Student Data (Priority: P1)

作為管理員，我希望在學校管理和學生管理頁面中，所有資料都來自同一個資料來源，這樣當我新增、編輯或刪除資料時，所有相關頁面都能看到一致的結果。

**Why this priority**: 學校和學生是系統的核心實體，資料不一致會導致操作混亂和資料錯誤。

**Independent Test**: 可以透過在學校頁面新增學校，然後在新增學生頁面的學校下拉選單中確認新學校是否出現來驗證。

**Acceptance Scenarios**:

1. **Given** 用戶在學校管理頁面新增了一間學校, **When** 用戶前往新增學生頁面, **Then** 學校下拉選單中應該包含剛新增的學校
2. **Given** 用戶編輯了某間學校的名稱, **When** 用戶查看該校學生的詳情頁面, **Then** 應顯示更新後的學校名稱
3. **Given** 用戶刪除了某間學校, **When** 用戶嘗試存取該校學生列表, **Then** 系統應顯示適當的提示訊息

---

### User Story 3 - Seamless Authentication (Priority: P2)

作為用戶，我希望登入後能夠正常存取所有功能頁面，無論這些頁面的資料來自哪個 API 端點。

**Why this priority**: 認證是基本功能，但目前 Mock API 已有獨立的登入機制，需確保切換後認證流程仍正常運作。

**Independent Test**: 可以透過登入後依序訪問所有主要頁面（儀表板、學校、學生、地圖）確認都能正常存取。

**Acceptance Scenarios**:

1. **Given** 用戶已成功登入, **When** 用戶訪問任何受保護的頁面, **Then** 頁面應正常載入並顯示資料
2. **Given** 用戶未登入, **When** 用戶嘗試訪問受保護的頁面, **Then** 用戶應被重導向至登入頁面

---

### Edge Cases

- 當後端服務未啟動時，前端應顯示適當的錯誤訊息而非空白頁面
- 當資料庫連線中斷時，API 應回傳明確的錯誤訊息
- 當某縣市沒有任何學校或學生時，地圖應正確顯示「無資料」狀態

## Requirements

### Functional Requirements

- **FR-001**: 系統 MUST 使用單一資料來源（Go 後端 + MySQL）提供所有 API 資料
- **FR-002**: 前端 MUST 透過環境變數配置 API 端點位址
- **FR-003**: 後端 MUST 允許來自前端域名的跨域請求（CORS）
- **FR-004**: 地圖統計 API MUST 根據資料庫實際資料計算縣市統計
- **FR-005**: 系統 MUST 在資料變更後即時反映在所有相關頁面
- **FR-006**: 系統 MUST 在 API 連線失敗時顯示友善的錯誤訊息
- **FR-007**: Mock API MUST 保留作為備用（可透過環境變數切換）

### Key Entities

- **School**: 學校資料，包含縣市屬性用於地圖統計
- **Student**: 學生資料，關聯至學校
- **SportRecord**: 運動記錄，關聯至學生
- **CountyStatistics**: 縣市統計，由學校和學生資料動態計算

## Success Criteria

### Measurable Outcomes

- **SC-001**: 地圖頁面顯示的各縣市學校數量與資料庫實際記錄 100% 一致
- **SC-002**: 地圖頁面顯示的各縣市學生數量與資料庫實際記錄 100% 一致
- **SC-003**: 資料變更（新增/編輯/刪除）後，刷新頁面即可看到更新結果
- **SC-004**: 所有 CRUD 操作使用同一資料來源，無資料不一致情況
- **SC-005**: 認證功能在切換資料來源後正常運作

## Assumptions

- 後端 Go 服務已實作完整的 CRUD API
- MySQL 資料庫已正確配置並可連線
- 後端縣市統計 API 已實作或可快速實作查詢真實資料的功能
- 認證機制暫時繼續使用前端 Mock API（登入頁面），資料 API 使用後端

## Out of Scope

- 修改 UI 介面設計
- 新增功能
- 移除 Mock API 檔案（保留作為備用）
- 效能優化
