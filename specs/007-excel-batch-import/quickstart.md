# Quickstart: Excel 批次匯入

**功能**: 007-excel-batch-import
**日期**: 2025-12-13

---

## 概述

本指南說明如何快速開始實作 Excel 批次匯入功能。

---

## 環境準備

### 後端依賴

安裝 `excelize` 套件（Excel 解析）：

```bash
cd backend
go get github.com/xuri/excelize/v2
```

### 前端依賴

無需額外依賴，使用既有的 React Query 和 Axios。

---

## 快速開始

### 步驟 1: 建立後端模型

建立 `backend/internal/models/import.go`：

```go
package models

import "time"

type ImportType string

const (
    ImportTypeStudents ImportType = "students"
    ImportTypeRecords  ImportType = "records"
)

type RowStatus string

const (
    RowStatusValid   RowStatus = "valid"
    RowStatusWarning RowStatus = "warning"
    RowStatusError   RowStatus = "error"
)

type ImportPreview struct {
    ID          string                   `json:"preview_id"`
    Type        ImportType               `json:"type"`
    SchoolID    uint                     `json:"school_id"`
    Grade       int                      `json:"grade,omitempty"`
    Class       string                   `json:"class,omitempty"`
    FileName    string                   `json:"file_name"`
    TotalRows   int                      `json:"total_rows"`
    ValidRows   int                      `json:"valid_rows"`
    WarningRows int                      `json:"warning_rows"`
    ErrorRows   int                      `json:"error_rows"`
    Rows        []ImportRow              `json:"rows"`
    CreatedAt   time.Time                `json:"created_at"`
    ExpiresAt   time.Time                `json:"expires_at"`
}

type ImportRow struct {
    RowNumber int                    `json:"row_number"`
    Status    RowStatus              `json:"status"`
    Data      map[string]interface{} `json:"data"`
    Errors    []RowError             `json:"errors"`
}

type RowError struct {
    Field   string `json:"field"`
    Code    string `json:"code"`
    Message string `json:"message"`
}

type ImportResult struct {
    PreviewID    string          `json:"preview_id"`
    Type         ImportType      `json:"type"`
    SuccessCount int             `json:"success_count"`
    SkipCount    int             `json:"skip_count"`
    Errors       []ImportedError `json:"errors"`
    ExecutedAt   time.Time       `json:"executed_at"`
}

type ImportedError struct {
    RowNumber int    `json:"row_number"`
    Reason    string `json:"reason"`
}
```

### 步驟 2: 建立匯入服務

建立 `backend/internal/services/import_service.go`（核心邏輯框架）：

```go
package services

import (
    "fmt"
    "mime/multipart"
    "sync"
    "time"

    "github.com/google/uuid"
    "github.com/xuri/excelize/v2"
    "gorm.io/gorm"
    "github.com/wei979/ICACP/backend/internal/models"
)

type ImportService struct {
    db    *gorm.DB
    store *PreviewStore
}

type PreviewStore struct {
    mu       sync.RWMutex
    previews map[string]*models.ImportPreview
}

func NewImportService(db *gorm.DB) *ImportService {
    s := &ImportService{
        db: db,
        store: &PreviewStore{
            previews: make(map[string]*models.ImportPreview),
        },
    }
    go s.cleanupExpiredPreviews()
    return s
}

func (s *ImportService) PreviewStudentImport(file multipart.File, schoolID uint) (*models.ImportPreview, error) {
    // 1. 開啟 Excel 檔案
    f, err := excelize.OpenReader(file)
    if err != nil {
        return nil, fmt.Errorf("無法解析 Excel 檔案: %w", err)
    }
    defer f.Close()

    // 2. 讀取第一個工作表
    rows, err := f.GetRows(f.GetSheetName(0))
    if err != nil {
        return nil, fmt.Errorf("無法讀取工作表: %w", err)
    }

    // 3. 驗證標題列
    if len(rows) < 1 {
        return nil, fmt.Errorf("Excel 檔案為空")
    }
    // TODO: 驗證標題列欄位

    // 4. 解析並驗證每一列
    preview := &models.ImportPreview{
        ID:        uuid.New().String(),
        Type:      models.ImportTypeStudents,
        SchoolID:  schoolID,
        Rows:      make([]models.ImportRow, 0),
        CreatedAt: time.Now(),
        ExpiresAt: time.Now().Add(15 * time.Minute),
    }

    for i, row := range rows[1:] { // 跳過標題列
        importRow := s.validateStudentRow(i+2, row) // row_number 從 2 開始
        preview.Rows = append(preview.Rows, importRow)

        switch importRow.Status {
        case models.RowStatusValid:
            preview.ValidRows++
        case models.RowStatusWarning:
            preview.WarningRows++
        case models.RowStatusError:
            preview.ErrorRows++
        }
    }

    preview.TotalRows = len(preview.Rows)

    // 5. 儲存預覽
    s.store.Set(preview.ID, preview)

    return preview, nil
}

func (s *ImportService) validateStudentRow(rowNum int, row []string) models.ImportRow {
    // TODO: 實作驗證邏輯
    return models.ImportRow{
        RowNumber: rowNum,
        Status:    models.RowStatusValid,
        Data:      map[string]interface{}{},
        Errors:    []models.RowError{},
    }
}

func (s *PreviewStore) Set(id string, preview *models.ImportPreview) {
    s.mu.Lock()
    defer s.mu.Unlock()
    s.previews[id] = preview
}

func (s *PreviewStore) Get(id string) *models.ImportPreview {
    s.mu.RLock()
    defer s.mu.RUnlock()
    return s.previews[id]
}

func (s *ImportService) cleanupExpiredPreviews() {
    ticker := time.NewTicker(5 * time.Minute)
    for range ticker.C {
        s.store.mu.Lock()
        now := time.Now()
        for id, preview := range s.store.previews {
            if now.After(preview.ExpiresAt) {
                delete(s.store.previews, id)
            }
        }
        s.store.mu.Unlock()
    }
}
```

