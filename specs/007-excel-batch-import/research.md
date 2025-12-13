# Research: Excel Batch Import

**Feature**: 007-excel-batch-import
**Date**: 2025-12-13

## Research Tasks

### 1. Go Excel 解析套件選擇

**Decision**: 使用 `excelize` 套件

**Rationale**:
- 純 Go 實作，無 CGO 依賴
- 支援 .xlsx 格式（Office Open XML）
- 活躍維護，GitHub 17k+ stars
- 支援讀取、寫入、串流處理大檔案
- 已在多個生產環境驗證

**Alternatives Considered**:
| 套件 | 優點 | 缺點 | 結論 |
|------|------|------|------|
| `excelize` | 功能完整、效能好、活躍維護 | 記憶體用量較高（大檔案） | ✅ 選用 |
| `xlsx` | 輕量 | 功能較少、維護較不活躍 | ❌ 捨棄 |
| `tealeg/xlsx` | 老牌套件 | 已標記為 archived，停止維護 | ❌ 捨棄 |

**Usage Pattern**:
```go
import "github.com/xuri/excelize/v2"

f, err := excelize.OpenReader(file)
rows, err := f.GetRows("Sheet1")
for i, row := range rows {
    // row[0] = 第一欄, row[1] = 第二欄...
}
```

---

### 2. Excel 模板設計最佳實踐

**Decision**: 使用「固定標題列 + 範例資料列 + 資料驗證」的三層設計

**Rationale**:
- 標題列讓使用者一目了然需要填什麼
- 範例資料列示範正確格式，可刪除或覆蓋
- Excel Data Validation 限制輸入選項，減少錯誤

**Student List Template Structure**:
| 座號* | 姓名* | 性別* | 年級* | 班級 | 生日 |
|-------|-------|-------|-------|------|------|
| 1 | 王小明 | 男 | 3 | 甲 | 2015/03/15 |
| 2 | 李小華 | 女 | 3 | 甲 | 2015/07/22 |

- 性別欄使用 Data Validation dropdown：男/女
- 年級欄使用 Data Validation：1-12 整數
- 日期欄設定日期格式

**Sport Records Template Structure**:
| 座號* | 姓名* | 身高(cm) | 體重(kg) | 坐姿體前彎(cm) | 立定跳遠(cm) | 仰臥起坐(次/分鐘) | 心肺耐力(秒) | 測驗日期* |
|-------|-------|----------|----------|----------------|--------------|------------------|--------------|-----------|
| 1 | 王小明 | 125.5 | 28.3 | 15 | 120 | 25 | 480 | 2025/03/15 |

- 數值欄設定為數字格式
- 允許部分欄位空白（部分填寫功能）

---

### 3. 檔案上傳與驗證流程

**Decision**: 採用兩階段上傳流程（Preview → Execute）

**Rationale**:
- 分離解析驗證與實際寫入，允許使用者取消
- 預覽階段不建立資料庫事務，節省資源
- 確認後使用單一事務確保資料一致性

**Flow**:
```
1. POST /api/v1/import/students/preview
   - 上傳 Excel 檔案 + 學校 ID
   - 解析並驗證所有列
   - 回傳 preview_id + 驗證結果陣列

2. POST /api/v1/import/students/execute
   - 提交 preview_id + 確認匯入
   - 在單一事務中建立所有學生
   - 回傳匯入結果摘要
```

**Validation Order**:
1. 檔案格式檢查（必須是 .xlsx）
2. 檔案大小檢查（≤ 5MB）
3. 標題列驗證（欄位名稱必須匹配）
4. 逐列資料驗證：
   - 必填欄位檢查
   - 資料類型檢查
   - 範圍合理性檢查
   - 重複值檢查（座號在同檔案內不可重複）
   - 關聯性檢查（運動記錄：學生必須存在）

---

### 4. 預覽資料暫存策略

**Decision**: 使用記憶體暫存 + session ID，不持久化預覽資料

**Rationale**:
- 預覽資料生命週期短（使用者通常幾分鐘內決定）
- 不需要跨重啟保留
- 簡化實作，無需額外的資料庫表或 Redis 結構

**Implementation**:
```go
type ImportPreviewStore struct {
    mu       sync.RWMutex
    previews map[string]*ImportPreview // key = preview_id
}

type ImportPreview struct {
    ID          string
    Type        string // "students" or "records"
    SchoolID    uint
    Grade       int    // for records only
    Class       string // for records only
    Rows        []ImportRow
    CreatedAt   time.Time
    ExpiresAt   time.Time // 15 minutes TTL
}
```

**Cleanup**: 背景 goroutine 每 5 分鐘清理過期的預覽資料

---

### 5. 錯誤處理與回報格式

**Decision**: 逐列錯誤回報，每列可有多個錯誤訊息

