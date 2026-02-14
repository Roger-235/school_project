# Data Model: 前端導覽流程增強

**Feature**: 004-navigation-enhancement
**Date**: 2025-12-10
**Note**: 本功能為純前端重構，無資料庫變更，僅定義前端資料結構。

## Overview

本功能不涉及後端資料模型變更。以下定義前端導航相關的 TypeScript 介面，這些介面已在現有程式碼中定義。

---

## Frontend Interfaces

### BreadcrumbItem

麵包屑導航項目介面，已定義於 `frontend/src/components/layout/Breadcrumb.tsx`：

```typescript
export interface BreadcrumbItem {
  label: string;    // 顯示文字（如「學校管理」、學校名稱）
  href?: string;    // 連結路徑（最後一項通常無路徑）
}
```

### NavigationItem

Header 導航項目介面，已定義於 `frontend/src/components/layout/Header.tsx`：

```typescript
interface NavItem {
  href: string;       // 連結路徑
  label: string;      // 顯示文字
  icon: React.ReactNode; // 圖示 JSX
}
```

### MainLayoutProps

主佈局元件 Props 介面，已定義於 `frontend/src/components/layout/MainLayout.tsx`：

```typescript
interface MainLayoutProps {
  children: React.ReactNode;      // 頁面內容
  title?: string;                 // 頁面標題
  breadcrumbItems?: BreadcrumbItem[]; // 自定義麵包屑
  showBreadcrumb?: boolean;       // 是否顯示麵包屑（預設 true）
  fullWidth?: boolean;            // 是否全寬模式（預設 false）
  className?: string;             // 額外 CSS 類別
}
```

---

## Breadcrumb Configuration per Page

每個頁面的 Breadcrumb 配置：

| 頁面 | Breadcrumb 配置 |
|------|-----------------|
| `/schools/new` | `首頁 > 學校管理 > 新增學校` |
| `/schools/[id]` | `首頁 > 學校管理 > {school.name}` |
| `/schools/[id]/edit` | `首頁 > 學校管理 > {school.name} > 編輯` |
| `/students/new` | `首頁 > 學生管理 > 新增學生` |
| `/students/[id]` | `首頁 > 學生管理 > {student.name}` |
| `/students/[id]/edit` | `首頁 > 學生管理 > {student.name} > 編輯` |
| `/students/[id]/records/new` | `首頁 > 學生管理 > {student.name} > 新增運動記錄` |
| `/students/[id]/records/[recordId]/edit` | `首頁 > 學生管理 > {student.name} > 運動記錄 > 編輯` |
| `/map` | 不顯示（`showBreadcrumb={false}`） |

---

## No Backend Changes Required

本功能不需要：
- 資料庫 schema 變更
- 新的 API endpoints
- 後端模型修改

所有變更僅限於前端頁面結構調整。