### 步驟 3: 建立匯入處理器

建立 `backend/internal/handlers/import_handler.go`：

```go
package handlers

import (
    "net/http"
    "strconv"

    "github.com/gin-gonic/gin"
    "github.com/wei979/ICACP/backend/internal/services"
)

type ImportHandler struct {
    service *services.ImportService
}

func NewImportHandler(service *services.ImportService) *ImportHandler {
    return &ImportHandler{service: service}
}

func (h *ImportHandler) DownloadStudentTemplate(c *gin.Context) {
    // TODO: 回傳預先建立的 Excel 模板
    c.Header("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")
    c.Header("Content-Disposition", "attachment; filename=student-list-template.xlsx")
    c.File("templates/student-list-template.xlsx")
}

func (h *ImportHandler) PreviewStudentImport(c *gin.Context) {
    // 1. 取得上傳檔案
    file, header, err := c.Request.FormFile("file")
    if err != nil {
        c.JSON(http.StatusBadRequest, gin.H{
            "error": gin.H{
                "code":    "MISSING_FILE",
                "message": "請上傳 Excel 檔案",
                "status":  400,
            },
        })
        return
    }
    defer file.Close()

    // 2. 驗證檔案大小 (5MB)
    if header.Size > 5*1024*1024 {
        c.JSON(http.StatusBadRequest, gin.H{
            "error": gin.H{
                "code":    "FILE_TOO_LARGE",
                "message": "檔案大小不可超過 5MB",
                "status":  400,
            },
        })
        return
    }

    // 3. 取得學校 ID
    schoolIDStr := c.PostForm("school_id")
    schoolID, err := strconv.ParseUint(schoolIDStr, 10, 64)
    if err != nil {
        c.JSON(http.StatusBadRequest, gin.H{
            "error": gin.H{
                "code":    "INVALID_SCHOOL_ID",
                "message": "請提供有效的學校 ID",
                "status":  400,
            },
        })
        return
    }

    // 4. 呼叫服務進行預覽
    preview, err := h.service.PreviewStudentImport(file, uint(schoolID))
    if err != nil {
        c.JSON(http.StatusBadRequest, gin.H{
            "error": gin.H{
                "code":    "PARSE_ERROR",
                "message": err.Error(),
                "status":  400,
            },
        })
        return
    }

    c.JSON(http.StatusOK, gin.H{"data": preview})
}
```

### 步驟 4: 註冊路由

在 `backend/cmd/server/main.go` 加入路由：

```go
// Import routes
importService := services.NewImportService(db)
importHandler := handlers.NewImportHandler(importService)

importRoutes := v1.Group("/import")
// TODO: Add auth middleware
{
    // 模板下載
    importRoutes.GET("/templates/students", importHandler.DownloadStudentTemplate)
    importRoutes.GET("/templates/records", importHandler.DownloadRecordsTemplate)

    // 學生匯入
    importRoutes.POST("/students/preview", importHandler.PreviewStudentImport)
    importRoutes.POST("/students/execute", importHandler.ExecuteStudentImport)

    // 運動記錄匯入
    importRoutes.POST("/records/preview", importHandler.PreviewRecordsImport)
    importRoutes.POST("/records/execute", importHandler.ExecuteRecordsImport)

    // 取消預覽
    importRoutes.DELETE("/preview/:preview_id", importHandler.CancelPreview)
}
```

### 步驟 5: 建立前端類型

建立 `frontend/src/types/import.ts`：