**Rationale**:
- 使用者可一次看到所有問題
- 減少來回修改上傳的次數
- 提供具體的修正建議

**Error Response Structure**:
```json
{
  "data": {
    "preview_id": "abc123",
    "total_rows": 30,
    "valid_rows": 28,
    "warning_rows": 1,
    "error_rows": 1,
    "rows": [
      {
        "row_number": 1,
        "status": "valid",
        "data": { "student_number": "1", "name": "王小明", ... },
        "errors": []
      },
      {
        "row_number": 5,
        "status": "error",
        "data": { "student_number": "", "name": "張三", ... },
        "errors": [
          { "field": "student_number", "code": "REQUIRED", "message": "座號為必填欄位" }
        ]
      },
      {
        "row_number": 10,
        "status": "warning",
        "data": { "student_number": "10", "name": "李四", "height": 280, ... },
        "errors": [
          { "field": "height", "code": "OUT_OF_RANGE", "message": "身高 280cm 超出合理範圍，請確認" }
        ]
      }
    ]
  }
}
```

---

### 6. 資料庫事務與錯誤回滾

**Decision**: 使用 GORM 的 `Transaction` 方法包裹批次插入

**Rationale**:
- 確保全部成功或全部失敗
- 防止網路中斷導致部分資料寫入
- 符合 Constitution 的資料完整性要求

**Implementation**:
```go
func (s *ImportService) ExecuteStudentImport(previewID string) (*ImportResult, error) {
    preview := s.store.Get(previewID)
    if preview == nil {
        return nil, errors.New("preview not found or expired")
    }

    result := &ImportResult{
        SuccessCount: 0,
        SkipCount:    0,
        Errors:       []RowError{},
    }

    err := s.db.Transaction(func(tx *gorm.DB) error {
        for _, row := range preview.Rows {
            if row.Status == "error" {
                result.SkipCount++
                result.Errors = append(result.Errors, RowError{
                    RowNumber: row.RowNumber,
                    Reason:    row.Errors[0].Message,
                })
                continue
            }

            student := mapRowToStudent(row, preview.SchoolID)
            if err := tx.Create(&student).Error; err != nil {
                return err // Rollback entire transaction
            }
            result.SuccessCount++
        }
        return nil
    })

    return result, err
}
```

---

### 7. 合理值範圍定義

**Decision**: 根據台灣體適能測驗標準定義警告閾值

**Rationale**:
- 體適能測驗有國家標準參考值
- 設定寬鬆的警告範圍，避免誤判
- 警告僅提醒，不阻擋匯入

**Warning Thresholds**:
| 項目 | 最小值 | 最大值 | 超出時訊息 |
|------|--------|--------|-----------|
| 身高(cm) | 80 | 250 | "身高 {value}cm 超出合理範圍" |
| 體重(kg) | 10 | 200 | "體重 {value}kg 超出合理範圍" |
| 坐姿體前彎(cm) | -30 | 60 | "坐姿體前彎 {value}cm 超出合理範圍" |
| 立定跳遠(cm) | 20 | 350 | "立定跳遠 {value}cm 超出合理範圍" |
| 仰臥起坐(次) | 0 | 100 | "仰臥起坐 {value}次 超出合理範圍" |
| 心肺耐力(秒) | 60 | 1800 | "心肺耐力 {value}秒 超出合理範圍" |

---

### 8. 日期格式解析策略

**Decision**: 支援多種常見日期格式，自動偵測

**Rationale**:
- 不同使用者習慣不同的日期格式
- Excel 內部日期格式可能不一致
- 降低使用者輸入錯誤

**Supported Formats**:
```go
var dateFormats = []string{
    "2006/01/02",     // 2025/03/15
    "2006-01-02",     // 2025-03-15
    "2006/1/2",       // 2025/3/15
    "2006-1-2",       // 2025-3-15
    "01/02/2006",     // 03/15/2025
    "1/2/2006",       // 3/15/2025
}

func parseDate(value string) (time.Time, error) {
    for _, format := range dateFormats {
        if t, err := time.Parse(format, value); err == nil {
            return t, nil
        }
    }
    return time.Time{}, fmt.Errorf("無法解析日期格式: %s", value)
}
```

---

## Summary

所有技術決策已完成，無未解決的 NEEDS CLARIFICATION 項目。

| 研究項目 | 決策 |
|----------|------|
| Excel 解析套件 | excelize |
| 模板設計 | 固定標題 + 範例列 + Data Validation |
| 上傳流程 | 兩階段（Preview → Execute） |
| 預覽暫存 | 記憶體 Map + 15 分鐘 TTL |
| 錯誤格式 | 逐列錯誤陣列，含欄位/代碼/訊息 |
| 事務處理 | GORM Transaction 包裹批次插入 |
| 合理值範圍 | 根據體適能標準設定警告閾值 |
| 日期解析 | 支援 6 種常見格式自動偵測 |
