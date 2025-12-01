# ICACP - User Authentication System

## 專案概述
這是一個完整的用戶認證系統，包含管理員和學校職員角色管理。

### 技術棧
- **後端**: Go 1.21+ with Gin Framework
- **前端**: Next.js 14 (Pages Router) with TypeScript
- **數據庫**: MySQL 8.0+
- **樣式**: Tailwind CSS
- **狀態管理**: React Query

## 當前開發環境狀態

### ✅ 已完成
1. ✓ 從 GitHub clone 專案代碼
2. ✓ 創建專案目錄結構
3. ✓ 前端環境完全設置完成
   - Next.js 14 配置
   - TypeScript 配置
   - Tailwind CSS 配置
   - 依賴安裝完成（427 packages）
   - API client, Auth utilities, Validation schemas
   - AuthContext 和基本頁面（Login, Dashboard）

### ⚠️ 需要完成
1. **安裝 Go 1.21+**（後端必需）
2. **安裝/配置 MySQL 8.0+**（數據庫必需）

## 安裝 Go

### Windows 安裝方式：

#### 方式 1: 使用安裝程式（推薦）
1. 訪問：https://go.dev/dl/
2. 下載 Windows 安裝程式（例如：go1.23.x.windows-amd64.msi）
3. 執行安裝程式
4. 重新啟動終端並驗證：`go version`

#### 方式 2: 使用 Chocolatey
```bash
choco install golang
```

#### 方式 3: 使用 Scoop
```bash
scoop install go
```

## 安裝 MySQL

### Windows 安裝方式：

#### 方式 1: MySQL Installer（推薦）
1. 訪問：https://dev.mysql.com/downloads/installer/
2. 下載 MySQL Installer
3. 安裝 MySQL Server 8.0+
4. 記錄 root 密碼

#### 方式 2: Docker（較簡單）
```bash
docker run --name mysql-icacp -e MYSQL_ROOT_PASSWORD=yourpassword -e MYSQL_DATABASE=acap_dev -p 3306:3306 -d mysql:8.0
```

## 啟動專案

### 前端開發伺服器
```bash
cd frontend
npm run dev
```
訪問：http://localhost:3000

### 後端開發伺服器（安裝 Go 後）
1. 創建 `backend/.env` 文件：
```env
DATABASE_URL="root:yourpassword@tcp(localhost:3306)/acap_dev?charset=utf8mb4&parseTime=True&loc=Local"
JWT_SECRET="your-32-plus-character-secret-key-here-change-in-production"
ADMIN_WHITELIST="admin@example.com"
PORT=8080
FRONTEND_URL="http://localhost:3000"
```

2. 生成 JWT Secret：
```bash
openssl rand -base64 32
```

3. 初始化 Go 專案：
```bash
cd backend
go mod init github.com/yourusername/acap-backend
go get github.com/gin-gonic/gin@v1.9.1
go get gorm.io/gorm@v1.25.5
go get gorm.io/driver/mysql@v1.5.2
go get github.com/golang-jwt/jwt/v5@v5.2.0
go get golang.org/x/crypto@v0.17.0
go get github.com/gin-contrib/cors@v1.5.0
go get github.com/joho/godotenv@v1.5.1
```

4. 執行後端（按照 `specs/001-user-auth/quickstart.md` 實作代碼後）：
```bash
go run cmd/server/main.go
```

## 專案結構

```
ICACP/
├── backend/               # Go 後端
│   ├── cmd/
│   │   └── server/       # 主程序入口
│   ├── internal/
│   │   ├── auth/         # 認證邏輯
│   │   ├── models/       # 數據模型
│   │   ├── database/     # 數據庫連接
│   │   └── config/       # 配置管理
│   └── tests/            # 測試
├── frontend/             # Next.js 前端
│   ├── src/
│   │   ├── pages/        # 頁面
│   │   ├── lib/          # 工具函數
│   │   ├── context/      # React Context
│   │   ├── components/   # 組件
│   │   └── styles/       # 樣式
│   └── public/           # 靜態資源
├── specs/                # 規格文檔
│   └── 001-user-auth/    # 用戶認證規格
└── tests/                # 集成測試

```

## 下一步

1. **安裝 Go 和 MySQL**
2. **實作後端代碼**：按照 `specs/001-user-auth/quickstart.md` 的步驟實作
3. **測試 API**：使用 Postman 或 curl 測試後端 API
4. **前後端聯調**：確保前端可以成功呼叫後端 API

## 參考文檔

- 詳細實作步驟：`specs/001-user-auth/quickstart.md`
- 數據模型：`specs/001-user-auth/data-model.md`
- API 規格：`specs/001-user-auth/spec.md`
- 開發計劃：`specs/001-user-auth/plan.md`

## 環境檢查

當前環境狀態：
- ✅ Node.js: v24.4.1
- ✅ npm: 11.4.2
- ❌ Go: 未安裝（需要 1.21+）
- ❌ MySQL: 未確認