```typescript
export type ImportType = 'students' | 'records';
export type RowStatus = 'valid' | 'warning' | 'error';

export interface ImportPreview {
  preview_id: string;
  type: ImportType;
  school_id: number;
  grade?: number;
  class?: string;
  file_name: string;
  total_rows: number;
  valid_rows: number;
  warning_rows: number;
  error_rows: number;
  expires_at: string;
  rows: ImportRow[];
}

export interface ImportRow {
  row_number: number;
  status: RowStatus;
  data: Record<string, unknown>;
  errors: RowError[];
}

export interface RowError {
  field: string;
  code: string;
  message: string;
}

export interface ImportResult {
  preview_id: string;
  type: ImportType;
  success_count: number;
  skip_count: number;
  errors: ImportedError[];
  executed_at: string;
}

export interface ImportedError {
  row_number: number;
  reason: string;
}
```

### 步驟 6: 建立前端 API 客戶端

建立 `frontend/src/lib/api/import.ts`：

```typescript
import axios from 'axios';
import { ImportPreview, ImportResult } from '@/types/import';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1';

export const importApi = {
  // 下載模板
  downloadStudentTemplate: () => {
    window.location.href = `${API_BASE}/import/templates/students`;
  },

  downloadRecordsTemplate: () => {
    window.location.href = `${API_BASE}/import/templates/records`;
  },

  // 學生匯入預覽
  previewStudentImport: async (file: File, schoolId: number): Promise<ImportPreview> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('school_id', schoolId.toString());

    const response = await axios.post(`${API_BASE}/import/students/preview`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data.data;
  },

  // 運動記錄匯入預覽
  previewRecordsImport: async (
    file: File,
    schoolId: number,
    grade: number,
    className: string
  ): Promise<ImportPreview> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('school_id', schoolId.toString());
    formData.append('grade', grade.toString());
    formData.append('class', className);

    const response = await axios.post(`${API_BASE}/import/records/preview`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data.data;
  },

  // 執行匯入
  executeImport: async (
    type: 'students' | 'records',
    previewId: string,
    includeWarnings: boolean = true
  ): Promise<ImportResult> => {
    const response = await axios.post(`${API_BASE}/import/${type}/execute`, {
      preview_id: previewId,
      include_warnings: includeWarnings,
    });
    return response.data.data;
  },

  // 取消預覽
  cancelPreview: async (previewId: string): Promise<void> => {
    await axios.delete(`${API_BASE}/import/preview/${previewId}`);
  },
};
```

---

## 測試流程

### 手動測試

1. 啟動後端：`cd backend && go run cmd/server/main.go`
2. 啟動前端：`cd frontend && npm run dev`
3. 下載學生名單模板
4. 填寫 3-5 筆測試資料
5. 上傳並檢查預覽結果
6. 確認匯入並檢查資料庫

### API 測試（使用 curl）

```bash
# 下載學生模板
curl -O http://localhost:8080/api/v1/import/templates/students

# 上傳並預覽
curl -X POST http://localhost:8080/api/v1/import/students/preview \
  -F "file=@test-students.xlsx" \
  -F "school_id=1"

# 執行匯入
curl -X POST http://localhost:8080/api/v1/import/students/execute \
  -H "Content-Type: application/json" \
  -d '{"preview_id": "xxx", "include_warnings": true}'
```

---

## 常見問題

### Q: 如何建立 Excel 模板檔案？

使用 `excelize` 套件程式化建立：

```go
func CreateStudentTemplate() error {
    f := excelize.NewFile()

    // 設定標題列
    headers := []string{"座號*", "姓名*", "性別*", "年級*", "班級", "生日"}
    for i, h := range headers {
        cell, _ := excelize.CoordinatesToCellName(i+1, 1)
        f.SetCellValue("Sheet1", cell, h)
    }

    // 加入範例資料
    f.SetCellValue("Sheet1", "A2", 1)
    f.SetCellValue("Sheet1", "B2", "王小明")
    f.SetCellValue("Sheet1", "C2", "男")
    f.SetCellValue("Sheet1", "D2", 3)
    f.SetCellValue("Sheet1", "E2", "甲")
    f.SetCellValue("Sheet1", "F2", "2015/03/15")

    // 設定性別欄的資料驗證
    dv := excelize.NewDataValidation(true)
    dv.SetSqref("C2:C1000")
    dv.SetDropList([]string{"男", "女"})
    f.AddDataValidation("Sheet1", dv)

    return f.SaveAs("templates/student-list-template.xlsx")
}
```

### Q: 大檔案會不會造成記憶體問題？

對於超過 500 列的檔案，建議使用 `excelize` 的串流讀取模式：

```go
rows, err := f.Rows("Sheet1")
for rows.Next() {
    row, _ := rows.Columns()
    // 處理單列
}
```

---

## 下一步

1. 完成驗證邏輯（參考 `data-model.md` 的驗證規則）
2. 實作運動記錄匯入
3. 建立前端 UI 元件
4. 撰寫單元測試
