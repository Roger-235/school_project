# ICACP - 學童體適能整合平台

ICACP (Integrated Children's Athletic Capacity Platform) 是一個專為台灣各級學校設計的學童體適能資料管理系統，提供學校、學生、運動測驗記錄的完整管理功能。

---

## 功能特色

- **學校管理**：支援台灣 22 縣市學校資料管理
- **學生管理**：學生基本資料與學籍管理
- **運動記錄**：體適能測驗成績登錄與歷史追蹤
- **地圖視覺化**：台灣地圖顯示各縣市資料統計
- **Excel 匯入**：批次匯入學生名單與運動記錄
- **分析報表**：學生表現趨勢、進步分析、學校排名

---

## 技術架構

| 層級 | 技術 |
|------|------|
| 前端 | Next.js 14, React 18, TypeScript, Tailwind CSS |
| 後端 | Go 1.24+, Gin Framework, GORM |
| 資料庫 | MySQL 8.0+ |
| 快取 | Redis 7.x |
| 地圖 | Leaflet.js, React-Leaflet |
| 狀態管理 | React Query v5 |

---

## 快速開始

### 環境需求

- Node.js 18+ 與 npm
- Go 1.21+
- MySQL 8.0+
- Redis 6.0+ (選用)
- Docker 與 Docker Compose (選用)

### 安裝步驟

```bash
# 1. 複製專案
git clone https://github.com/wei979/ICACP.git
cd ICACP

# 2. 啟動資料庫服務 (Docker)
docker-compose up -d mysql redis

# 3. 設定後端環境變數
cp backend/.env.example backend/.env
# 編輯 .env 設定資料庫連線資訊

# 4. 啟動後端
cd backend
go run cmd/server/main.go

# 5. 啟動前端 (另開終端機)
cd frontend
npm install
npm run dev
```

### 存取位址

| 服務 | 位址 |
|------|------|
| 前端應用 | http://localhost:3000 |
| 後端 API | http://localhost:8080 |
| 資料庫管理 | http://localhost:8081 |

---

## 專案結構

```
ICACP/
├── backend/                 # Go 後端 API
│   ├── cmd/                # 主程式入口
│   │   └── server/        # API 伺服器
│   ├── internal/          # 內部模組
│   │   ├── handlers/      # HTTP 處理器
│   │   ├── services/      # 業務邏輯
│   │   └── models/        # 資料模型
│   └── config/            # 設定檔
│
├── frontend/               # Next.js 前端
│   ├── src/
│   │   ├── pages/         # 頁面元件
│   │   ├── components/    # UI 元件
│   │   ├── hooks/         # React Query Hooks
│   │   ├── lib/           # 工具函數
│   │   └── types/         # TypeScript 型別
│   └── public/            # 靜態資源
│
├── docs/                   # 技術文件
│   ├── ARCHITECTURE.md    # 系統架構
│   ├── API.md             # API 文件
│   ├── DATABASE.md        # 資料庫結構
│   └── DEPLOYMENT.md      # 部署指南
│
├── specs/                  # 功能規格文件
│   ├── 001-user-auth/
│   ├── 002-map-visualization/
│   ├── 003-student-sports-data/
│   └── ...
│
└── docker-compose.yml      # Docker 服務設定
```

---

## API 端點概覽

| 資源 | 端點 | 說明 |
|------|------|------|
| 學校 | GET /api/v1/schools | 學校列表與管理 |
| 學生 | GET /api/v1/students | 學生搜尋與管理 |
| 運動類型 | GET /api/v1/sport-types | 運動類型定義 |
| 運動記錄 | GET /api/v1/sport-records | 測驗記錄管理 |
| 縣市統計 | GET /api/v1/counties/statistics | 各縣市資料統計 |
| Excel 匯入 | POST /api/v1/import/* | 批次資料匯入 |

詳細 API 文件請參考 [docs/API.md](docs/API.md)。

---

## 文件索引

| 文件 | 說明 |
|------|------|
| [ARCHITECTURE.md](docs/ARCHITECTURE.md) | 系統架構與技術決策 |
| [API.md](docs/API.md) | 完整 API 端點文件 |
| [DATABASE.md](docs/DATABASE.md) | 資料庫結構與關聯 |
| [DEPLOYMENT.md](docs/DEPLOYMENT.md) | 部署指南與維運說明 |
| [CLAUDE.md](CLAUDE.md) | 開發指引與技術摘要 |

---

## 開發指令

### 後端

```bash
cd backend

# 啟動開發伺服器
go run cmd/server/main.go

# 編譯正式版本
go build -o server ./cmd/server/main.go

# 執行測試
go test ./...
```

### 前端

```bash
cd frontend

# 啟動開發伺服器
npm run dev

# 編譯正式版本
npm run build

# 執行 lint 檢查
npm run lint

# 型別檢查
npx tsc --noEmit
```

### Docker

```bash
# 啟動所有服務
docker-compose up -d

# 查看服務狀態
docker-compose ps

# 停止所有服務
docker-compose down
```

---

## 部署資訊

### 目前正式環境

| 項目 | 位址 |
|------|------|
| 前端 (Vercel) | https://icacp-srvy.vercel.app |
| 後端 API (EC2) | http://43.213.29.25:8080 |

### 部署流程

**後端 (EC2):**
```bash
ssh -i key.pem ec2-user@43.213.29.25
cd ~/ICACP/backend
git pull
sudo systemctl stop sport-backend
go build -o server ./cmd/server/main.go
cp server sport-backend
sudo systemctl start sport-backend
```

**前端 (Vercel):**
- 推送至 `main` 分支自動觸發部署

詳細部署說明請參考 [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md)。

---

## 已完成功能

- [x] 使用者認證系統（前端）
- [x] 學校資料管理 (CRUD)
- [x] 學生資料管理 (CRUD)
- [x] 運動記錄管理 (CRUD + 稽核軌跡)
- [x] 台灣地圖視覺化
- [x] 縣市統計與 Redis 快取
- [x] Excel 批次匯入（學生、運動記錄）
- [x] 學生表現分析與趨勢圖表
- [x] 全域導覽與麵包屑

## 待完成功能

- [ ] 後端 JWT 認證中介軟體
- [ ] 角色權限管理（管理員/學校職員）
- [ ] 資料匯出功能

---

## 授權

本專案為私有專案，未經授權不得使用或散布。

---

## 聯絡資訊

- GitHub: https://github.com/wei979/ICACP
- Issues: https://github.com/wei979/ICACP/issues
