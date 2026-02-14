# Feature Specification: 前端導覽流程增強 (Navigation Enhancement)

**Feature Branch**: `004-navigation-enhancement`
**Created**: 2025-12-10
**Status**: Draft
**Input**: 統一所有認證頁面使用 MainLayout 佈局，提供一致的導覽體驗

## Overview

### Problem Statement

目前前端有 9 個頁面使用 `ProtectedRoute` 而非 `MainLayout`，導致這些頁面缺少全域 Header 導航列。用戶在這些頁面只能通過「返回箭頭」或「手動輸入網址」來導航到其他功能區，造成不佳的使用者體驗。

### Solution

統一所有認證頁面使用 `MainLayout` 佈局元件，確保每個頁面都有：
- 全域 Header 導航列（首頁、學校管理、學生管理、地圖視覺化）
- Breadcrumb 路徑導航（顯示當前位置，支援快速跳轉上層）
- 一致的頁面結構和視覺風格

## User Scenarios & Testing *(mandatory)*

### User Story 1 - 全域導航列訪問 (Priority: P1)

作為一個已登入的用戶，我希望在任何頁面都能看到 Header 導航列，這樣我可以隨時切換到其他主要功能區（首頁、學校管理、學生管理、地圖視覺化），而不需要手動輸入網址或多次點擊返回。

**Why this priority**: 這是最核心的需求，解決用戶無法在子頁面導航的根本問題。沒有全域導航，用戶體驗極差。

**Independent Test**: 在任何頁面點擊 Header 中的導航連結，可以直接跳轉到目標頁面，不需要先返回列表頁。

**Acceptance Scenarios**:

1. **Given** 用戶在學校詳情頁面 (`/schools/[id]`), **When** 用戶點擊 Header 中的「學生管理」, **Then** 系統導航到學生列表頁面 (`/students`)
2. **Given** 用戶在新增運動記錄頁面 (`/students/[id]/records/new`), **When** 用戶點擊 Header 中的「首頁」, **Then** 系統導航到 Dashboard 頁面 (`/dashboard`)
3. **Given** 用戶在編輯學生頁面 (`/students/[id]/edit`), **When** 用戶點擊 Header 中的「地圖視覺化」, **Then** 系統導航到地圖頁面 (`/map`)

---

### User Story 2 - Breadcrumb 路徑導航 (Priority: P2)

作為一個已登入的用戶，我希望在頁面上方看到 Breadcrumb 麵包屑導航，顯示我目前的位置層級，這樣我可以快速了解自己在哪裡，並點擊麵包屑快速返回上層頁面。

**Why this priority**: Breadcrumb 提供位置感知和快速返回功能，是僅次於全域導航的重要導覽元素。

**Independent Test**: 在任何子頁面查看 Breadcrumb，確認顯示正確的層級路徑，並可點擊任一層級跳轉。

**Acceptance Scenarios**:

1. **Given** 用戶在學校詳情頁面, **When** 頁面載入完成, **Then** Breadcrumb 顯示「首頁 > 學校管理 > [學校名稱]」
2. **Given** 用戶在編輯學生頁面, **When** 頁面載入完成, **Then** Breadcrumb 顯示「首頁 > 學生管理 > [學生姓名] > 編輯」
3. **Given** 用戶在 Breadcrumb 中看到「學校管理」, **When** 用戶點擊「學校管理」, **Then** 系統導航到學校列表頁面
4. **Given** 用戶在新增運動記錄頁面, **When** 頁面載入完成, **Then** Breadcrumb 顯示「首頁 > 學生管理 > [學生姓名] > 新增運動記錄」

---

### User Story 3 - 地圖頁面全螢幕導航 (Priority: P3)

作為一個使用地圖視覺化功能的用戶，我希望地圖頁面保持全螢幕體驗的同時也能有導航列，這樣我可以在查看地圖後快速切換到其他功能。

**Why this priority**: 地圖頁面是特殊情況，需要在全螢幕體驗和導航便利性之間取得平衡。

**Independent Test**: 在地圖頁面確認有 Header 導航列，且地圖佔用剩餘的全部高度，不受側邊 padding 限制。

**Acceptance Scenarios**:

1. **Given** 用戶在地圖頁面, **When** 頁面載入完成, **Then** Header 導航列顯示在頁面頂部，地圖佔用剩餘空間
2. **Given** 用戶在地圖頁面, **When** 用戶點擊 Header 中的「學校管理」, **Then** 系統導航到學校列表頁面
3. **Given** 用戶在地圖頁面, **When** 頁面載入完成, **Then** 地圖內容無側邊 padding，呈現全寬顯示

