# Tasks: 前端導覽流程增強 (Navigation Enhancement)

**Feature**: 004-navigation-enhancement
**Generated**: 2025-12-11
**Updated**: 2025-12-11
**Total Tasks**: 18 | **Estimated Effort**: Small (純前端重構)

## Task Overview

| Phase | Tasks | Description |
|-------|-------|-------------|
| Phase 0: Setup | 2 | 分支建立、環境確認 |
| Phase 1: US1 - 全域導航列 | 9 | 9 個頁面改用 MainLayout |
| Phase 2: US2 - Breadcrumb | 4 | 配置動態 Breadcrumb |
| Phase 3: US3 - 地圖全寬 | 1 | 地圖頁面 fullWidth 設定 |
| Phase 4: Verification | 2 | 測試驗證 |

---

## Phase 0: Setup

### Task 0.1: 建立功能分支
- **Status**: ✅ DONE
- **Priority**: P0
- **Description**: 建立 `004-navigation-enhancement` 分支
- **Verification**: `git branch` 顯示分支已存在
- **Notes**: 分支已存在

### Task 0.2: 確認前端開發環境
- **Status**: ✅ DONE
- **Priority**: P0
- **Description**: 確認前端開發伺服器可正常啟動
- **Commands**:
  ```bash
  cd frontend && npm run dev
  ```
- **Verification**: 瀏覽器可訪問 http://localhost:3000

---

## Phase 1: US1 - 全域導航列訪問 (P1)

> 將 9 個使用 ProtectedRoute 的頁面改用 MainLayout，使其具有 Header 導航列

### Task 1.1: 修改 `/schools/new` 頁面
- **Status**: ✅ DONE
- **Priority**: P1
- **File**: `frontend/src/pages/schools/new.tsx`
- **Description**:
  - 移除 ProtectedRoute 包裝
  - 移除自訂 header（含返回按鈕）
  - 使用 MainLayout 包裝
  - 配置基本 breadcrumbItems
- **Breadcrumb**: `首頁 > 學校管理 > 新增學校`
- **Verification**: 頁面顯示 Header 導航列，可點擊導航到其他頁面

### Task 1.2: 修改 `/schools/[id]` 頁面
- **Status**: ✅ DONE
- **Priority**: P1
- **File**: `frontend/src/pages/schools/[id]/index.tsx`
- **Description**:
  - 移除 ProtectedRoute 包裝
  - 使用 MainLayout 包裝
  - 配置動態 breadcrumbItems（使用學校名稱）
- **Breadcrumb**: `首頁 > 學校管理 > {school.name}`
- **Verification**: 頁面顯示 Header，Breadcrumb 顯示學校名稱

### Task 1.3: 修改 `/schools/[id]/edit` 頁面
- **Status**: ✅ DONE
- **Priority**: P1
- **File**: `frontend/src/pages/schools/[id]/edit.tsx`
- **Description**:
  - 移除 ProtectedRoute 包裝
  - 使用 MainLayout 包裝
  - 配置動態 breadcrumbItems
- **Breadcrumb**: `首頁 > 學校管理 > {school.name} > 編輯`
- **Verification**: 頁面顯示 Header，Breadcrumb 正確

### Task 1.4: 修改 `/students/new` 頁面
- **Status**: ✅ DONE
- **Priority**: P1
- **File**: `frontend/src/pages/students/new.tsx`
- **Description**:
  - 移除 ProtectedRoute 包裝
  - 使用 MainLayout 包裝
  - 配置 breadcrumbItems
  - 支援從學校頁面進入時的不同 breadcrumb
- **Breadcrumb**: `首頁 > 學生管理 > 新增學生` 或 `首頁 > 學校管理 > {school.name} > 新增學生`
- **Verification**: 頁面顯示 Header 導航列

### Task 1.5: 修改 `/students/[id]` 頁面
- **Status**: ✅ DONE
- **Priority**: P1
- **File**: `frontend/src/pages/students/[id]/index.tsx`
- **Description**:
  - 移除 ProtectedRoute 包裝
  - 使用 MainLayout 包裝
  - 配置動態 breadcrumbItems（使用學生姓名）
- **Breadcrumb**: `首頁 > 學生管理 > {student.name}`
- **Verification**: 頁面顯示 Header，Breadcrumb 顯示學生姓名

