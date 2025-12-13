# Data Model: Excel Batch Import

**Feature**: 007-excel-batch-import
**Date**: 2025-12-13

## Overview

本功能不需要新增資料庫表格，主要操作既有的 `students` 和 `sport_records` 表。匯入預覽資料使用記憶體暫存，不持久化。

## Existing Entities (Referenced)

### Student

已存在於 `backend/internal/models/student.go`

```go
type Student struct {
    ID            uint           `gorm:"primarykey" json:"id"`
    SchoolID      uint           `gorm:"not null;index" json:"school_id"`
    StudentNumber string         `gorm:"size:20;not null" json:"student_number"`
    Name          string         `gorm:"size:50;not null;index" json:"name"`
    Grade         int            `gorm:"not null" json:"grade"`
    Class         string         `gorm:"size:20" json:"class"`
    Gender        string         `gorm:"size:10;not null" json:"gender"`
    BirthDate     *time.Time     `gorm:"type:date" json:"birth_date"`
    CreatedAt     time.Time      `json:"created_at"`
    UpdatedAt     time.Time      `json:"updated_at"`
    DeletedAt     gorm.DeletedAt `gorm:"index" json:"-"`
}
```

### SportRecord

已存在於 `backend/internal/models/sport_record.go`

```go
type SportRecord struct {
    ID          uint           `gorm:"primarykey" json:"id"`
    StudentID   uint           `gorm:"not null;index" json:"student_id"`
    SportTypeID uint           `gorm:"not null;index" json:"sport_type_id"`
    Value       float64        `gorm:"type:decimal(10,2);not null" json:"value"`
    TestDate    time.Time      `gorm:"type:date;not null;index" json:"test_date"`
    Notes       string         `gorm:"size:500" json:"notes"`
    CreatedAt   time.Time      `json:"created_at"`
    UpdatedAt   time.Time      `json:"updated_at"`
    DeletedAt   gorm.DeletedAt `gorm:"index" json:"-"`
}
```

### SportType

已存在於 `backend/internal/models/sport_type.go`

體適能 6 項已預先建立：
| ID | Name | Category | DefaultUnit | ValueType |
|----|------|----------|-------------|-----------|
| 1 | 身高 | 體適能 | cm | distance |
| 2 | 體重 | 體適能 | kg | distance |
| 3 | 坐姿體前彎 | 體適能 | cm | distance |
| 4 | 立定跳遠 | 體適能 | cm | distance |
| 5 | 仰臥起坐 | 體適能 | 次/分鐘 | count |
| 6 | 心肺耐力 | 體適能 | 秒 | time |

---

## New Entities (In-Memory Only)

### ImportPreview

匯入預覽會話，暫存解析後的資料供使用者確認。

```go
// backend/internal/models/import.go

type ImportPreview struct {
    ID          string       `json:"id"`           // UUID
    Type        ImportType   `json:"type"`         // "students" or "records"
    SchoolID    uint         `json:"school_id"`
    Grade       int          `json:"grade"`        // For records import only
    Class       string       `json:"class"`        // For records import only
    FileName    string       `json:"file_name"`
    TotalRows   int          `json:"total_rows"`
    ValidRows   int          `json:"valid_rows"`
    WarningRows int          `json:"warning_rows"`
    ErrorRows   int          `json:"error_rows"`
    Rows        []ImportRow  `json:"rows"`
    CreatedAt   time.Time    `json:"created_at"`
    ExpiresAt   time.Time    `json:"expires_at"`   // TTL: 15 minutes
}

type ImportType string

const (
    ImportTypeStudents ImportType = "students"
    ImportTypeRecords  ImportType = "records"
)
```

### ImportRow

單列匯入資料，包含原始資料與驗證結果。

```go
type ImportRow struct {
    RowNumber int                    `json:"row_number"` // Excel 列號（從 2 開始，1 是標題）
    Status    RowStatus              `json:"status"`     // valid, warning, error
    Data      map[string]interface{} `json:"data"`       // 原始欄位值
    Errors    []RowError             `json:"errors"`     // 驗證錯誤列表
}

type RowStatus string

const (
    RowStatusValid   RowStatus = "valid"
    RowStatusWarning RowStatus = "warning"
    RowStatusError   RowStatus = "error"
)

type RowError struct {
    Field   string `json:"field"`   // 欄位名稱
    Code    string `json:"code"`    // 錯誤代碼
    Message string `json:"message"` // 使用者可讀訊息
}
```

### ImportResult

匯入執行結果摘要。

