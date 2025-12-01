# ICACP Backend

Go backend service for ICACP user authentication system.

## 環境要求

- Go 1.21 或更高版本
- MySQL 8.0 或更高版本

## 快速開始

### 1. 安裝依賴

```bash
# 初始化 Go Modules
go mod init github.com/wei979/ICACP-backend

# 安裝依賴套件
go get github.com/gin-gonic/gin@v1.9.1
go get gorm.io/gorm@v1.25.5
go get gorm.io/driver/mysql@v1.5.2
go get github.com/golang-jwt/jwt/v5@v5.2.0
go get golang.org/x/crypto@v0.17.0
go get github.com/gin-contrib/cors@v1.5.0
go get github.com/joho/godotenv@v1.5.1
```

### 2. 配置環境變數

複製 `.env.example` 到 `.env` 並修改配置：

```bash
cp .env.example .env
```

**必須修改的配置：**

1. **DATABASE_URL**: 修改 MySQL 連接資訊
   ```
   DATABASE_URL="root:your_password@tcp(localhost:3306)/acap_dev?charset=utf8mb4&parseTime=True&loc=Local"
   ```

2. **JWT_SECRET**: 生成安全的密鑰
   ```bash
   # 使用 openssl 生成
   openssl rand -base64 32

   # 或使用 PowerShell (Windows)
   [Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Minimum 0 -Maximum 256 }))
   ```

3. **ADMIN_WHITELIST**: 設置管理員郵箱白名單
   ```
   ADMIN_WHITELIST="your_email@example.com"
   ```

### 3. 設置數據庫

**方式 A: 使用本地 MySQL**
```sql
CREATE DATABASE acap_dev CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

**方式 B: 使用 Docker**
```bash
docker run --name mysql-icacp \
  -e MYSQL_ROOT_PASSWORD=password \
  -e MYSQL_DATABASE=acap_dev \
  -p 3306:3306 \
  -d mysql:8.0
```

### 4. 運行後端服務

```bash
# 開發模式
go run cmd/server/main.go

# 或編譯後運行
go build -o server cmd/server/main.go
./server
```

服務將運行在: http://localhost:8080

## 專案結構

```
backend/
├── cmd/
│   └── server/          # 主程序入口
│       └── main.go
├── internal/            # 內部套件
│   ├── auth/           # 認證邏輯
│   │   ├── service.go
│   │   ├── handler.go
│   │   ├── middleware.go
│   │   └── whitelist.go
│   ├── models/         # 數據模型
│   │   └── user.go
│   ├── database/       # 數據庫連接
│   │   └── db.go
│   └── config/         # 配置管理
│       └── config.go
├── tests/              # 測試
│   ├── unit/          # 單元測試
│   └── integration/   # 集成測試
├── .env               # 環境變數（不提交到 Git）
├── .env.example       # 環境變數範本
└── go.mod             # Go 依賴管理
```

## API 端點

### 公開端點
- `POST /api/v1/auth/register` - 管理員註冊（需要白名單）
- `POST /api/v1/auth/login` - 用戶登入
- `GET /health` - 健康檢查

### 需要認證的端點
- `POST /api/v1/auth/logout` - 登出
- `GET /api/v1/auth/me` - 獲取當前用戶資訊

### 管理員專用端點
- `POST /api/v1/admin/users` - 創建學校職員帳號

## 測試

### 健康檢查
```bash
curl http://localhost:8080/health
```

### 管理員註冊
```bash
curl -X POST http://localhost:8080/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "SecurePass123"
  }'
```

### 登入
```bash
curl -X POST http://localhost:8080/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "SecurePass123"
  }'
```

### 獲取當前用戶（需要 token）
```bash
curl http://localhost:8080/api/v1/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## 環境變數說明

| 變數 | 說明 | 範例 |
|------|------|------|
| `DATABASE_URL` | MySQL 連接字串 | `root:password@tcp(localhost:3306)/acap_dev?...` |
| `JWT_SECRET` | JWT 簽名密鑰 | 至少 32 字元的隨機字串 |
| `ADMIN_WHITELIST` | 管理員郵箱白名單 | `admin@example.com,admin2@example.com` |
| `PORT` | 服務運行端口 | `8080` |
| `FRONTEND_URL` | 前端 URL（CORS） | `http://localhost:3000` |
| `ENVIRONMENT` | 運行環境 | `development`, `staging`, `production` |

## 開發指南

詳細的實作步驟請參考：
- `../specs/001-user-auth/quickstart.md` - 快速開始指南
- `../specs/001-user-auth/spec.md` - API 規格
- `../specs/001-user-auth/data-model.md` - 數據模型

## 安全注意事項

1. ⚠️ **絕對不要**將 `.env` 文件提交到 Git
2. ⚠️ 在生產環境中必須使用強隨機的 `JWT_SECRET`
3. ⚠️ 數據庫密碼應使用強密碼
4. ⚠️ 定期更新 `ADMIN_WHITELIST`

## 故障排除

### 無法連接數據庫
- 檢查 MySQL 是否運行：`mysql -u root -p`
- 檢查 `DATABASE_URL` 格式是否正確
- 檢查防火牆設置

### JWT Token 無效
- 確認 `JWT_SECRET` 在重啟後沒有改變
- 檢查 token 是否過期（有效期 24 小時）

### CORS 錯誤
- 確認 `FRONTEND_URL` 與前端實際運行的 URL 一致
- 檢查前端請求是否包含正確的 headers