### Task 1.6: 修改 `/students/[id]/edit` 頁面
- **Status**: ✅ DONE
- **Priority**: P1
- **File**: `frontend/src/pages/students/[id]/edit.tsx`
- **Description**:
  - 移除 ProtectedRoute 包裝
  - 使用 MainLayout 包裝
  - 配置動態 breadcrumbItems
- **Breadcrumb**: `首頁 > 學生管理 > {student.name} > 編輯`
- **Verification**: 頁面顯示 Header，Breadcrumb 正確

### Task 1.7: 修改 `/students/[id]/records/new` 頁面
- **Status**: ✅ DONE
- **Priority**: P1
- **File**: `frontend/src/pages/students/[id]/records/new.tsx`
- **Description**:
  - 移除 ProtectedRoute 包裝
  - 使用 MainLayout 包裝
  - 配置深層 breadcrumbItems
- **Breadcrumb**: `首頁 > 學生管理 > {student.name} > 新增運動記錄`
- **Verification**: 頁面顯示 Header，Breadcrumb 完整顯示

### Task 1.8: 修改 `/students/[id]/records/[recordId]/edit` 頁面
- **Status**: ✅ DONE
- **Priority**: P1
- **File**: `frontend/src/pages/students/[id]/records/[recordId]/edit.tsx`
- **Description**:
  - 移除 ProtectedRoute 包裝
  - 使用 MainLayout 包裝
  - 配置最深層 breadcrumbItems
- **Breadcrumb**: `首頁 > 學生管理 > {student.name} > 運動記錄 > 編輯`
- **Verification**: 頁面顯示 Header，Breadcrumb 完整顯示

### Task 1.9: 修改 `/map` 頁面
- **Status**: ✅ DONE
- **Priority**: P1
- **File**: `frontend/src/pages/map.tsx`
- **Description**:
  - 移除 ProtectedRoute 包裝
  - 使用 MainLayout 包裝
  - 設定 `fullWidth={true}`
  - 設定 `showBreadcrumb={false}`
- **Breadcrumb**: 無（不顯示）
- **Verification**: 頁面顯示 Header，地圖全寬顯示

---

## Phase 2: US2 - Breadcrumb 路徑導航 (P2)

> 確保 Breadcrumb 正確顯示實體名稱和可點擊跳轉

### Task 2.1: 確認學校相關頁面 Breadcrumb
- **Status**: ✅ DONE
- **Priority**: P2
- **Dependencies**: Task 1.1, 1.2, 1.3
- **Description**:
  - 驗證學校名稱正確顯示
  - 驗證 Breadcrumb 連結可點擊跳轉
  - 處理資料載入中的 fallback 顯示
- **Test Cases**:
  - 點擊「學校管理」跳轉到 `/schools`
  - 點擊「首頁」跳轉到 `/dashboard`
- **Verification**: 按 quickstart.md Scenario 4 測試通過
- **Notes**: 已在 Task 1.1-1.3 中實現動態 breadcrumb

### Task 2.2: 確認學生相關頁面 Breadcrumb
- **Status**: ✅ DONE
- **Priority**: P2
- **Dependencies**: Task 1.4, 1.5, 1.6
- **Description**:
  - 驗證學生姓名正確顯示
  - 驗證 Breadcrumb 連結可點擊跳轉
- **Test Cases**:
  - 點擊「學生管理」跳轉到 `/students`
  - 點擊學生姓名跳轉到學生詳情頁
- **Verification**: 按 quickstart.md Scenario 4, 5 測試通過
- **Notes**: 已在 Task 1.4-1.6 中實現動態 breadcrumb

### Task 2.3: 確認運動記錄頁面 Breadcrumb
- **Status**: ✅ DONE
- **Priority**: P2
- **Dependencies**: Task 1.7, 1.8
- **Description**:
  - 驗證深層路徑 Breadcrumb 完整顯示
  - 驗證各層級可點擊跳轉
- **Verification**: 按 quickstart.md Scenario 4 測試通過
- **Notes**: 已在 Task 1.7-1.8 中實現深層 breadcrumb

