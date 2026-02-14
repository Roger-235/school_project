# API Contract: Import API

**Feature**: 007-excel-batch-import
**Base Path**: `/api/v1/import`
**Date**: 2025-12-13

---

## Overview

Excel 批次匯入 API，支援學生名單和運動記錄的批次匯入。

所有端點需要認證（JWT Token in Authorization header）。

---

## Endpoints

### 1. Download Student List Template

下載學生名單 Excel 模板。

**Endpoint**: `GET /api/v1/import/templates/students`

**Headers**:
```
Authorization: Bearer <token>
```

**Response**: `200 OK`
```
Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet
Content-Disposition: attachment; filename="student-list-template.xlsx"
```

**Response Body**: Binary Excel file

---

### 2. Download Sport Records Template

下載運動記錄 Excel 模板。

**Endpoint**: `GET /api/v1/import/templates/records`

**Headers**:
```
Authorization: Bearer <token>
```

**Response**: `200 OK`
```
Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet
Content-Disposition: attachment; filename="sport-records-template.xlsx"
```

**Response Body**: Binary Excel file

---

### 3. Preview Student Import

上傳學生名單 Excel 並取得預覽。

**Endpoint**: `POST /api/v1/import/students/preview`

**Headers**:
```
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

**Request Body** (multipart/form-data):
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| file | File | Yes | Excel 檔案 (.xlsx) |
| school_id | integer | Yes | 目標學校 ID |

**Response**: `200 OK`
```json
{
  "data": {
    "preview_id": "550e8400-e29b-41d4-a716-446655440000",
    "type": "students",
    "school_id": 1,
    "file_name": "三年甲班學生名單.xlsx",
    "total_rows": 30,
    "valid_rows": 28,
    "warning_rows": 0,
    "error_rows": 2,
    "expires_at": "2025-12-13T15:30:00Z",
    "rows": [
      {
        "row_number": 2,
        "status": "valid",
        "data": {
          "student_number": "1",
          "name": "王小明",
          "gender": "男",
          "grade": 3,
          "class": "甲",
          "birth_date": "2015-03-15"
        },
        "errors": []
      },
      {
        "row_number": 5,
        "status": "error",
        "data": {
          "student_number": "",
          "name": "張三",
          "gender": "男",
          "grade": 3,
          "class": "甲",
          "birth_date": ""
        },
        "errors": [
          {
            "field": "student_number",
            "code": "REQUIRED",
            "message": "座號為必填欄位"
          }
        ]
      }
    ]
  }
}
```

**Error Responses**:

`400 Bad Request` - 檔案格式錯誤
```json
{
  "error": {
    "code": "INVALID_FILE_FORMAT",
    "message": "僅支援 .xlsx 格式的 Excel 檔案",
    "status": 400
  }
}
```

`400 Bad Request` - 檔案過大
```json
{
  "error": {
    "code": "FILE_TOO_LARGE",
    "message": "檔案大小不可超過 5MB",
    "status": 400
  }
}
```

`400 Bad Request` - 標題列不正確
```json
{
  "error": {
    "code": "INVALID_HEADERS",
    "message": "Excel 標題列格式不正確，請使用系統提供的模板",
    "status": 400
  }
}
```

`404 Not Found` - 學校不存在
```json
{
  "error": {
    "code": "SCHOOL_NOT_FOUND",
    "message": "找不到 ID 為 999 的學校",
    "status": 404
  }
}
```

---

### 4. Preview Sport Records Import

上傳運動記錄 Excel 並取得預覽。

**Endpoint**: `POST /api/v1/import/records/preview`

**Headers**:
```
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

**Request Body** (multipart/form-data):
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| file | File | Yes | Excel 檔案 (.xlsx) |
| school_id | integer | Yes | 目標學校 ID |
| grade | integer | Yes | 年級 (1-12) |
| class | string | Yes | 班級名稱 |

**Response**: `200 OK`
```json
{
  "data": {
    "preview_id": "550e8400-e29b-41d4-a716-446655440001",
    "type": "records",
    "school_id": 1,
    "grade": 3,
    "class": "甲",
    "file_name": "三年甲班體適能測驗.xlsx",
    "total_rows": 30,
    "valid_rows": 25,
    "warning_rows": 3,
    "error_rows": 2,
    "expires_at": "2025-12-13T15:30:00Z",
    "rows": [
      {
        "row_number": 2,
        "status": "valid",
        "data": {
          "student_number": "1",
          "name": "王小明",
          "height": 125.5,
          "weight": 28.3,
          "sit_reach": 15,
          "standing_jump": 120,
          "sit_ups": 25,
          "cardio": 480,
          "test_date": "2025-03-15"
        },
        "errors": []
      },
      {
        "row_number": 10,
        "status": "warning",
        "data": {
          "student_number": "9",
          "name": "李四",
          "height": 280,
          "weight": 30,
          "sit_reach": null,
          "standing_jump": null,
          "sit_ups": null,
          "cardio": null,
          "test_date": "2025-03-15"
        },
        "errors": [
          {
            "field": "height",
            "code": "OUT_OF_RANGE",
            "message": "身高 280cm 超出合理範圍，請確認"
          }
        ]
      },
      {
        "row_number": 15,
        "status": "error",
        "data": {
          "student_number": "99",
          "name": "不存在",
          "height": 130,
          "weight": 32,
          "sit_reach": null,
          "standing_jump": null,
          "sit_ups": null,
          "cardio": null,
          "test_date": "2025-03-15"
        },
        "errors": [
          {
            "field": "student",
            "code": "NOT_FOUND",
            "message": "找不到座號 99 姓名 不存在 的學生"
          }
        ]
      }
    ]
  }
}
```

