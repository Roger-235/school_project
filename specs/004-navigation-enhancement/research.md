# Research: 前端導覽流程增強

**Feature**: 004-navigation-enhancement
**Date**: 2025-12-10
**Purpose**: 研究現有元件能力、確認技術可行性

## Research Summary

本功能為純前端重構，主要將 9 個使用 `ProtectedRoute` 的頁面改為使用 `MainLayout`。經研究確認，所有必要元件已存在且功能完整。

---

## Research Item 1: MainLayout 元件能力

### Question
MainLayout 是否已支援所有必要功能（認證檢查、fullWidth、breadcrumb）？

### Findings

經過程式碼分析 (`frontend/src/components/layout/MainLayout.tsx`):

```typescript
interface MainLayoutProps {
  children: React.ReactNode;
  title?: string;
  breadcrumbItems?: BreadcrumbItem[];
  showBreadcrumb?: boolean;
  fullWidth?: boolean;
  className?: string;
}
```

**已支援功能**:
- ✅ 認證檢查（與 ProtectedRoute 等效）
- ✅ `fullWidth` prop 用於地圖頁面全寬顯示
- ✅ `breadcrumbItems` prop 用於自定義麵包屑
- ✅ `showBreadcrumb` prop 用於控制是否顯示
- ✅ `title` prop 用於頁面標題

### Decision
**直接使用現有 MainLayout**，無需修改元件本身。

### Rationale
MainLayout 已完整實現所有需求功能，包括認證保護、全寬模式、自定義麵包屑。

### Alternatives Considered
1. **修改 ProtectedRoute 加入 Header** - 拒絕，會導致重複邏輯
2. **建立新的 PageLayout 元件** - 拒絕，MainLayout 已足夠

---

## Research Item 2: Breadcrumb 動態名稱支援

### Question
如何在 Breadcrumb 中顯示實體名稱（學校名稱、學生姓名）而非 ID？

### Findings

經過程式碼分析 (`frontend/src/components/layout/Breadcrumb.tsx`):

```typescript
export interface BreadcrumbItem {
  label: string;
  href?: string;
}
```

**現有機制**:
- Breadcrumb 支援 `items` prop 傳入自定義項目
- 如不傳入 `items`，會自動根據路由生成（但只顯示 ID）
- 每個頁面可以手動建構 `breadcrumbItems` 陣列

### Decision
**在頁面層級建構 breadcrumbItems**，使用已載入的實體資料。

### Rationale
- 頁面已有實體資料（如 school.name, student.name）
- 可直接使用這些資料建構 breadcrumb
- 資料載入中時顯示 ID 作為 fallback

### Implementation Pattern
```tsx
// 在頁面元件中
const breadcrumbItems = [
  { label: '首頁', href: '/dashboard' },
  { label: '學校管理', href: '/schools' },
  { label: school?.name || `#${id}` }, // 動態名稱
];

return (
  <MainLayout breadcrumbItems={breadcrumbItems}>
    {/* 頁面內容 */}
  </MainLayout>
);
```

### Alternatives Considered
1. **使用 Context 共享實體資料** - 拒絕，過度複雜
2. **API 新增 name lookup 端點** - 拒絕，資料已在頁面可用

---

## Research Item 3: 地圖頁面全寬模式

### Question
如何保持地圖頁面的全螢幕體驗？

### Findings

經過程式碼分析：

**MainLayout fullWidth 模式**:
```tsx
<div className={fullWidth ? '' : 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'}>
```

當 `fullWidth={true}` 時：
- 無最大寬度限制
- 無側邊 padding
- 內容佔滿整個視窗寬度

**地圖頁面特殊需求**:
- 不需要 Breadcrumb（地圖是頂層頁面）
- 需要 Header 保持導航
- 地圖區域需要佔滿剩餘高度

### Decision
**使用 `fullWidth={true}` 和 `showBreadcrumb={false}`**

### Rationale
MainLayout 的 fullWidth 模式完全符合地圖頁面需求，無需額外樣式調整。

### Implementation
```tsx
<MainLayout fullWidth showBreadcrumb={false}>
  {/* 地圖內容 */}
</MainLayout>
```

---

## Research Item 4: 頁面結構調整模式

### Question
從 ProtectedRoute 遷移到 MainLayout 需要哪些結構調整？

### Findings

**現有 ProtectedRoute 頁面結構**:
```tsx
<ProtectedRoute>
  <div className="min-h-screen bg-gray-50">
    <header className="bg-white shadow">
      {/* 自訂 header，含返回按鈕 */}
    </header>
    <main className="max-w-7xl mx-auto py-6">
      {/* 內容 */}
    </main>
  </div>
</ProtectedRoute>
```

**遷移後 MainLayout 結構**:
```tsx
<MainLayout title="頁面標題" breadcrumbItems={items}>
  {/* 只需內容區塊 */}
  <div className="bg-white shadow rounded-lg p-6">
    {/* 內容 */}
  </div>
</MainLayout>
```

### Decision
**移除自訂 header 和外層容器**，僅保留核心內容。

### Rationale
MainLayout 已提供：
- Header（全域導航）
- Breadcrumb（路徑導航）
- 頁面標題
- 適當的 padding 和 max-width

### Migration Checklist
1. 移除 ProtectedRoute 包裝
2. 移除 `min-h-screen bg-gray-50` 外層容器
3. 移除自訂 header（含返回按鈕）
4. 建構 breadcrumbItems 陣列
5. 使用 MainLayout 包裝

---

## Technical Decisions Summary

| 決策 | 選擇 | 理由 |
|------|------|------|
| 佈局元件 | 使用現有 MainLayout | 已支援所有需求功能 |
| Breadcrumb 動態名稱 | 頁面層級建構 | 資料已在頁面可用 |
| 地圖頁面 | fullWidth + showBreadcrumb=false | MainLayout 原生支援 |
| 頁面結構 | 移除自訂 header，僅保留內容 | MainLayout 提供統一結構 |

## Dependencies Verified

- [x] MainLayout 元件 - 已存在，功能完整
- [x] Header 元件 - 已存在，包含四個導航連結
- [x] Breadcrumb 元件 - 已存在，支援自定義項目
- [x] 認證 Context - 已存在，MainLayout 已整合

## Risks & Mitigations

| 風險 | 影響 | 緩解措施 |
|------|------|---------|
| 現有功能回歸 | 中 | 每個頁面修改後立即手動測試 |
| 樣式不一致 | 低 | 使用 MainLayout 統一樣式 |
| 載入時 Breadcrumb 顯示 ID | 低 | 資料載入後自動更新為名稱 |
