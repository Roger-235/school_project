# Quickstart: 前端導覽流程增強

**Feature**: 004-navigation-enhancement
**Purpose**: 手動測試驗證導覽功能是否正確實現

## Prerequisites

1. 前端開發伺服器運行中：`cd frontend && npm run dev`
2. 後端 API 伺服器運行中（用於資料載入）
3. 已有測試帳號可登入系統
4. 已有至少一個學校和一個學生資料

---

## Test Scenarios

### Scenario 1: Header 導航列顯示 (US1)

**目標**: 驗證所有頁面都有 Header 導航列

| 步驟 | 操作 | 預期結果 |
|------|------|---------|
| 1 | 登入系統 | 進入 Dashboard |
| 2 | 進入 `/schools/new` | Header 導航列可見，包含四個連結 |
| 3 | 進入任一學校詳情頁 `/schools/[id]` | Header 導航列可見 |
| 4 | 進入學校編輯頁 `/schools/[id]/edit` | Header 導航列可見 |
| 5 | 進入 `/students/new` | Header 導航列可見 |
| 6 | 進入任一學生詳情頁 `/students/[id]` | Header 導航列可見 |
| 7 | 進入學生編輯頁 `/students/[id]/edit` | Header 導航列可見 |
| 8 | 進入運動記錄新增頁 `/students/[id]/records/new` | Header 導航列可見 |
| 9 | 進入運動記錄編輯頁 `/students/[id]/records/[recordId]/edit` | Header 導航列可見 |
| 10 | 進入地圖頁 `/map` | Header 導航列可見 |

**Pass Criteria**: 所有 10 個頁面都顯示 Header 導航列

---

### Scenario 2: Header 導航功能 (US1)

**目標**: 驗證 Header 導航連結可正確跳轉

| 步驟 | 操作 | 預期結果 |
|------|------|---------|
| 1 | 在學校詳情頁點擊「首頁」 | 導航到 `/dashboard` |
| 2 | 在學生編輯頁點擊「學校管理」 | 導航到 `/schools` |
| 3 | 在運動記錄新增頁點擊「學生管理」 | 導航到 `/students` |
| 4 | 在新增學校頁點擊「地圖視覺化」 | 導航到 `/map` |

**Pass Criteria**: 所有導航連結正確跳轉

---

### Scenario 3: 導航高亮狀態 (US1)

**目標**: 驗證當前區塊在 Header 中正確高亮

| 步驟 | 操作 | 預期結果 |
|------|------|---------|
| 1 | 進入 `/dashboard` | 「首頁」高亮 |
| 2 | 進入 `/schools` | 「學校管理」高亮 |
| 3 | 進入 `/schools/new` | 「學校管理」高亮 |
| 4 | 進入 `/schools/[id]` | 「學校管理」高亮 |
| 5 | 進入 `/students` | 「學生管理」高亮 |
| 6 | 進入 `/students/[id]/records/new` | 「學生管理」高亮 |
| 7 | 進入 `/map` | 「地圖視覺化」高亮 |

**Pass Criteria**: 當前區塊正確高亮顯示

---

### Scenario 4: Breadcrumb 顯示 (US2)

**目標**: 驗證 Breadcrumb 正確顯示路徑

| 步驟 | 操作 | 預期結果 |
|------|------|---------|
| 1 | 進入 `/schools/new` | Breadcrumb: `首頁 > 學校管理 > 新增學校` |
| 2 | 進入學校詳情頁 | Breadcrumb: `首頁 > 學校管理 > {學校名稱}` |
| 3 | 進入學校編輯頁 | Breadcrumb: `首頁 > 學校管理 > {學校名稱} > 編輯` |
| 4 | 進入 `/students/new` | Breadcrumb: `首頁 > 學生管理 > 新增學生` |
| 5 | 進入學生詳情頁 | Breadcrumb: `首頁 > 學生管理 > {學生姓名}` |
| 6 | 進入學生編輯頁 | Breadcrumb: `首頁 > 學生管理 > {學生姓名} > 編輯` |
| 7 | 進入運動記錄新增頁 | Breadcrumb: `首頁 > 學生管理 > {學生姓名} > 新增運動記錄` |
| 8 | 進入地圖頁 | Breadcrumb 不顯示 |