---

### Edge Cases

- **快速連續導航**: 用戶快速連續點擊不同導航連結時，系統應正確導航到最後點擊的目標
- **頁面載入中斷**: 導航過程中網路中斷，系統應顯示適當的錯誤提示
- **動態資料載入**: Breadcrumb 中的實體名稱（學校名稱、學生姓名）在資料尚未載入時應顯示載入狀態或 ID
- **深層嵌套路徑**: 對於深層路徑如 `/students/[id]/records/[recordId]/edit`，Breadcrumb 應完整顯示所有層級

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: 系統 MUST 在所有認證頁面顯示統一的 Header 導航列
- **FR-002**: Header 導航列 MUST 包含四個主要連結：首頁、學校管理、學生管理、地圖視覺化
- **FR-003**: 系統 MUST 高亮顯示當前所在的導航區塊（如在 `/schools/*` 路徑時高亮「學校管理」）
- **FR-004**: 系統 MUST 在子頁面顯示 Breadcrumb 麵包屑導航
- **FR-005**: Breadcrumb MUST 顯示實體的實際名稱（學校名稱、學生姓名）而非 ID
- **FR-006**: Breadcrumb 中的每個層級（除最後一層外）MUST 可點擊跳轉
- **FR-007**: 地圖頁面 MUST 使用全寬模式（無側邊 padding）
- **FR-008**: 系統 MUST 保持現有頁面的所有功能不變
- **FR-009**: 系統 MUST 保持現有的認證檢查邏輯（未登入自動跳轉登入頁）

### Pages to Modify

| 頁面路徑                               | 頁面描述     | 特殊需求                   |
| -------------------------------------- | ------------ | -------------------------- |
| `/schools/new`                         | 新增學校     | 標準模式                   |
| `/schools/[id]`                        | 學校詳情     | Breadcrumb 顯示學校名稱    |
| `/schools/[id]/edit`                   | 編輯學校     | Breadcrumb 顯示學校名稱    |
| `/students/new`                        | 新增學生     | 可能從學校詳情頁進入       |
| `/students/[id]`                       | 學生詳情     | Breadcrumb 顯示學生姓名    |
| `/students/[id]/edit`                  | 編輯學生     | Breadcrumb 顯示學生姓名    |
| `/students/[id]/records/new`           | 新增運動記錄 | 深層路徑                   |
| `/students/[id]/records/[recordId]/edit` | 編輯運動記錄 | 最深層路徑                 |
| `/map`                                 | 地圖視覺化   | 全寬模式，無 Breadcrumb    |

### Key Entities

- **NavigationItem**: 導航項目，包含標籤、路徑、圖示
- **BreadcrumbItem**: 麵包屑項目，包含標籤、路徑（最後一項無路徑）

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 用戶可以在任何頁面通過 Header 導航列在 1 次點擊內到達任一主要功能區
- **SC-002**: 所有 9 個目標頁面都顯示 Header 導航列，通過率 100%
- **SC-003**: Breadcrumb 在有實體數據的頁面顯示實際名稱（非 ID），通過率 100%
- **SC-004**: 地圖頁面保持全螢幕體驗，地圖可視區域不減少
- **SC-005**: 所有現有頁面功能保持正常運作，無功能回歸

## Scope

### In Scope

- 修改 9 個使用 ProtectedRoute 的頁面改用 MainLayout
- 為每個頁面配置正確的 Breadcrumb 項目
- 確保地圖頁面使用 fullWidth 模式
- 調整頁面內部結構以適應新佈局

### Out of Scope

- 後端 API 修改
- 新功能開發
- 資料庫變更
- Header 導航列樣式修改（使用現有設計）
- 行動裝置適配優化

## Assumptions

- MainLayout 元件已支援 `fullWidth` prop 用於全寬模式
- MainLayout 元件已內建認證檢查，可完全取代 ProtectedRoute
- Breadcrumb 元件已支援自定義 `breadcrumbItems` prop
- 現有的 Header 元件已包含所有必要的導航連結

## Dependencies

- Feature 001-user-auth: 依賴現有的認證系統和 MainLayout 元件
- Feature 002-map-visualization: 地圖頁面需要特殊的全寬處理
- Feature 003-student-sports-data: 學校和學生相關頁面的數據載入
