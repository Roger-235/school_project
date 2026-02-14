# Sport Record API Contract

**Base URL**: `/api/v1/sport-records`
**Authentication**: Required (JWT Bearer Token)

## Endpoints

### Create Sport Record

```
POST /api/v1/sport-records
```

**Description**: Create a new sport record for a student.

**Request Body**:
```json
{
  "student_id": 1,
  "sport_type_id": 1,
  "value": 180.5,
  "test_date": "2025-11-15",
  "notes": "表現良好"
}
```

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| student_id | integer | Yes | Must be valid student ID |
| sport_type_id | integer | Yes | Must be valid sport type ID (1-17) |
| value | number | Yes | Must be positive |
| test_date | string | Yes | ISO date format (YYYY-MM-DD), not in future |
| notes | string | No | Max 500 characters |

**Response** (201 Created):
```json
{
  "data": {
    "record": {
      "id": 1,
      "student_id": 1,
      "sport_type_id": 1,
      "value": 180.5,
      "test_date": "2025-11-15",
      "notes": "表現良好",
      "created_at": "2025-11-15T14:00:00Z",
      "updated_at": "2025-11-15T14:00:00Z",
      "sport_type": {
        "id": 1,
        "name": "800公尺",
        "category": "體適能",
        "default_unit": "秒",
        "value_type": "time"
      }
    }
  }
}
```

**Error Response** (400 Bad Request):
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "測驗數值必須為正數",
    "status": 400
  }
}
```

**Error Response** (400 Bad Request - Invalid Student):
```json
{
  "error": {
    "code": "INVALID_STUDENT",
    "message": "學生不存在",
    "status": 400
  }
}
```

**Error Response** (400 Bad Request - Invalid Sport Type):
```json
{
  "error": {
    "code": "INVALID_SPORT_TYPE",
    "message": "運動項目不存在",
    "status": 400
  }
}
```

**Error Response** (400 Bad Request - Future Date):
```json
{
  "error": {
    "code": "FUTURE_DATE",
    "message": "測驗日期不能是未來日期",
    "status": 400
  }
}
```

---

### Get Sport Record by ID

```
GET /api/v1/sport-records/:id
```

**Description**: Get detailed information about a specific sport record.

**Path Parameters**:
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | integer | Yes | Sport Record ID |

**Response** (200 OK):
```json
{
  "data": {
    "record": {
      "id": 1,
      "student_id": 1,
      "sport_type_id": 1,
      "value": 180.5,
      "test_date": "2025-11-15",
      "notes": "表現良好",
      "created_at": "2025-11-15T14:00:00Z",
      "updated_at": "2025-11-15T14:00:00Z",
      "student": {
        "id": 1,
        "name": "王小明",
        "student_number": "11001",
        "grade": 5
      },
      "sport_type": {
        "id": 1,
        "name": "800公尺",
        "category": "體適能",
        "default_unit": "秒",
        "value_type": "time"
      }
    }
  }
}
```

**Error Response** (404 Not Found):
```json
{
  "error": {
    "code": "RECORD_NOT_FOUND",
    "message": "運動記錄不存在",
    "status": 404
  }
}
```

---

### Update Sport Record

```
PUT /api/v1/sport-records/:id
```

**Description**: Update an existing sport record. Creates an audit trail entry.

**Path Parameters**:
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | integer | Yes | Sport Record ID |

**Request Body**:
```json
{
  "value": 175.2,
  "test_date": "2025-11-15",
  "notes": "重新測量後的結果",
  "reason": "修正計時錯誤"
}
```

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| value | number | Yes | Must be positive |
| test_date | string | Yes | ISO date format (YYYY-MM-DD), not in future |
| notes | string | No | Max 500 characters |
| reason | string | No | Reason for modification (for audit) |

**Note**: `student_id` and `sport_type_id` cannot be changed after creation.

**Response** (200 OK):
```json
{
  "data": {
    "record": {
      "id": 1,
      "student_id": 1,
      "sport_type_id": 1,
      "value": 175.2,
      "test_date": "2025-11-15",
      "notes": "重新測量後的結果",
      "created_at": "2025-11-15T14:00:00Z",
      "updated_at": "2025-11-15T15:00:00Z",
      "sport_type": {
        "id": 1,
        "name": "800公尺",
        "category": "體適能",
        "default_unit": "秒",
        "value_type": "time"
      }
    }
  }
}
```

**Error Response** (404 Not Found):
```json
{
  "error": {
    "code": "RECORD_NOT_FOUND",
    "message": "運動記錄不存在",
    "status": 404
  }
}
```

---

### Delete Sport Record

```
DELETE /api/v1/sport-records/:id
```

**Description**: Permanently delete a sport record. This action cannot be undone.

**Path Parameters**:
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | integer | Yes | Sport Record ID |

**Response** (200 OK):
```json
{
  "data": {
    "message": "運動記錄已成功刪除"
  }
}
```

**Error Response** (404 Not Found):
```json
{
  "error": {
    "code": "RECORD_NOT_FOUND",
    "message": "運動記錄不存在",
    "status": 404
  }
}
```

---

### Get Record Audit History

```
GET /api/v1/sport-records/:id/history
```

**Description**: Get the modification history for a sport record.

**Path Parameters**:
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | integer | Yes | Sport Record ID |

**Response** (200 OK):
```json
{
  "data": {
    "audits": [
      {
        "id": 1,
        "sport_record_id": 1,
        "old_value": 180.5,
        "new_value": 175.2,
        "changed_by": 1,
        "changed_at": "2025-11-15T15:00:00Z",
        "reason": "修正計時錯誤"
      }
    ]
  }
}
```

**Empty History Response** (200 OK):
```json
{
  "data": {
    "audits": [],
    "message": "此記錄尚無修改歷史"
  }
}
```

---

## Batch Operations (Future Enhancement)

### Create Multiple Records

```
POST /api/v1/sport-records/batch
```

**Note**: This endpoint is planned for future implementation when batch import is supported. It is out of scope for MVP.

**Request Body** (planned):
```json
{
  "records": [
    {
      "student_id": 1,
      "sport_type_id": 1,
      "value": 180.5,
      "test_date": "2025-11-15"
    },
    {
      "student_id": 1,
      "sport_type_id": 2,
      "value": 360.2,
      "test_date": "2025-11-15"
    }
  ]
}
```

---

## Value Guidelines

### Time-based Sports (value_type: "time")

- Unit: seconds
- Examples:
  - 100公尺: 12.5 (12.5 seconds)
  - 800公尺: 180.5 (3 minutes 0.5 seconds)
  - 1600公尺: 420.0 (7 minutes)

### Distance-based Sports (value_type: "distance")

- Unit varies by sport (check `default_unit`)
- Examples:
  - 立定跳遠: 220 (220 公分 = 2.2 m)
  - 跳高: 135 (135 公分 = 1.35 m)
  - 鉛球: 8.5 (8.5 公尺)

### Count-based Sports (value_type: "count")

- Unit: repetitions/times
- Examples:
  - 1分鐘仰臥起坐: 35 (35 次)
  - 排球墊球: 50 (50 次)

### Value Validation

| Value Type | Typical Range | Warning Threshold |
|------------|--------------|-------------------|
| time (short) | 10-30 sec | > 60 sec |
| time (medium) | 100-300 sec | > 600 sec |
| time (long) | 300-600 sec | > 900 sec |
| distance (cm) | 50-300 cm | > 500 cm |
| distance (m) | 2-20 m | > 50 m |
| count | 10-100 | > 200 |

**Note**: Values outside typical range trigger a warning but are still saved. This allows for exceptional performances while alerting potential data entry errors.