**Pass Criteria**: Breadcrumb 顯示正確路徑，實體名稱正確顯示

---

### Scenario 5: Breadcrumb 導航 (US2)

**目標**: 驗證 Breadcrumb 連結可正確跳轉

| 步驟 | 操作 | 預期結果 |
|------|------|---------|
| 1 | 在學校編輯頁，點擊 Breadcrumb 中的「學校管理」 | 導航到 `/schools` |
| 2 | 在學生詳情頁，點擊 Breadcrumb 中的「首頁」 | 導航到 `/dashboard` |
| 3 | 在運動記錄新增頁，點擊 Breadcrumb 中的學生姓名 | 導航到學生詳情頁 |

**Pass Criteria**: Breadcrumb 各層級（除最後一項）可點擊跳轉

---

### Scenario 6: 地圖頁面全寬模式 (US3)

**目標**: 驗證地圖頁面保持全螢幕體驗

| 步驟 | 操作 | 預期結果 |
|------|------|---------|
| 1 | 進入 `/map` | Header 可見，地圖佔滿剩餘空間 |
| 2 | 檢查地圖容器 | 無左右 padding，全寬顯示 |
| 3 | 點擊 Header 中的「學校管理」 | 正確導航到 `/schools` |

**Pass Criteria**: 地圖全寬顯示，Header 導航正常

---

### Scenario 7: 認證保護 (FR-009)

**目標**: 驗證未登入用戶無法訪問頁面

| 步驟 | 操作 | 預期結果 |
|------|------|---------|
| 1 | 登出系統 | 返回登入頁 |
| 2 | 直接訪問 `/schools/new` | 自動跳轉到登入頁 |
| 3 | 直接訪問 `/students/1` | 自動跳轉到登入頁 |
| 4 | 直接訪問 `/map` | 自動跳轉到登入頁 |

**Pass Criteria**: 未登入時無法訪問任何受保護頁面

---

### Scenario 8: 功能保持 (FR-008)

**目標**: 驗證原有功能未被破壞

| 步驟 | 操作 | 預期結果 |
|------|------|---------|
| 1 | 在 `/schools/new` 建立新學校 | 學校建立成功 |
| 2 | 在學校詳情頁編輯學校資訊 | 更新成功 |
| 3 | 在學生詳情頁新增運動記錄 | 記錄建立成功 |
| 4 | 在地圖頁點擊縣市查看統計 | 統計資料正確顯示 |

**Pass Criteria**: 所有原有功能正常運作

---

## Edge Cases

### EC-1: 快速連續導航

| 步驟 | 操作 | 預期結果 |
|------|------|---------|
| 1 | 快速連續點擊「首頁」→「學校管理」→「學生管理」 | 最終導航到 `/students` |

### EC-2: 資料載入中的 Breadcrumb

| 步驟 | 操作 | 預期結果 |
|------|------|---------|
| 1 | 直接訪問學校詳情頁（如 `/schools/1`） | 資料載入中時 Breadcrumb 可能顯示 ID |
| 2 | 等待資料載入完成 | Breadcrumb 更新為學校名稱 |

---

## Validation Checklist

- [ ] **SC-001**: 任何頁面都可 1 次點擊到達主要功能區
- [ ] **SC-002**: 所有 9 個頁面都顯示 Header 導航列
- [ ] **SC-003**: Breadcrumb 顯示實際名稱（非 ID）
- [ ] **SC-004**: 地圖頁面全寬顯示
- [ ] **SC-005**: 所有原有功能正常運作

---

## Notes

- 建議在每個頁面修改後立即執行相關測試場景
- 如發現問題，記錄於 PR 描述中並修復後重新測試
- 測試應在不同瀏覽器（Chrome, Firefox, Safari）中執行
