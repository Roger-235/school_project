# ICACP 部署指南

> 版本: 1.0
> 最後更新: 2025-12-17

---

## 目錄

1. [環境需求](#1-環境需求)
2. [本地開發環境](#2-本地開發環境)
3. [正式環境部署](#3-正式環境部署)
4. [環境變數設定](#4-環境變數設定)
5. [Docker 部署](#5-docker-部署)
6. [EC2 部署指南](#6-ec2-部署指南)
7. [Vercel 前端部署](#7-vercel-前端部署)
8. [維運指南](#8-維運指南)
9. [故障排除](#9-故障排除)

---

## 1. 環境需求

### 1.1 後端需求

| 軟體 | 最低版本 | 建議版本 | 用途 |
|------|----------|----------|------|
| Go | 1.21+ | 1.24 | 後端執行環境 |
| MySQL | 8.0+ | 8.0 | 主要資料庫 |
| Redis | 6.0+ | 7.x | 快取服務 |

### 1.2 前端需求

| 軟體 | 最低版本 | 建議版本 | 用途 |
|------|----------|----------|------|
| Node.js | 18.x | 20.x | 前端執行環境 |
| npm | 9.x | 10.x | 套件管理 |

### 1.3 開發工具（選用）

| 軟體 | 用途 |
|------|------|
| Docker | 容器化開發環境 |
| Docker Compose | 多容器管理 |
| Git | 版本控制 |

---

## 2. 本地開發環境

### 2.1 快速啟動

```bash
# 1. 複製專案
git clone https://github.com/wei979/ICACP.git
cd ICACP

# 2. 啟動資料庫服務 (Docker)
docker-compose up -d mysql redis

# 3. 設定後端環境變數
cp backend/.env.example backend/.env
# 編輯 .env 設定資料庫連線

# 4. 啟動後端
cd backend
go run cmd/server/main.go

# 5. 啟動前端 (新終端機)
cd frontend
npm install
npm run dev
```

### 2.2 存取位址

| 服務 | 位址 |
|------|------|
| 前端 | http://localhost:3000 |
| 後端 API | http://localhost:8080 |
| Adminer（資料庫管理） | http://localhost:8081 |

### 2.3 使用非 Docker 資料庫

若已安裝 MySQL 與 Redis：

```bash
# MySQL
mysql -u root -p
CREATE DATABASE acap_dev CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

# 修改 backend/.env
DATABASE_URL="root:yourpassword@tcp(localhost:3306)/acap_dev?charset=utf8mb4&parseTime=True&loc=Local"
REDIS_URL="localhost:6379"
```

---

## 3. 正式環境部署

### 3.1 部署架構

```
                     ┌─────────────────┐
                     │    Vercel       │
                     │  (前端靜態)     │
                     └────────┬────────┘
                              │
                              │ HTTPS
                              │
                              ▼
┌─────────────────────────────────────────────────────────┐
│                      AWS EC2                            │
│  ┌─────────────────┐    ┌─────────────────────────────┐│
│  │  Go API Server  │    │  systemd service            ││
│  │  (Port 8080)    │    │  sport-backend.service      ││
│  └────────┬────────┘    └─────────────────────────────┘│
│           │                                             │
│           │                                             │
│  ┌────────┴────────┐    ┌─────────────────┐            │
│  │     MySQL       │    │     Redis       │            │
│  │   (Port 3306)   │    │   (Port 6379)   │            │
│  └─────────────────┘    └─────────────────┘            │
└─────────────────────────────────────────────────────────┘
```

### 3.2 目前正式環境資訊

| 項目 | 值 |
|------|-----|
| 前端 URL | https://icacp-srvy.vercel.app |
| 後端 API | http://43.213.29.25:8080 |
| EC2 區域 | AWS ap-northeast-1 |

---

## 4. 環境變數設定

### 4.1 後端環境變數 (backend/.env)

```bash
# 資料庫連線
DATABASE_URL="user:password@tcp(host:port)/database?charset=utf8mb4&parseTime=True&loc=Local"

# JWT 認證（正式環境請更換）
JWT_SECRET="your-32-plus-character-secret-key-here-change-in-production"

# 管理員白名單
ADMIN_WHITELIST="admin@example.com"

# 伺服器設定
PORT=8080
FRONTEND_URL="https://your-frontend-domain.com"
ENVIRONMENT=production

# Redis 設定
REDIS_URL="localhost:6379"
REDIS_PASSWORD=""
```

**重要提醒：**
- `JWT_SECRET`: 正式環境必須使用強密碼（至少 32 字元）
- `FRONTEND_URL`: 設定正確的前端網址以支援 CORS
- `DATABASE_URL`: 正式環境請使用獨立資料庫帳號

### 4.2 前端環境變數

**開發環境 (frontend/.env.local):**
```bash
NEXT_PUBLIC_API_URL=/api/v1
```

**正式環境 (frontend/.env.production):**
```bash
NEXT_PUBLIC_API_URL=/api/v1
```

### 4.3 Next.js 後端代理設定

編輯 `frontend/next.config.js`：

```javascript
module.exports = {
  async rewrites() {
    return {
      beforeFiles: [
        {
          source: '/api/v1/:path*',
          destination: 'http://43.213.29.25:8080/api/v1/:path*',
        },
      ],
    };
  },
};
```

---

## 5. Docker 全端部署

本專案支援完整的 Docker 容器化部署，包含後端、前端、資料庫和快取服務。

### 5.1 前置需求

僅需安裝 Docker Desktop（包含 Docker Compose）：
- Windows/Mac: https://www.docker.com/products/docker-desktop
- Linux: `sudo apt install docker.io docker-compose`

### 5.2 一鍵部署（完整服務）

```bash
# 1. 複製專案
git clone https://github.com/wei979/ICACP.git
cd ICACP

# 2. 設定環境變數（選用，可使用預設值）
cp .env.example .env
# 編輯 .env 修改密碼等設定

# 3. 一鍵啟動所有服務
docker-compose up -d --build

# 4. 查看服務狀態
docker-compose ps
```

啟動後可存取：

| 服務 | 位址 | 說明 |
|------|------|------|
| 前端 | http://localhost:3000 | Next.js 應用 |
| 後端 API | http://localhost:8080 | Go API 伺服器 |
| 健康檢查 | http://localhost:8080/health | API 狀態確認 |
| Adminer | http://localhost:8081 | 資料庫管理（需額外啟用） |

### 5.3 服務架構

```
┌─────────────────────────────────────────────────────────┐
│                    Docker Network                        │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐  │
│  │  frontend   │───▶│   backend   │───▶│    mysql    │  │
│  │   :3000     │    │    :8080    │    │    :3306    │  │
│  └─────────────┘    └──────┬──────┘    └─────────────┘  │
│                            │                             │
│                            ▼                             │
│                     ┌─────────────┐                      │
│                     │    redis    │                      │
│                     │    :6379    │                      │
│                     └─────────────┘                      │
└─────────────────────────────────────────────────────────┘
```

### 5.4 開發模式（僅資料庫）

如果想在本地開發程式碼，只啟動資料庫：

```bash
# 只啟動 MySQL 和 Redis
docker-compose up -d mysql redis

# 本地執行後端
cd backend && go run cmd/server/main.go

# 本地執行前端
cd frontend && npm run dev
```

### 5.5 環境變數設定

可透過 `.env` 檔案自訂設定：

```bash
# 資料庫
MYSQL_ROOT_PASSWORD=your_secure_password
MYSQL_DATABASE=acap_dev

# 後端
JWT_SECRET=your-32-character-secret-key
BACKEND_PORT=8080

# 前端
FRONTEND_PORT=3000
```

### 5.6 Docker 常用指令

```bash
# 啟動所有服務（背景執行）
docker-compose up -d

# 啟動並重建映像檔（程式碼更新後）
docker-compose up -d --build

# 查看服務狀態
docker-compose ps

# 查看即時日誌
docker-compose logs -f

# 查看特定服務日誌
docker-compose logs -f backend
docker-compose logs -f frontend

# 停止所有服務
docker-compose down

# 停止並刪除所有資料（完全重置）
docker-compose down -v

# 重啟單一服務
docker-compose restart backend

# 進入容器除錯
docker exec -it acap-backend sh
docker exec -it acap-mysql mysql -u root -p

# 啟用 Adminer（資料庫管理工具）
docker-compose --profile tools up -d adminer
```

### 5.7 Dockerfile 說明

**後端 (backend/Dockerfile):**
- 使用多階段建構 (Multi-stage build)
- 第一階段：使用 golang:1.23-alpine 編譯
- 第二階段：使用 alpine:3.19 執行（映像檔約 20MB）
- 使用非 root 使用者執行，增強安全性

**前端 (frontend/Dockerfile):**
- 使用多階段建構
- 第一階段：安裝相依套件
- 第二階段：建構 Next.js 專案
- 第三階段：使用 standalone 模式執行（映像檔約 150MB）

### 5.8 正式環境注意事項

1. **修改預設密碼：**
   ```bash
   MYSQL_ROOT_PASSWORD=<強密碼>
   JWT_SECRET=<至少32字元的隨機字串>
   ```

2. **使用 HTTPS：**
   - 建議在前方加入 Nginx 或 Traefik 作為反向代理
   - 設定 SSL 憑證

3. **資料持久化：**
   - 確保 `mysql_data` 和 `redis_data` 磁碟區正確掛載
   - 定期備份資料庫

---

## 6. EC2 部署指南

### 6.1 初始設定

```bash
# SSH 連線
ssh -i your-key.pem ec2-user@43.213.29.25

# 安裝 Go
wget https://go.dev/dl/go1.24.linux-amd64.tar.gz
sudo tar -C /usr/local -xzf go1.24.linux-amd64.tar.gz
echo 'export PATH=$PATH:/usr/local/go/bin' >> ~/.bashrc
source ~/.bashrc

# 安裝 MySQL
sudo yum install mysql mysql-server -y
sudo systemctl start mysqld
sudo systemctl enable mysqld

# 安裝 Redis
sudo yum install redis -y
sudo systemctl start redis
sudo systemctl enable redis

# 安裝 Git
sudo yum install git -y
```

### 6.2 部署後端

```bash
# 複製專案
cd ~
git clone https://github.com/wei979/ICACP.git
cd ICACP/backend

# 設定環境變數
cp .env.example .env
nano .env  # 編輯設定

# 編譯
go build -o server ./cmd/server/main.go

# 複製執行檔
cp server sport-backend
```

### 6.3 設定 systemd 服務

建立服務檔案 `/etc/systemd/system/sport-backend.service`：

```ini
[Unit]
Description=ICACP Sport Backend API
After=network.target mysql.service redis.service

[Service]
Type=simple
User=ec2-user
WorkingDirectory=/home/ec2-user/ICACP/backend
ExecStart=/home/ec2-user/ICACP/backend/sport-backend
Restart=always
RestartSec=5
Environment=GIN_MODE=release

[Install]
WantedBy=multi-user.target
```

啟動服務：

```bash
sudo systemctl daemon-reload
sudo systemctl enable sport-backend
sudo systemctl start sport-backend
sudo systemctl status sport-backend
```

### 6.4 更新部署流程

```bash
# 1. 連線到 EC2
ssh -i your-key.pem ec2-user@43.213.29.25

# 2. 拉取最新程式碼
cd ~/ICACP/backend
git pull

# 3. 停止服務
sudo systemctl stop sport-backend

# 4. 重新編譯
go build -o server ./cmd/server/main.go

# 5. 複製執行檔
cp server sport-backend

# 6. 啟動服務
sudo systemctl start sport-backend

# 7. 確認狀態
sudo systemctl status sport-backend
```

### 6.5 日誌查看

```bash
# 查看服務日誌
sudo journalctl -u sport-backend -f

# 查看最近 100 行
sudo journalctl -u sport-backend -n 100
```

---

## 7. Vercel 前端部署

### 7.1 首次部署

1. 前往 [Vercel](https://vercel.com) 並登入
2. 點選「New Project」
3. 匯入 GitHub 專案
4. 設定專案：
   - Framework Preset: Next.js
   - Root Directory: `frontend`
   - Build Command: `npm run build`
   - Output Directory: `.next`

### 7.2 環境變數設定

在 Vercel 專案設定中新增：

| 變數名稱 | 值 |
|----------|-----|
| NEXT_PUBLIC_API_URL | /api/v1 |

### 7.3 自動部署

- 推送到 `main` 分支會自動觸發部署
- Pull Request 會建立預覽環境

### 7.4 手動部署

```bash
# 安裝 Vercel CLI
npm i -g vercel

# 部署到正式環境
cd frontend
vercel --prod
```

---

## 8. 維運指南

### 8.1 健康檢查

```bash
# 後端健康檢查
curl http://43.213.29.25:8080/health

# 資料庫連線測試
mysql -h localhost -u root -p -e "SELECT 1"

# Redis 連線測試
redis-cli ping
```

### 8.2 備份策略

**資料庫備份：**

```bash
# 手動備份
mysqldump -u root -p acap_dev > backup_$(date +%Y%m%d).sql

# 自動備份（加入 crontab）
0 2 * * * mysqldump -u root -pYOUR_PASSWORD acap_dev > /backup/acap_$(date +\%Y\%m\%d).sql
```

**備份還原：**

```bash
mysql -u root -p acap_dev < backup_20251217.sql
```

### 8.3 監控建議

| 監控項目 | 建議工具 |
|----------|----------|
| 伺服器資源 | CloudWatch (AWS) |
| API 回應時間 | CloudWatch / Datadog |
| 錯誤日誌 | CloudWatch Logs |
| 資料庫效能 | MySQL Slow Query Log |

### 8.4 定期維護

| 項目 | 頻率 | 說明 |
|------|------|------|
| 資料庫備份 | 每日 | 自動備份 + 異地儲存 |
| 日誌清理 | 每週 | 刪除 30 天以上的日誌 |
| 系統更新 | 每月 | 安全性更新 |
| SSL 憑證 | 每年 | 更新 HTTPS 憑證 |

---

## 9. 故障排除

### 9.1 常見問題

**問題：後端無法啟動**

```bash
# 檢查日誌
sudo journalctl -u sport-backend -n 50

# 常見原因：
# 1. 資料庫連線失敗 - 檢查 DATABASE_URL
# 2. 埠號被占用 - 檢查 8080 埠
# 3. 權限問題 - 檢查檔案權限
```

**問題：資料庫連線失敗**

```bash
# 測試連線
mysql -h localhost -u root -p

# 檢查 MySQL 服務
sudo systemctl status mysqld

# 檢查連線字串格式
# 正確格式：user:password@tcp(host:port)/database?charset=utf8mb4&parseTime=True&loc=Local
```

**問題：Redis 連線失敗**

```bash
# 測試連線
redis-cli ping

# 檢查服務狀態
sudo systemctl status redis

# 注意：Redis 連線失敗不會影響系統運作，僅停用快取功能
```

**問題：前端 API 請求失敗**

```bash
# 檢查 CORS 設定
# 確認 backend/.env 的 FRONTEND_URL 正確

# 檢查 Next.js rewrites 設定
# 確認 next.config.js 的後端位址正確

# 檢查 Mixed Content（HTTPS 呼叫 HTTP）
# 解決方案：使用 beforeFiles rewrites
```

**問題：「Text file busy」錯誤**

```bash
# 更新部署時出現此錯誤
# 原因：執行檔正在運行

# 解決方案：先停止服務
sudo systemctl stop sport-backend
cp server sport-backend
sudo systemctl start sport-backend
```

### 9.2 日誌位置

| 服務 | 日誌位置 |
|------|----------|
| 後端 API | `sudo journalctl -u sport-backend` |
| MySQL | `/var/log/mysqld.log` |
| Redis | `/var/log/redis/redis.log` |
| Nginx（如有）| `/var/log/nginx/` |

### 9.3 聯絡資訊

如遇到無法解決的問題，請聯繫：
- 專案維護者：[請填寫]
- GitHub Issues：https://github.com/wei979/ICACP/issues

---

## 附錄

### A. 快速指令參考

```bash
# === 後端 ===
# 啟動開發伺服器
cd backend && go run cmd/server/main.go

# 編譯正式版本
go build -o server ./cmd/server/main.go

# === 前端 ===
# 啟動開發伺服器
cd frontend && npm run dev

# 編譯正式版本
npm run build

# === EC2 部署 ===
# 更新並重啟
cd ~/ICACP/backend && git pull && sudo systemctl stop sport-backend && go build -o server ./cmd/server/main.go && cp server sport-backend && sudo systemctl start sport-backend

# === Docker ===
# 啟動所有服務
docker-compose up -d

# 停止所有服務
docker-compose down
```

### B. 安全性檢查清單

- [ ] JWT_SECRET 已更換為強密碼
- [ ] 資料庫使用獨立帳號（非 root）
- [ ] 資料庫密碼已更換
- [ ] CORS 設定僅允許正式前端網域
- [ ] EC2 安全群組僅開放必要埠號
- [ ] 定期備份已設定
- [ ] SSL 憑證已安裝（如適用）
