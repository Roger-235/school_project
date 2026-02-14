# ICACP API 文件

> 版本: 1.0
> 基礎路徑: `/api/v1`
> 最後更新: 2025-12-17

---

## 目錄

1. [通用說明](#1-通用說明)
2. [學校管理 API](#2-學校管理-api)
3. [學生管理 API](#3-學生管理-api)
4. [運動類型 API](#4-運動類型-api)
5. [運動記錄 API](#5-運動記錄-api)
6. [縣市統計 API](#6-縣市統計-api)
7. [Excel 匯入 API](#7-excel-匯入-api)
8. [錯誤處理](#8-錯誤處理)

---

## 1. 通用說明

### 1.1 基礎 URL

```
開發環境: http://localhost:8080/api/v1
正式環境: http://43.213.29.25:8080/api/v1
```

### 1.2 請求標頭

```http
Content-Type: application/json
Authorization: Bearer <token>  (需要認證的端點)
```

### 1.3 回應格式

所有成功回應都以 `data` 包裝：

```json
{
  "data": {
    // 回應內容
  }
}
```

### 1.4 分頁參數

支援分頁的端點使用以下參數：

| 參數 | 類型 | 預設值 | 說明 |
|------|------|--------|------|
| page | int | 1 | 頁碼（從 1 開始） |
| page_size | int | 20 | 每頁筆數（最大 100） |

分頁回應格式：

```json
{
  "data": {
    "items": [...],
    "pagination": {
      "page": 1,
      "page_size": 20,
      "total": 100,
      "total_pages": 5
    }
  }
}
```

### 1.5 健康檢查

```http
GET /health
```

回應：
```json
{
  "status": "ok"
}
```

---

## 2. 學校管理 API

### 2.1 取得學校列表

```http
GET /api/v1/schools
```

**查詢參數：**

| 參數 | 類型 | 必填 | 說明 |
|------|------|------|------|
| page | int | 否 | 頁碼 |
| page_size | int | 否 | 每頁筆數 |
| county_name | string | 否 | 篩選縣市 |
| name | string | 否 | 模糊搜尋學校名稱 |

**回應範例：**

```json
{
  "data": {
    "schools": [
      {
        "id": 1,
        "name": "台北市立信義國小",
        "county_name": "臺北市",
        "address": "台北市信義區...",
        "phone": "02-12345678",
        "latitude": 25.0330,
        "longitude": 121.5654,
        "student_count": 450,
        "created_at": "2025-01-01T00:00:00Z",
        "updated_at": "2025-01-01T00:00:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "page_size": 20,
      "total": 74,
      "total_pages": 4
    }
  }
}
```

### 2.2 取得地圖用學校列表

```http
GET /api/v1/schools/map
```

**說明：** 回傳所有學校的基本資訊與座標，用於地圖標記顯示。

**回應範例：**

```json
{
  "data": {
    "schools": [
      {
        "id": 1,
        "name": "台北市立信義國小",
        "county_name": "臺北市",
        "latitude": 25.0330,
        "longitude": 121.5654,
        "student_count": 450
      }
    ]
  }
}
```

### 2.3 取得單一學校

```http
GET /api/v1/schools/:id
```

**路徑參數：**

| 參數 | 類型 | 說明 |
|------|------|------|
| id | int | 學校 ID |

**回應範例：**

```json
{
  "data": {
    "school": {
      "id": 1,
      "name": "台北市立信義國小",
      "county_name": "臺北市",
      "address": "台北市信義區...",
      "phone": "02-12345678",
      "latitude": 25.0330,
      "longitude": 121.5654,
      "student_count": 450,
      "students": [
        {
          "id": 1,
          "student_number": "001",
          "name": "王小明",
          "grade": 3,
          "class": "甲",
          "gender": "male"
        }
      ]
    }
  }
}
```

### 2.4 新增學校

```http
POST /api/v1/schools
```

**請求內容：**

```json
{
  "name": "台北市立信義國小",
  "county_name": "臺北市",
  "address": "台北市信義區...",
  "phone": "02-12345678"
}
```

**欄位說明：**

| 欄位 | 類型 | 必填 | 說明 |
|------|------|------|------|
| name | string | 是 | 學校名稱（最多 100 字） |
| county_name | string | 是 | 縣市名稱（22 個台灣縣市之一） |
| address | string | 否 | 學校地址 |
| phone | string | 否 | 聯絡電話 |

### 2.5 更新學校

```http
PUT /api/v1/schools/:id
```

**請求內容：** 同新增學校

### 2.6 刪除學校

```http
DELETE /api/v1/schools/:id
```

**說明：** 執行軟刪除，資料不會實際移除。

---

## 3. 學生管理 API

### 3.1 搜尋學生

```http
GET /api/v1/students
```

**查詢參數：**

| 參數 | 類型 | 必填 | 說明 |
|------|------|------|------|
| page | int | 否 | 頁碼 |
| page_size | int | 否 | 每頁筆數 |
| school_id | int | 否 | 篩選學校 |
| name | string | 否 | 模糊搜尋姓名 |
| grade | int | 否 | 篩選年級 |
| gender | string | 否 | 篩選性別（male/female） |

**回應範例：**

```json
{
  "data": {
    "students": [
      {
        "id": 1,
        "school_id": 1,
        "student_number": "001",
        "name": "王小明",
        "grade": 3,
        "class": "甲",
        "gender": "male",
        "birth_date": "2015-03-15",
        "school": {
          "id": 1,
          "name": "台北市立信義國小"
        }
      }
    ],
    "pagination": {...}
  }
}
```

### 3.2 取得單一學生

```http
GET /api/v1/students/:id
```

### 3.3 取得學生及運動記錄

```http
GET /api/v1/students/:id/records
```

**回應範例：**

```json
{
  "data": {
    "student": {
      "id": 1,
      "name": "王小明",
      "sport_records": [
        {
          "id": 1,
          "sport_type_id": 1,
          "sport_type": {
            "id": 1,
            "name": "身高",
            "category": "體適能",
            "default_unit": "cm"
          },
          "value": 125.5,
          "test_date": "2025-03-15",
          "notes": ""
        }
      ]
    }
  }
}
```

### 3.4 新增學生

```http
POST /api/v1/students
```

**請求內容：**

```json
{
  "school_id": 1,
  "student_number": "001",
  "name": "王小明",
  "grade": 3,
  "class": "甲",
  "gender": "male",
  "birth_date": "2015-03-15"
}
```

**欄位說明：**

| 欄位 | 類型 | 必填 | 說明 |
|------|------|------|------|
| school_id | int | 是 | 所屬學校 ID |
| student_number | string | 是 | 學號/座號（最多 20 字，校內唯一） |
| name | string | 是 | 姓名（最多 50 字） |
| grade | int | 是 | 年級（1-12） |
| class | string | 否 | 班級（最多 20 字） |
| gender | string | 是 | 性別（male/female） |
| birth_date | string | 否 | 生日（YYYY-MM-DD 格式） |

### 3.5 更新學生

```http
PUT /api/v1/students/:id
```

### 3.6 刪除學生

```http
DELETE /api/v1/students/:id
```

---

## 4. 運動類型 API

### 4.1 取得所有運動類型

```http
GET /api/v1/sport-types
```

**回應範例：**

```json
{
  "data": {
    "sport_types": [
      {
        "id": 1,
        "name": "身高",
        "category": "體適能",
        "default_unit": "cm",
        "value_type": "distance"
      },
      {
        "id": 2,
        "name": "體重",
        "category": "體適能",
        "default_unit": "kg",
        "value_type": "distance"
      }
    ]
  }
}
```

### 4.2 取得單一運動類型

```http
GET /api/v1/sport-types/:id
```

### 4.3 取得運動類型分類

```http
GET /api/v1/sport-types/categories
```

**回應範例：**

```json
{
  "data": {
    "categories": ["體適能", "田徑", "球類"]
  }
}
```

### 4.4 預設運動類型列表

系統預設包含 17 種運動類型：

| ID | 名稱 | 分類 | 單位 | 數值類型 |
|----|------|------|------|----------|
| 1 | 身高 | 體適能 | cm | distance |
| 2 | 體重 | 體適能 | kg | distance |
| 3 | 坐姿體前彎 | 體適能 | cm | distance |
| 4 | 立定跳遠 | 體適能 | cm | distance |
| 5 | 仰臥起坐 | 體適能 | 次/分鐘 | count |
| 6 | 心肺耐力 | 體適能 | 秒 | time |

---

## 5. 運動記錄 API

### 5.1 取得運動記錄列表

```http
GET /api/v1/sport-records
```

**查詢參數：**

| 參數 | 類型 | 必填 | 說明 |
|------|------|------|------|
| student_id | int | 否 | 篩選學生 |
| sport_type_id | int | 否 | 篩選運動類型 |
| start_date | string | 否 | 起始日期 |
| end_date | string | 否 | 結束日期 |

### 5.2 取得單一運動記錄

```http
GET /api/v1/sport-records/:id
```

### 5.3 取得記錄修改歷史

```http
GET /api/v1/sport-records/:id/history
```

**回應範例：**

```json
{
  "data": {
    "history": [
      {
        "id": 1,
        "sport_record_id": 1,
        "old_value": 120.0,
        "new_value": 125.5,
        "changed_by": "admin",
        "changed_at": "2025-03-20T10:30:00Z",
        "reason": "修正測量誤差"
      }
    ]
  }
}
```

### 5.4 取得學生表現趨勢

```http
GET /api/v1/sport-records/trend
```

**查詢參數：**

| 參數 | 類型 | 必填 | 說明 |
|------|------|------|------|
| student_id | int | 是 | 學生 ID |
| sport_type_id | int | 是 | 運動類型 ID |

**回應範例：**

```json
{
  "data": {
    "trend": [
      {
        "date": "2025-01-15",
        "value": 120.0
      },
      {
        "date": "2025-03-15",
        "value": 125.5
      }
    ]
  }
}
```

### 5.5 取得學生進步/退步分析

```http
GET /api/v1/sport-records/progress
```

**查詢參數：**

| 參數 | 類型 | 必填 | 說明 |
|------|------|------|------|
| student_id | int | 是 | 學生 ID |

**回應範例：**

```json
{
  "data": {
    "progress": [
      {
        "sport_type_id": 1,
        "sport_type_name": "身高",
        "first_value": 120.0,
        "last_value": 125.5,
        "change": 5.5,
        "change_percent": 4.58,
        "trend": "improving"
      }
    ]
  }
}
```

### 5.6 取得學校排名

```http
GET /api/v1/sport-records/ranking
```

**查詢參數：**

| 參數 | 類型 | 必填 | 說明 |
|------|------|------|------|
| school_id | int | 是 | 學校 ID |
| sport_type_id | int | 是 | 運動類型 ID |
| grade | int | 否 | 篩選年級 |

### 5.7 新增運動記錄

```http
POST /api/v1/sport-records
```

**請求內容：**

```json
{
  "student_id": 1,
  "sport_type_id": 1,
  "value": 125.5,
  "test_date": "2025-03-15",
  "notes": "學期初測驗"
}
```

**欄位說明：**

| 欄位 | 類型 | 必填 | 說明 |
|------|------|------|------|
| student_id | int | 是 | 學生 ID |
| sport_type_id | int | 是 | 運動類型 ID |
| value | float | 是 | 測驗數值 |
| test_date | string | 是 | 測驗日期（YYYY-MM-DD） |
| notes | string | 否 | 備註 |

### 5.8 更新運動記錄

```http
PUT /api/v1/sport-records/:id
```

**說明：** 更新記錄會自動建立稽核軌跡。

### 5.9 刪除運動記錄

```http
DELETE /api/v1/sport-records/:id
```

---

## 6. 縣市統計 API

### 6.1 取得所有縣市統計

```http
GET /api/v1/counties/statistics
```

**說明：** 此端點使用 Redis 快取，TTL 為 15 分鐘。

**回應範例：**

```json
{
  "data": {
    "counties": [
      {
        "county_name": "臺北市",
        "school_count": 15,
        "student_count": 3500,
        "record_count": 12000,
        "has_data": true
      },
      {
        "county_name": "新北市",
        "school_count": 0,
        "student_count": 0,
        "record_count": 0,
        "has_data": false
      }
    ]
  }
}
```

### 6.2 取得單一縣市統計

```http
GET /api/v1/counties/:countyName/statistics
```

**路徑參數：**

| 參數 | 類型 | 說明 |
|------|------|------|
| countyName | string | 縣市名稱（需 URL 編碼） |

**範例：**
```
GET /api/v1/counties/%E8%87%BA%E5%8C%97%E5%B8%82/statistics
```

---

## 7. Excel 匯入 API

### 7.1 下載學生匯入模板

```http
GET /api/v1/import/templates/students
```

**回應：** Excel 檔案 (application/vnd.openxmlformats-officedocument.spreadsheetml.sheet)

### 7.2 下載運動記錄匯入模板

```http
GET /api/v1/import/templates/records
```

**查詢參數：**

| 參數 | 類型 | 必填 | 說明 |
|------|------|------|------|
| school_id | int | 否 | 學校 ID（提供時會預填學生名單） |
| grade | int | 否 | 年級（與 school_id 一起使用） |
| class | string | 否 | 班級 |

**範例：**
```
GET /api/v1/import/templates/records?school_id=1&grade=3&class=甲
```

### 7.3 預覽學生匯入

```http
POST /api/v1/import/students/preview
```

**請求格式：** multipart/form-data

| 欄位 | 類型 | 必填 | 說明 |
|------|------|------|------|
| file | file | 是 | Excel 檔案 |
| school_id | int | 是 | 目標學校 ID |

**回應範例：**

```json
{
  "data": {
    "preview_id": "550e8400-e29b-41d4-a716-446655440000",
    "type": "students",
    "school_id": 1,
    "file_name": "students.xlsx",
    "total_rows": 30,
    "valid_rows": 25,
    "warning_rows": 3,
    "error_rows": 2,
    "rows": [
      {
        "row_number": 2,
        "status": "valid",
        "data": {
          "student_number": "001",
          "name": "王小明",
          "grade": 3,
          "class": "甲",
          "gender": "male",
          "birth_date": "2015-03-15"
        },
        "errors": [],
        "warnings": []
      },
      {
        "row_number": 3,
        "status": "error",
        "data": {...},
        "errors": ["姓名為必填欄位"],
        "warnings": []
      }
    ],
    "expires_at": "2025-12-17T12:00:00Z"
  }
}
```

### 7.4 執行學生匯入

```http
POST /api/v1/import/students/execute
```

**請求內容：**

```json
{
  "preview_id": "550e8400-e29b-41d4-a716-446655440000",
  "include_warnings": true
}
```

**欄位說明：**

| 欄位 | 類型 | 必填 | 說明 |
|------|------|------|------|
| preview_id | string | 是 | 預覽 ID |
| include_warnings | bool | 否 | 是否包含警告資料（預設 true） |

**回應範例：**

```json
{
  "data": {
    "success": true,
    "imported_count": 28,
    "skipped_count": 2,
    "skipped_rows": [
      {
        "row_number": 3,
        "reason": "姓名為必填欄位"
      }
    ]
  }
}
```

### 7.5 預覽運動記錄匯入

```http
POST /api/v1/import/records/preview
```

**請求格式：** multipart/form-data

| 欄位 | 類型 | 必填 | 說明 |
|------|------|------|------|
| file | file | 是 | Excel 檔案 |
| school_id | int | 是 | 學校 ID |
| grade | int | 是 | 年級 |
| class | string | 是 | 班級 |

### 7.6 執行運動記錄匯入

```http
POST /api/v1/import/records/execute
```

### 7.7 取消預覽

```http
DELETE /api/v1/import/preview/:previewId
```

**說明：** 釋放預覽資料佔用的記憶體。預覽資料會在 1 小時後自動過期。

---

## 8. 錯誤處理

### 8.1 錯誤回應格式

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "請求資料驗證失敗",
    "details": [
      {
        "field": "name",
        "message": "姓名為必填欄位"
      }
    ]
  }
}
```

### 8.2 HTTP 狀態碼

| 狀態碼 | 說明 |
|--------|------|
| 200 | 成功 |
| 201 | 建立成功 |
| 400 | 請求格式錯誤或驗證失敗 |
| 401 | 未授權（需要登入） |
| 403 | 權限不足 |
| 404 | 資源不存在 |
| 409 | 資源衝突（如重複的學號） |
| 500 | 伺服器內部錯誤 |

### 8.3 常見錯誤碼

| 錯誤碼 | 說明 |
|--------|------|
| VALIDATION_ERROR | 請求資料驗證失敗 |
| NOT_FOUND | 找不到指定資源 |
| DUPLICATE_ENTRY | 資料重複（如學號已存在） |
| INVALID_FILE | 檔案格式錯誤 |
| PREVIEW_EXPIRED | 預覽已過期 |
| UNAUTHORIZED | 未授權存取 |

---

## 附錄

### A. 台灣縣市名稱列表

以下是系統支援的 22 個縣市名稱：

```
臺北市, 新北市, 桃園市, 臺中市, 臺南市, 高雄市,
基隆市, 新竹市, 嘉義市, 新竹縣, 苗栗縣, 彰化縣,
南投縣, 雲林縣, 嘉義縣, 屏東縣, 宜蘭縣, 花蓮縣,
臺東縣, 澎湖縣, 金門縣, 連江縣
```

### B. 日期格式支援

系統支援以下日期格式：

- `2025/03/15`
- `2025-03-15`
- `2025/3/15`
- `2025-3-15`
- `03/15/2025`
- `3/15/2025`
- `2025年03月15日`
- `20250315`
- Excel 序列號（如 45733）