### Task 2.4: 確認導航高亮狀態
- **Status**: ✅ DONE
- **Priority**: P2
- **Dependencies**: Task 1.1-1.9
- **Description**:
  - 驗證 Header 中當前區塊正確高亮
  - `/schools/*` 路徑高亮「學校管理」
  - `/students/*` 路徑高亮「學生管理」
  - `/map` 路徑高亮「地圖視覺化」
- **Verification**: 按 quickstart.md Scenario 3 測試通過
- **Notes**: Header 元件已有路由匹配高亮邏輯

---

## Phase 3: US3 - 地圖頁面全寬模式 (P3)

### Task 3.1: 驗證地圖頁面全寬體驗
- **Status**: ✅ DONE
- **Priority**: P3
- **Dependencies**: Task 1.9
- **Description**:
  - 確認 Header 正常顯示
  - 確認地圖佔滿剩餘空間
  - 確認無側邊 padding
  - 確認 Breadcrumb 不顯示
- **Verification**: 按 quickstart.md Scenario 6 測試通過
- **Notes**: 已在 Task 1.9 中使用 `fullWidth={true}` 和 `showBreadcrumb={false}`

---

## Phase 4: Verification

### Task 4.1: 執行完整手動測試
- **Status**: ⬜ TODO
- **Priority**: P1
- **Dependencies**: All Phase 1-3 tasks
- **Description**:
  - 執行 quickstart.md 中的所有 8 個 Scenario
  - 記錄測試結果
  - 修復發現的問題
- **Test Scenarios**:
  1. Header 導航列顯示 (US1)
  2. Header 導航功能 (US1)
  3. 導航高亮狀態 (US1)
  4. Breadcrumb 顯示 (US2)
  5. Breadcrumb 導航 (US2)
  6. 地圖頁面全寬模式 (US3)
  7. 認證保護 (FR-009)
  8. 功能保持 (FR-008)
- **Verification**: 所有 Scenario 通過

### Task 4.2: 建立 Pull Request
- **Status**: ⬜ TODO
- **Priority**: P1
- **Dependencies**: Task 4.1
- **Description**:
  - 確認所有變更已提交
  - 建立 PR 到 main 分支
  - 填寫 PR 描述（包含測試結果）
- **Verification**: PR 建立成功

---

## Implementation Notes

### Migration Pattern

從 ProtectedRoute 遷移到 MainLayout 的標準模式：

```tsx
// 修改前
import ProtectedRoute from '@/components/auth/ProtectedRoute';

export default function SomePage() {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow">
          {/* 自訂 header */}
        </header>
        <main className="max-w-7xl mx-auto py-6">
          {/* 內容 */}
        </main>
      </div>
    </ProtectedRoute>
  );
}

// 修改後
import MainLayout from '@/components/layout/MainLayout';
import type { BreadcrumbItem } from '@/components/layout/Breadcrumb';

export default function SomePage() {
  const breadcrumbItems: BreadcrumbItem[] = [
    { label: '首頁', href: '/dashboard' },
    { label: '學校管理', href: '/schools' },
    { label: '新增學校' }, // 最後一項無 href
  ];

  return (
    <MainLayout title="新增學校" breadcrumbItems={breadcrumbItems}>
      <div className="bg-white shadow rounded-lg p-6">
        {/* 只需內容區塊 */}
      </div>
    </MainLayout>
  );
}
```

### Dynamic Breadcrumb Pattern

對於需要顯示實體名稱的頁面：

```tsx
const breadcrumbItems: BreadcrumbItem[] = [
  { label: '首頁', href: '/dashboard' },
  { label: '學校管理', href: '/schools' },
  { label: school?.name || `學校 #${id}` }, // 資料載入中顯示 ID
];
```

### Map Page Pattern

```tsx
<MainLayout fullWidth showBreadcrumb={false}>
  {/* 地圖內容 */}
</MainLayout>
```

---

## Progress Tracking

| Phase | Total | Done | Remaining |
|-------|-------|------|-----------|
| Phase 0 | 2 | 2 | 0 |
| Phase 1 | 9 | 9 | 0 |
| Phase 2 | 4 | 4 | 0 |
| Phase 3 | 1 | 1 | 0 |
| Phase 4 | 2 | 0 | 2 |
| **Total** | **18** | **16** | **2** |

**Completion**: 88.9% (16/18 tasks)
