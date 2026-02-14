# ICACP 本地 Docker 部署指南

本文件說明如何在本地環境使用 Docker 部署 ICACP 系統。

---

## 目錄

1. [環境需求](#1-環境需求)
2. [安裝 Docker Desktop](#2-安裝-docker-desktop)
3. [取得專案程式碼](#3-取得專案程式碼)
4. [設定環境變數](#4-設定環境變數)
5. [啟動服務](#5-啟動服務)
6. [驗證部署](#6-驗證部署)
7. [常用維運指令](#7-常用維運指令)
8. [常見問題排解](#8-常見問題排解)

---

## 1. 環境需求

| 項目 | 最低需求 | 建議配置 |
|------|----------|----------|
| 作業系統 | Windows 10/11, macOS 10.15+, Ubuntu 20.04+ | - |
| 記憶體 | 4 GB | 8 GB 以上 |
| 硬碟空間 | 10 GB | 20 GB 以上 |
| Docker Desktop | 4.0+ | 最新版本 |

---

## 2. 安裝 Docker Desktop

### Windows

```
步驟 1：下載 Docker Desktop
        前往 https://www.docker.com/products/docker-desktop/
        點擊 "Download for Windows"

步驟 2：執行安裝程式
        雙擊下載的 Docker Desktop Installer.exe
        依照安裝精靈指示完成安裝
        [注意] 安裝過程會要求啟用 WSL 2，請同意

步驟 3：重新啟動電腦
        安裝完成後需要重新開機

步驟 4：啟動 Docker Desktop
        從開始選單開啟 Docker Desktop
        等待右下角系統列圖示變成綠色 (表示 Docker 已就緒)
        [注意] 首次啟動可能需要 1-2 分鐘
```

### macOS

```bash
# 使用 Homebrew 安裝 (推薦)
brew install --cask docker

# 安裝完成後，從應用程式資料夾開啟 Docker Desktop
# 等待選單列圖示顯示 "Docker Desktop is running"
```

### 驗證安裝

```bash
# 開啟終端機/命令提示字元，執行以下指令
docker --version
# 預期輸出：Docker version 24.x.x 或更新版本

docker compose version
# 預期輸出：Docker Compose version v2.x.x
```

---

## 3. 取得專案程式碼

```bash
# 步驟 1：選擇專案存放位置
# [Windows 建議] C:\Projects 或 D:\work
# [macOS 建議] ~/Projects

# 步驟 2：克隆專案
git clone https://github.com/wei979/ICACP.git

# 步驟 3：進入專案目錄
cd ICACP

# [驗證] 確認目錄結構
ls
# 應該看到：backend/  frontend/  docker-compose.yml  .env.example 等檔案
```

---

## 4. 設定環境變數

### 步驟 4.1：複製環境變數範本

```bash
# Windows (命令提示字元)
copy .env.example .env

# Windows (PowerShell) / macOS / Linux
cp .env.example .env
```

### 步驟 4.2：編輯環境變數

使用任意文字編輯器開啟 `.env` 檔案：

```bash
# Windows
notepad .env

# macOS
open -e .env

# Linux
nano .env
```

### 步驟 4.3：修改必要的設定值

```bash
# =============================================
# 【本地開發】必須修改的項目 (共 2 項)
# =============================================

# 1. [必改] 管理員 Email
#    說明：使用 Google 登入時，符合此 Email 的帳號會獲得管理員權限
#    修改：將 admin@example.com 改成你的 Google Email
#    範例：ADMIN_WHITELIST=yourname@gmail.com
#    多人：ADMIN_WHITELIST=user1@gmail.com,user2@gmail.com
ADMIN_WHITELIST=admin@example.com

# 2. [建議修改] JWT 密鑰
#    說明：用於加密登入 Token，至少 32 個字元
#    修改：改成任意 32+ 字元的隨機字串
#    範例：JWT_SECRET=MyLocalDevSecretKey12345678901234
#    [注意] 本地開發可暫用預設值，但不建議
JWT_SECRET=your-32-plus-character-secret-key-here-change-in-production


# =============================================
# 【本地開發】通常不需修改的項目
# =============================================

# 資料庫設定 (使用預設值即可)
MYSQL_ROOT_PASSWORD=password123
MYSQL_DATABASE=acap_dev
MYSQL_USER=acap
MYSQL_PASSWORD=acap_password
MYSQL_PORT=3306

# Redis 設定 (使用預設值即可)
REDIS_PORT=6379

# 後端設定 (使用預設值即可)
BACKEND_PORT=8080
ENVIRONMENT=development
GIN_MODE=release

# 前端設定 (本地開發使用 localhost)
FRONTEND_PORT=3000
FRONTEND_URL=http://localhost:3000

# 工具設定 (使用預設值即可)
ADMINER_PORT=8081


# =============================================
# 【端口衝突時】修改對應的 PORT 設定
# =============================================
# 如果某個端口已被其他程式佔用，可以修改：
#   - 3306 被佔用 → MYSQL_PORT=3307
#   - 6379 被佔用 → REDIS_PORT=6380
#   - 8080 被佔用 → BACKEND_PORT=8081
#   - 3000 被佔用 → FRONTEND_PORT=3001
#                   同時修改 FRONTEND_URL=http://localhost:3001
```

---

## 5. 啟動服務

### 步驟 5.1：首次建置並啟動

```bash
# 建置並啟動所有服務 (首次執行約需 3-5 分鐘)
docker compose up -d --build

# 參數說明：
#   up        = 啟動服務
#   -d        = 背景執行 (不佔用終端機)
#   --build   = 重新建置映像檔
```

### 步驟 5.2：查看建置進度

```bash
# 即時查看所有服務的日誌
docker compose logs -f

# [說明] 當看到以下訊息表示後端已就緒：
#   acap-backend  | [GIN] Listening and serving HTTP on :8080

# [說明] 當看到以下訊息表示前端已就緒：
#   acap-frontend | Ready on http://0.0.0.0:3000

# 按 Ctrl+C 退出日誌查看 (不會停止服務)
```

### 步驟 5.3：等待健康檢查通過

```bash
# 服務啟動後需等待約 30-60 秒進行健康檢查
# 可用以下指令確認狀態
docker compose ps

# [成功] 所有服務顯示 "Up (healthy)"
# [等待中] 顯示 "Up (health: starting)"
# [失敗] 顯示 "Up (unhealthy)" 或 "Exited"
```

---

## 6. 驗證部署

### 步驟 6.1：檢查服務狀態

```bash
docker compose ps
```

**預期輸出：**
```
NAME            IMAGE                STATUS                   PORTS
acap-mysql      mysql:8.0            Up (healthy)             0.0.0.0:3306->3306/tcp
acap-redis      redis:7-alpine       Up (healthy)             0.0.0.0:6379->6379/tcp
acap-backend    icacp-backend        Up (healthy)             0.0.0.0:8080->8080/tcp
acap-frontend   icacp-frontend       Up (healthy)             0.0.0.0:3000->3000/tcp
```

### 步驟 6.2：測試各服務

```bash
# 測試後端 API
curl http://localhost:8080/health
# 預期輸出：{"status":"ok"} 或類似的 JSON

# 測試前端 (用瀏覽器開啟)
# 網址：http://localhost:3000
```

### 步驟 6.3：存取系統

| 服務 | 網址 | 說明 |
|------|------|------|
| 前端網站 | http://localhost:3000 | 主要操作介面 |
| 後端 API | http://localhost:8080/api/v1 | RESTful API |
| 資料庫管理 | http://localhost:8081 | 需額外啟動 (見下方) |

### 步驟 6.4：啟動資料庫管理介面 (可選)

```bash
# 啟動 Adminer
docker compose --profile tools up -d adminer

# 開啟瀏覽器前往 http://localhost:8081
# 登入資訊：
#   系統：MySQL
#   伺服器：mysql
#   用戶名：root
#   密碼：password123 (或你在 .env 設定的 MYSQL_ROOT_PASSWORD)
#   資料庫：acap_dev
```

---

## 7. 常用維運指令

### 日常操作

```bash
# 查看服務狀態
docker compose ps

# 查看日誌 (所有服務)
docker compose logs -f

# 查看特定服務日誌
docker compose logs -f backend    # 只看後端
docker compose logs -f frontend   # 只看前端
docker compose logs -f mysql      # 只看資料庫

# 查看最近 100 行日誌
docker compose logs --tail 100 backend
```

### 啟動/停止服務

```bash
# 停止所有服務 (保留資料)
docker compose stop

# 啟動已停止的服務
docker compose start

# 重新啟動所有服務
docker compose restart

# 重新啟動特定服務
docker compose restart backend
```

### 更新部署

```bash
# 步驟 1：拉取最新程式碼
git pull

# 步驟 2：重新建置並啟動
docker compose up -d --build

# [說明] 此指令會自動：
#   - 重新建置有變更的映像檔
#   - 重新啟動有更新的容器
#   - 保留未變更的容器和資料
```

### 清除與重置

```bash
# 停止並移除容器 (保留資料庫資料)
docker compose down

# [危險] 完全清除，包含資料庫資料
docker compose down -v
# [警告] 此操作會刪除所有資料，無法復原！

# 清除未使用的映像檔 (釋放硬碟空間)
docker image prune -f

# 清除所有未使用的資源
docker system prune -f
```

---

## 8. 常見問題排解

### Q1: Docker Desktop 沒有啟動

**症狀：** 執行 docker 指令時顯示 "Cannot connect to the Docker daemon"

**解決方法：**
```
1. 開啟 Docker Desktop 應用程式
2. 等待系統列圖示變成綠色
3. Windows 用戶確認 WSL 2 已啟用：
   設定 → 應用程式 → 選用功能 → 更多 Windows 功能 → 勾選 "適用於 Linux 的 Windows 子系統"
```

### Q2: 端口被佔用

**症狀：** 啟動時顯示 "port is already allocated"

**解決方法：**
```bash
# 1. 找出佔用端口的程式 (以 3000 為例)
# Windows
netstat -ano | findstr :3000

# macOS/Linux
lsof -i :3000

# 2. 修改 .env 中對應的端口設定
# 例如 3000 被佔用，改成 3001：
FRONTEND_PORT=3001
FRONTEND_URL=http://localhost:3001

# 3. 重新啟動
docker compose up -d
```

### Q3: 建置失敗

**症狀：** docker compose up --build 時出現錯誤

**解決方法：**
```bash
# 清除快取重新建置
docker compose build --no-cache

# 重新啟動
docker compose up -d
```

### Q4: 服務顯示 unhealthy

**症狀：** docker compose ps 顯示 "(unhealthy)"

**解決方法：**
```bash
# 1. 查看該服務的日誌
docker compose logs backend  # 或 frontend, mysql, redis

# 2. 常見原因：
#    - MySQL: 資料庫初始化中，等待 1-2 分鐘
#    - Backend: 等待 MySQL 就緒，檢查資料庫連線設定
#    - Frontend: 等待 Backend 就緒

# 3. 重新啟動該服務
docker compose restart backend
```

### Q5: 無法登入 (Google OAuth 問題)

**症狀：** 點擊 Google 登入後無反應或報錯

**解決方法：**
```
1. 確認使用 http://localhost:3000 存取 (不是 127.0.0.1)
2. 確認 .env 中 FRONTEND_URL=http://localhost:3000
3. 確認 ADMIN_WHITELIST 包含你的 Google Email
4. 重新啟動後端：docker compose restart backend
```

### Q6: 資料庫連線失敗

**症狀：** 後端日誌顯示 "connection refused" 或 "Access denied"

**解決方法：**
```bash
# 1. 確認 MySQL 容器正在運行
docker compose ps mysql

# 2. 確認 MySQL 已完成初始化 (查看日誌)
docker compose logs mysql | tail -20
# 看到 "ready for connections" 表示就緒

# 3. 如果仍有問題，重置資料庫
docker compose down -v
docker compose up -d
```

---

## 附錄：服務架構圖

```
                                    Docker Network (acap-network)
┌─────────────────────────────────────────────────────────────────────────────┐
│                                                                              │
│   ┌─────────────┐     ┌─────────────┐     ┌─────────────┐     ┌──────────┐  │
│   │   Frontend  │────▶│   Backend   │────▶│    MySQL    │     │  Redis   │  │
│   │  (Next.js)  │     │    (Go)     │────▶│   (資料庫)   │     │  (快取)  │  │
│   │   :3000     │     │   :8080     │     │   :3306     │     │  :6379   │  │
│   └─────────────┘     └─────────────┘     └─────────────┘     └──────────┘  │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
         ▲                     ▲
         │                     │
         │    ┌────────────────┘
         │    │
    ┌────┴────┴────┐
    │   瀏覽器      │
    │ localhost    │
    └──────────────┘
```

---

## 聯絡與支援

如有問題，請聯繫專案負責人或在 GitHub 提交 Issue：
https://github.com/wei979/ICACP/issues
