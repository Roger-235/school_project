# ICACP 系統架構文件

> 版本: 1.0
> 最後更新: 2025-12-17
> 適用對象: 開發人員、系統維護人員、交接人員

---

## 目錄

1. [系統概述](#1-系統概述)
2. [技術架構](#2-技術架構)
3. [目錄結構](#3-目錄結構)
4. [核心模組說明](#4-核心模組說明)
5. [資料流程](#5-資料流程)
6. [第三方套件](#6-第三方套件)
7. [設計決策與模式](#7-設計決策與模式)

---

## 1. 系統概述

### 1.1 專案名稱
ICACP (Integrated Children's Athletic Capacity Platform) - 學童體適能整合平台

### 1.2 專案目標
提供台灣各級學校管理學童體適能測驗資料的完整解決方案，包含：
- 學校與學生資料管理
- 運動測驗記錄登錄與追蹤
- 台灣地圖視覺化統計
- Excel 批次匯入功能
- 學生表現分析與趨勢圖表

### 1.3 系統架構圖

```
┌─────────────────────────────────────────────────────────────────┐
│                        使用者瀏覽器                               │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                     Next.js 前端應用程式                          │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐  │
│  │   頁面元件   │  │  React Query │  │     Leaflet 地圖        │  │
│  │  (Pages)    │  │  (狀態管理)   │  │   (地圖視覺化)          │  │
│  └─────────────┘  └─────────────┘  └─────────────────────────┘  │
│                          │                                       │
│                    API Client (Axios)                            │
└─────────────────────────────────────────────────────────────────┘
                                │
                         HTTP/HTTPS
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                      Go 後端 API 伺服器                           │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐  │
│  │  Gin Router │  │  Handlers   │  │       Services          │  │
│  │  (路由層)    │  │  (處理層)    │  │      (業務邏輯層)        │  │
│  └─────────────┘  └─────────────┘  └─────────────────────────┘  │
│                          │                                       │
│                    GORM ORM                                      │
└─────────────────────────────────────────────────────────────────┘
                                │
                    ┌───────────┴───────────┐
                    │                       │
                    ▼                       ▼
        ┌───────────────────┐   ┌───────────────────┐
        │    MySQL 8.0      │   │    Redis 7        │
        │   (主要資料庫)     │   │   (快取層)        │
        └───────────────────┘   └───────────────────┘
```

---

## 2. 技術架構

### 2.1 後端技術棧

| 類別 | 技術 | 版本 | 用途 |
|------|------|------|------|
| 程式語言 | Go | 1.24+ | 主要開發語言 |
| Web 框架 | Gin | 1.9.1 | HTTP 路由與中介軟體 |
| ORM | GORM | 1.25.5 | 資料庫操作抽象層 |
| 資料庫驅動 | MySQL Driver | 1.5.2 | MySQL 連線驅動 |
| 快取 | go-redis | 8.11.5 | Redis 客戶端 |
| Excel 處理 | excelize | 2.10.0 | Excel 檔案讀寫 |
| 環境變數 | godotenv | 1.5.1 | .env 檔案載入 |

### 2.2 前端技術棧

| 類別 | 技術 | 版本 | 用途 |
|------|------|------|------|
| 框架 | Next.js | 14.2.3 | React 全端框架 (Pages Router) |
| UI 函式庫 | React | 18.3.1 | 使用者介面建構 |
| 程式語言 | TypeScript | 5.x | 型別安全 |
| 狀態管理 | React Query | 5.28.4 | 伺服器狀態管理與快取 |
| 表單處理 | React Hook Form | 7.67.0 | 表單狀態管理 |
| 表單驗證 | Zod | 3.22.4 | Schema 驗證 |
| HTTP 客戶端 | Axios | 1.6.8 | API 請求 |
| 地圖 | Leaflet | 1.9.4 | 互動式地圖 |
| 地圖 React 封裝 | React-Leaflet | 4.2.1 | Leaflet React 元件 |
| 圖表 | Recharts | 3.5.1 | 資料視覺化圖表 |
| CSS 框架 | Tailwind CSS | 3.4.3 | 原子化 CSS |

### 2.3 基礎設施

| 類別 | 技術 | 版本 | 用途 |
|------|------|------|------|
| 資料庫 | MySQL | 8.0+ | 主要資料儲存 |
| 快取 | Redis | 7.x | 縣市統計快取 |
| 容器化 | Docker | - | 開發環境容器 |
| 容器編排 | Docker Compose | - | 多容器管理 |

---

## 3. 目錄結構

### 3.1 後端目錄結構

```
backend/
├── cmd/                           # 可執行程式入口
│   ├── server/
│   │   └── main.go               # API 伺服器主程式
│   ├── seed/
│   │   └── main.go               # 資料庫種子資料工具
│   ├── geocode_schools/
│   │   └── main.go               # 學校地理編碼工具
│   └── update_coordinates/
│       └── main.go               # 座標更新工具
│
├── config/
│   └── redis.go                  # Redis 連線設定
│
├── internal/                      # 內部套件（不對外暴露）
│   ├── auth/                     # 認證模組（待實作）
│   │
│   ├── database/
│   │   ├── migrate.go            # 資料庫遷移邏輯
│   │   └── seed/
│   │       ├── sport_types.go    # 運動類型種子資料
│   │       └── performance_test.go
│   │
│   ├── handlers/                 # HTTP 處理器（Controller 層）
│   │   ├── school_handler.go     # 學校 API
│   │   ├── student_handler.go    # 學生 API
│   │   ├── sport_record_handler.go # 運動記錄 API
│   │   ├── sport_type_handler.go # 運動類型 API
│   │   ├── county_handler.go     # 縣市統計 API
│   │   └── import_handler.go     # Excel 匯入 API
│   │
│   ├── models/                   # 資料模型（Entity 層）
│   │   ├── school.go             # 學校實體
│   │   ├── student.go            # 學生實體
│   │   ├── sport_record.go       # 運動記錄實體
│   │   ├── sport_record_audit.go # 運動記錄稽核軌跡
│   │   ├── sport_type.go         # 運動類型定義
│   │   ├── county.go             # 縣市統計模型
│   │   └── import.go             # 匯入預覽模型
│   │
│   └── services/                 # 業務邏輯層（Service 層）
│       ├── school_service.go     # 學校服務
│       ├── student_service.go    # 學生服務
│       ├── sport_record_service.go # 運動記錄服務
│       ├── sport_type_service.go # 運動類型服務
│       ├── county_service.go     # 縣市統計服務（含 Redis 快取）
│       ├── import_service.go     # Excel 匯入服務
│       ├── import_utils.go       # 匯入工具函數
│       ├── preview_store.go      # 預覽資料記憶體儲存
│       └── template_service.go   # Excel 模板產生服務
│
├── .env                          # 環境變數設定
├── .env.example                  # 環境變數範本
├── go.mod                        # Go 模組定義
└── go.sum                        # 相依套件校驗
```

### 3.2 前端目錄結構

```
frontend/
├── src/
│   ├── components/               # React 元件
│   │   ├── analysis/            # 分析圖表元件
│   │   │   ├── PerformanceAnalysis.tsx
│   │   │   ├── TrendChart.tsx
│   │   │   ├── SchoolRankingChart.tsx
│   │   │   └── ProgressIndicator.tsx
│   │   │
│   │   ├── auth/                # 認證相關元件
│   │   │   └── ProtectedRoute.tsx
│   │   │
│   │   ├── common/              # 共用 UI 元件
│   │   │   ├── ConfirmDialog.tsx
│   │   │   ├── CountySelect.tsx
│   │   │   ├── LoadingButton.tsx
│   │   │   ├── LoadingSpinner.tsx
│   │   │   └── Toast.tsx
│   │   │
│   │   ├── import/              # Excel 匯入精靈元件
│   │   │   ├── FileUpload.tsx
│   │   │   ├── GradeClassSelector.tsx
│   │   │   ├── ImportResult.tsx
│   │   │   ├── PreviewTable.tsx
│   │   │   ├── RecordsImportWizard.tsx
│   │   │   ├── SchoolSelector.tsx
│   │   │   └── StudentImportWizard.tsx
│   │   │
│   │   ├── layout/              # 版面配置元件
│   │   │   ├── Breadcrumb.tsx
│   │   │   ├── Header.tsx
│   │   │   └── MainLayout.tsx
│   │   │
│   │   ├── map/                 # 地圖視覺化元件
│   │   │   ├── CountyLayer.tsx
│   │   │   ├── CountyPopup.tsx
│   │   │   ├── MapControls.tsx
│   │   │   ├── MapView.tsx
│   │   │   ├── SchoolDetailPanel.tsx
│   │   │   └── SchoolMarkerLayer.tsx
│   │   │
│   │   ├── records/             # 運動記錄管理元件
│   │   │   ├── RecordHistoryModal.tsx
│   │   │   ├── SportRecordCard.tsx
│   │   │   ├── SportRecordForm.tsx
│   │   │   ├── SportRecordList.tsx
│   │   │   └── SportTypeSelect.tsx
│   │   │
│   │   ├── schools/             # 學校管理元件
│   │   │   ├── SchoolCard.tsx
│   │   │   ├── SchoolForm.tsx
│   │   │   └── SchoolList.tsx
│   │   │
│   │   └── students/            # 學生管理元件
│   │       ├── EmptySearchResult.tsx
│   │       ├── StudentCard.tsx
│   │       ├── StudentForm.tsx
│   │       ├── StudentList.tsx
│   │       ├── StudentSearchForm.tsx
│   │       └── StudentSearchResults.tsx
│   │
│   ├── context/
│   │   └── AuthContext.tsx      # 全域認證狀態
│   │
│   ├── hooks/                   # React Query Hooks
│   │   ├── useCountyStats.ts
│   │   ├── useImport.ts
│   │   ├── useMapState.ts
│   │   ├── useSchools.ts
│   │   ├── useSchoolsForMap.ts
│   │   ├── useSportRecords.ts
│   │   ├── useSportTypes.ts
│   │   ├── useStudentAnalysis.ts
│   │   └── useStudents.ts
│   │
│   ├── lib/                     # 工具函數與 API 客戶端
│   │   ├── api/                 # API 模組
│   │   │   ├── import.ts
│   │   │   ├── schools.ts
│   │   │   ├── sport-records.ts
│   │   │   ├── sport-types.ts
│   │   │   └── students.ts
│   │   ├── api.ts               # Axios 基礎設定
│   │   ├── auth.ts              # Token 管理
│   │   ├── leaflet-utils.ts     # 地圖工具函數
│   │   └── validation.ts        # 表單驗證
│   │
│   ├── pages/                   # Next.js 頁面
│   │   ├── _app.tsx             # 應用程式包裝器
│   │   ├── index.tsx            # 首頁
│   │   ├── login.tsx            # 登入頁
│   │   ├── dashboard.tsx        # 儀表板
│   │   ├── map.tsx              # 地圖頁
│   │   ├── api/                 # API 路由（代理後端）
│   │   ├── schools/             # 學校相關頁面
│   │   ├── students/            # 學生相關頁面
│   │   └── import/              # 匯入相關頁面
│   │
│   ├── types/                   # TypeScript 型別定義
│   │   ├── county.ts
│   │   ├── import.ts
│   │   ├── schoolMap.ts
│   │   └── sports.ts
│   │
│   └── styles/                  # 樣式檔案
│       ├── globals.css
│       └── map.css
│
├── public/                      # 靜態資源
├── .env.local                   # 開發環境變數
├── .env.production              # 正式環境變數
├── next.config.js               # Next.js 設定
├── tailwind.config.ts           # Tailwind 設定
├── tsconfig.json                # TypeScript 設定
└── package.json                 # npm 相依套件
```

---

## 4. 核心模組說明

### 4.1 後端模組

#### Handler 層（控制器）
負責處理 HTTP 請求，解析參數，呼叫 Service 層，回傳 JSON 回應。

```go
// 範例：SchoolHandler
type SchoolHandler struct {
    service *SchoolService
}

func (h *SchoolHandler) List(c *gin.Context) {
    // 1. 解析查詢參數
    // 2. 呼叫 service.List()
    // 3. 回傳 JSON 回應
}
```

#### Service 層（業務邏輯）
封裝核心業務邏輯，包含資料驗證、業務規則、交易處理。

```go
// 範例：SchoolService
type SchoolService struct {
    db *gorm.DB
}

func (s *SchoolService) Create(req *CreateSchoolRequest) (*School, error) {
    // 1. 驗證資料
    // 2. 建立資料庫記錄
    // 3. 回傳結果
}
```

#### Model 層（資料模型）
定義資料結構、資料庫對應、DTO（資料傳輸物件）。

### 4.2 前端模組

#### Pages（頁面）
基於 Next.js Pages Router，每個檔案對應一個路由。

#### Components（元件）
可重用的 React 元件，按功能分類組織。

#### Hooks（自訂 Hook）
封裝 React Query 邏輯，提供資料獲取與快取功能。

#### Context（全域狀態）
使用 React Context 管理認證等全域狀態。

---

## 5. 資料流程

### 5.1 一般 API 請求流程

```
使用者操作
    │
    ▼
React Component (觸發事件)
    │
    ▼
React Query Hook (useQuery/useMutation)
    │
    ▼
API Client (Axios)
    │
    ▼
Next.js API Route (代理，僅開發環境)
    │
    ▼
Go Gin Router (路由匹配)
    │
    ▼
Handler (請求處理)
    │
    ▼
Service (業務邏輯)
    │
    ▼
GORM (資料庫操作)
    │
    ▼
MySQL (資料儲存)
```

### 5.2 縣市統計快取流程

```
請求縣市統計
    │
    ▼
CountyService.GetStatistics()
    │
    ├──→ 檢查 Redis 快取
    │         │
    │         ├── 命中 → 回傳快取資料
    │         │
    │         └── 未命中 ↓
    │
    ▼
查詢資料庫計算統計
    │
    ▼
寫入 Redis 快取 (TTL: 15 分鐘)
    │
    ▼
回傳統計資料
```

### 5.3 Excel 匯入流程

```
上傳 Excel 檔案
    │
    ▼
解析 Excel 內容 (excelize)
    │
    ▼
逐列驗證資料
    │
    ▼
產生預覽結果 (儲存於記憶體)
    │
    ▼
使用者確認匯入
    │
    ▼
批次寫入資料庫
    │
    ▼
清除預覽資料
    │
    ▼
回傳匯入結果
```

---

## 6. 第三方套件

### 6.1 後端套件 (go.mod)

| 套件 | 用途 |
|------|------|
| github.com/gin-gonic/gin | Web 框架 |
| gorm.io/gorm | ORM |
| gorm.io/driver/mysql | MySQL 驅動 |
| github.com/go-redis/redis/v8 | Redis 客戶端 |
| github.com/xuri/excelize/v2 | Excel 讀寫 |
| github.com/joho/godotenv | 環境變數載入 |
| github.com/google/uuid | UUID 產生 |
| github.com/golang-jwt/jwt/v5 | JWT 處理 |
| golang.org/x/crypto | 密碼雜湊 |

### 6.2 前端套件 (package.json)

| 套件 | 用途 |
|------|------|
| next | React 框架 |
| react, react-dom | UI 函式庫 |
| @tanstack/react-query | 伺服器狀態管理 |
| react-hook-form | 表單管理 |
| zod | Schema 驗證 |
| axios | HTTP 客戶端 |
| leaflet, react-leaflet | 地圖元件 |
| recharts | 圖表元件 |
| tailwindcss | CSS 框架 |
| typescript | 型別檢查 |

---

## 7. 設計決策與模式

### 7.1 資料庫設計決策

| 決策 | 說明 |
|------|------|
| 軟刪除 | 使用 `deleted_at` 欄位實現軟刪除，保留資料完整性 |
| 稽核軌跡 | `sport_record_audit` 表記錄所有修改歷史 |
| 複合索引 | `(school_id, student_number)` 確保學號在校內唯一 |

### 7.2 API 設計決策

| 決策 | 說明 |
|------|------|
| RESTful | 遵循 REST 原則設計 API |
| 分頁 | 使用 `page` 和 `page_size` 參數 |
| 回應格式 | 統一使用 `{ data: {...} }` 包裝 |

### 7.3 前端設計決策

| 決策 | 說明 |
|------|------|
| Pages Router | 使用 Next.js Pages Router（非 App Router） |
| React Query | 統一管理伺服器狀態與快取 |
| Zod + React Hook Form | 型別安全的表單驗證 |

### 7.4 快取策略

| 快取項目 | TTL | 說明 |
|---------|-----|------|
| 縣市統計 | 15 分鐘 | 統計資料變動頻率低 |
| React Query | 5 分鐘 | 前端預設快取時間 |

---

## 附錄

### A. 環境變數說明

請參考 [DEPLOYMENT.md](./DEPLOYMENT.md) 中的環境變數設定章節。

### B. API 端點清單

請參考 [API.md](./API.md) 中的完整 API 文件。

### C. 資料庫結構

請參考 [DATABASE.md](./DATABASE.md) 中的資料表定義。