```go
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

---

## Validation Rules

### Student Import Validation

| Field | Rule | Error Code | Error Message |
|-------|------|------------|---------------|
| student_number | 必填 | REQUIRED | "座號為必填欄位" |
| student_number | 不可重複（同檔案內） | DUPLICATE | "座號 {value} 重複" |
| name | 必填 | REQUIRED | "姓名為必填欄位" |
| name | 最長 50 字元 | MAX_LENGTH | "姓名不可超過 50 字元" |
| gender | 必填 | REQUIRED | "性別為必填欄位" |
| gender | 必須是「男」或「女」 | INVALID_VALUE | "性別必須是「男」或「女」" |
| grade | 必填 | REQUIRED | "年級為必填欄位" |
| grade | 必須是 1-12 | OUT_OF_RANGE | "年級必須介於 1-12" |
| class | 最長 20 字元 | MAX_LENGTH | "班級不可超過 20 字元" |
| birth_date | 有效日期格式 | INVALID_FORMAT | "生日格式無效" |

### Sport Record Import Validation

| Field | Rule | Error Code | Error Message |
|-------|------|------------|---------------|
| student_number | 必填 | REQUIRED | "座號為必填欄位" |
| name | 必填 | REQUIRED | "姓名為必填欄位" |
| student_number + name | 學生必須存在 | NOT_FOUND | "找不到座號 {number} 姓名 {name} 的學生" |
| test_date | 必填 | REQUIRED | "測驗日期為必填欄位" |
| test_date | 有效日期格式 | INVALID_FORMAT | "測驗日期格式無效" |
| height | 數值類型 | INVALID_TYPE | "身高必須是數字" |
| height | 80-250 (warning) | OUT_OF_RANGE | "身高 {value}cm 超出合理範圍，請確認" |
| weight | 數值類型 | INVALID_TYPE | "體重必須是數字" |
| weight | 10-200 (warning) | OUT_OF_RANGE | "體重 {value}kg 超出合理範圍，請確認" |
| sit_reach | 數值類型 | INVALID_TYPE | "坐姿體前彎必須是數字" |
| sit_reach | -30 to 60 (warning) | OUT_OF_RANGE | "坐姿體前彎 {value}cm 超出合理範圍，請確認" |
| standing_jump | 數值類型 | INVALID_TYPE | "立定跳遠必須是數字" |
| standing_jump | 20-350 (warning) | OUT_OF_RANGE | "立定跳遠 {value}cm 超出合理範圍，請確認" |
| sit_ups | 數值類型 | INVALID_TYPE | "仰臥起坐必須是數字" |
| sit_ups | 0-100 (warning) | OUT_OF_RANGE | "仰臥起坐 {value}次 超出合理範圍，請確認" |
| cardio | 數值類型 | INVALID_TYPE | "心肺耐力必須是數字" |
| cardio | 60-1800 (warning) | OUT_OF_RANGE | "心肺耐力 {value}秒 超出合理範圍，請確認" |
| all sport fields | 至少一項有值 | NO_DATA | "無運動成績可匯入" (warning) |

---

## State Transitions

### ImportPreview Lifecycle

```
[Created] --> [Accessed] --> [Executed] --> [Deleted]
    |              |              |
    |              v              |
    +---> [Expired] <-------------+
           (15 min)

States:
- Created: 解析完成，等待使用者確認
- Accessed: 使用者查看預覽（無狀態變更）
- Executed: 使用者確認匯入，資料寫入資料庫
- Expired: 超過 15 分鐘未操作，自動刪除
- Deleted: 匯入完成或使用者取消，手動刪除
```

---

## Relationships Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                        Import Flow                               │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│   Excel File (.xlsx)                                             │
│        │                                                         │
│        v                                                         │
│   ┌──────────────┐                                              │
│   │ ImportPreview │ ◄─── In-Memory (15 min TTL)                 │
│   │   + Rows[]   │                                              │
│   └──────┬───────┘                                              │
│          │                                                       │
│          │ Execute                                               │
│          v                                                       │
│   ┌──────────────┐         ┌──────────────┐                     │
│   │   Students   │ ◄─────► │   Schools    │                     │
│   │   (DB Table) │         │   (DB Table) │                     │
│   └──────┬───────┘         └──────────────┘                     │
│          │                                                       │
│          │ FK: student_id                                        │
│          v                                                       │
│   ┌──────────────┐         ┌──────────────┐                     │
│   │ SportRecords │ ◄─────► │  SportTypes  │                     │
│   │   (DB Table) │         │   (DB Table) │                     │
│   └──────────────┘         └──────────────┘                     │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Index Requirements

不需要新增索引。既有索引已足夠支援批次匯入操作：

- `students.school_id` - 按學校查詢學生
- `students.name` - 按姓名搜尋學生
- `sport_records.student_id` - 按學生查詢記錄
- `sport_records.test_date` - 按日期查詢記錄