**Error Responses**: 同 Student Import Preview

---

### 5. Execute Student Import

確認並執行學生名單匯入。

**Endpoint**: `POST /api/v1/import/students/execute`

**Headers**:
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body**:
```json
{
  "preview_id": "550e8400-e29b-41d4-a716-446655440000",
  "include_warnings": true
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| preview_id | string | Yes | 預覽 ID（從 preview 回應取得） |
| include_warnings | boolean | No | 是否匯入警告列（預設 true） |

**Response**: `200 OK`
```json
{
  "data": {
    "preview_id": "550e8400-e29b-41d4-a716-446655440000",
    "type": "students",
    "success_count": 28,
    "skip_count": 2,
    "errors": [
      {
        "row_number": 5,
        "reason": "座號為必填欄位"
      },
      {
        "row_number": 12,
        "reason": "座號 3 重複"
      }
    ],
    "executed_at": "2025-12-13T15:20:00Z"
  }
}
```

**Error Responses**:

`404 Not Found` - 預覽不存在或已過期
```json
{
  "error": {
    "code": "PREVIEW_NOT_FOUND",
    "message": "預覽資料不存在或已過期，請重新上傳檔案",
    "status": 404
  }
}
```

`409 Conflict` - 預覽已被執行
```json
{
  "error": {
    "code": "PREVIEW_ALREADY_EXECUTED",
    "message": "此預覽已被執行，請重新上傳檔案",
    "status": 409
  }
}
```

---

### 6. Execute Sport Records Import

確認並執行運動記錄匯入。

**Endpoint**: `POST /api/v1/import/records/execute`

**Headers**:
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body**:
```json
{
  "preview_id": "550e8400-e29b-41d4-a716-446655440001",
  "include_warnings": true
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| preview_id | string | Yes | 預覽 ID（從 preview 回應取得） |
| include_warnings | boolean | No | 是否匯入警告列（預設 true） |

**Response**: `200 OK`
```json
{
  "data": {
    "preview_id": "550e8400-e29b-41d4-a716-446655440001",
    "type": "records",
    "success_count": 150,
    "skip_count": 12,
    "errors": [
      {
        "row_number": 15,
        "reason": "找不到座號 99 姓名 不存在 的學生"
      }
    ],
    "executed_at": "2025-12-13T15:25:00Z"
  }
}
```

**Error Responses**: 同 Student Import Execute

---

### 7. Cancel Import Preview

取消匯入預覽（釋放記憶體）。

**Endpoint**: `DELETE /api/v1/import/preview/:preview_id`

**Headers**:
```
Authorization: Bearer <token>
```

**Path Parameters**:
| Parameter | Type | Description |
|-----------|------|-------------|
| preview_id | string | 預覽 ID |

**Response**: `200 OK`
```json
{
  "data": {
    "message": "預覽已取消"
  }
}
```

**Error Responses**:

`404 Not Found` - 預覽不存在
```json
{
  "error": {
    "code": "PREVIEW_NOT_FOUND",
    "message": "預覽資料不存在或已過期",
    "status": 404
  }
}
```

---

## Error Codes Summary

| Code | HTTP Status | Description |
|------|-------------|-------------|
| INVALID_FILE_FORMAT | 400 | 檔案格式不是 .xlsx |
| FILE_TOO_LARGE | 400 | 檔案超過 5MB |
| INVALID_HEADERS | 400 | Excel 標題列格式不正確 |
| EMPTY_FILE | 400 | Excel 檔案沒有資料列 |
| SCHOOL_NOT_FOUND | 404 | 指定的學校不存在 |
| PREVIEW_NOT_FOUND | 404 | 預覽不存在或已過期 |
| PREVIEW_ALREADY_EXECUTED | 409 | 預覽已被執行 |
| REQUIRED | - | 必填欄位為空 |
| INVALID_TYPE | - | 資料類型錯誤 |
| INVALID_VALUE | - | 值不在允許範圍內 |
| INVALID_FORMAT | - | 格式錯誤（如日期） |
| MAX_LENGTH | - | 超過最大長度 |
| OUT_OF_RANGE | - | 數值超出合理範圍（warning） |
| DUPLICATE | - | 同檔案內重複 |
| NOT_FOUND | - | 關聯資料不存在 |
| NO_DATA | - | 無資料可匯入（warning） |

---

## TypeScript Types (Frontend)

```typescript
// types/import.ts

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
  data: StudentRowData | RecordRowData;
  errors: RowError[];
}

export interface StudentRowData {
  student_number: string;
  name: string;
  gender: string;
  grade: number;
  class: string;
  birth_date: string | null;
}

export interface RecordRowData {
  student_number: string;
  name: string;
  height: number | null;
  weight: number | null;
  sit_reach: number | null;
  standing_jump: number | null;
  sit_ups: number | null;
  cardio: number | null;
  test_date: string;
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

export interface ExecuteImportRequest {
  preview_id: string;
  include_warnings?: boolean;
}
```
