# School API Contract

**Base URL**: `/api/v1/schools`
**Authentication**: Required (JWT Bearer Token)

## Endpoints

### List Schools

```
GET /api/v1/schools
```

**Description**: Get a paginated list of all schools, optionally filtered by county.

**Query Parameters**:
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| page | integer | No | Page number (default: 1) |
| page_size | integer | No | Items per page (default: 20, max: 100) |
| county | string | No | Filter by county name |

**Response** (200 OK):
```json
{
  "data": {
    "schools": [
      {
        "id": 1,
        "name": "台北市立第一國小",
        "county_name": "臺北市",
        "address": "台北市中正區南海路56號",
        "phone": "02-2371-2363",
        "created_at": "2025-12-01T10:00:00Z",
        "updated_at": "2025-12-01T10:00:00Z",
        "student_count": 150
      }
    ],
    "pagination": {
      "page": 1,
      "page_size": 20,
      "total": 45,
      "total_pages": 3
    }
  }
}
```

---

### Get School by ID

```
GET /api/v1/schools/:id
```

**Description**: Get detailed information about a specific school.

**Path Parameters**:
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | integer | Yes | School ID |

**Response** (200 OK):
```json
{
  "data": {
    "school": {
      "id": 1,
      "name": "台北市立第一國小",
      "county_name": "臺北市",
      "address": "台北市中正區南海路56號",
      "phone": "02-2371-2363",
      "created_at": "2025-12-01T10:00:00Z",
      "updated_at": "2025-12-01T10:00:00Z",
      "student_count": 150
    }
  }
}
```

**Error Response** (404 Not Found):
```json
{
  "error": {
    "code": "SCHOOL_NOT_FOUND",
    "message": "學校不存在",
    "status": 404
  }
}
```

---

### Create School

```
POST /api/v1/schools
```

**Description**: Create a new school.

**Request Body**:
```json
{
  "name": "台北市立第一國小",
  "county_name": "臺北市",
  "address": "台北市中正區南海路56號",
  "phone": "02-2371-2363"
}
```

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| name | string | Yes | 1-100 characters |
| county_name | string | Yes | Must be valid Taiwan county |
| address | string | No | Max 255 characters |
| phone | string | No | Max 20 characters |

**Response** (201 Created):
```json
{
  "data": {
    "school": {
      "id": 1,
      "name": "台北市立第一國小",
      "county_name": "臺北市",
      "address": "台北市中正區南海路56號",
      "phone": "02-2371-2363",
      "created_at": "2025-12-01T10:00:00Z",
      "updated_at": "2025-12-01T10:00:00Z"
    }
  }
}
```

**Error Response** (400 Bad Request):
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "學校名稱為必填欄位",
    "status": 400
  }
}
```

**Error Response** (400 Bad Request - Invalid County):
```json
{
  "error": {
    "code": "INVALID_COUNTY",
    "message": "無效的縣市名稱",
    "status": 400
  }
}
```

**Error Response** (409 Conflict):
```json
{
  "error": {
    "code": "SCHOOL_EXISTS",
    "message": "此縣市已存在相同名稱的學校",
    "status": 409
  }
}
```

---

### Update School

```
PUT /api/v1/schools/:id
```

**Description**: Update an existing school's information.

**Path Parameters**:
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | integer | Yes | School ID |

**Request Body**:
```json
{
  "name": "台北市立第一國民小學",
  "county_name": "臺北市",
  "address": "台北市中正區南海路56號",
  "phone": "02-2371-2363"
}
```

**Response** (200 OK):
```json
{
  "data": {
    "school": {
      "id": 1,
      "name": "台北市立第一國民小學",
      "county_name": "臺北市",
      "address": "台北市中正區南海路56號",
      "phone": "02-2371-2363",
      "created_at": "2025-12-01T10:00:00Z",
      "updated_at": "2025-12-01T11:00:00Z"
    }
  }
}
```

**Error Response** (404 Not Found):
```json
{
  "error": {
    "code": "SCHOOL_NOT_FOUND",
    "message": "學校不存在",
    "status": 404
  }
}
```

---

### Delete School

```
DELETE /api/v1/schools/:id
```

**Description**: Soft delete a school. All associated students will also be soft deleted.

**Path Parameters**:
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | integer | Yes | School ID |

**Response** (200 OK):
```json
{
  "data": {
    "message": "學校已成功刪除"
  }
}
```

**Error Response** (404 Not Found):
```json
{
  "error": {
    "code": "SCHOOL_NOT_FOUND",
    "message": "學校不存在",
    "status": 404
  }
}
```

---

### Get School Students

```
GET /api/v1/schools/:id/students
```

**Description**: Get a paginated list of students belonging to a specific school.

**Path Parameters**:
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | integer | Yes | School ID |

**Query Parameters**:
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| page | integer | No | Page number (default: 1) |
| page_size | integer | No | Items per page (default: 20, max: 100) |
| grade | integer | No | Filter by grade (1-12) |

**Response** (200 OK):
```json
{
  "data": {
    "students": [
      {
        "id": 1,
        "school_id": 1,
        "student_number": "11001",
        "name": "王小明",
        "grade": 5,
        "class": "甲班",
        "gender": "male",
        "birth_date": "2014-05-15",
        "created_at": "2025-12-01T10:00:00Z",
        "updated_at": "2025-12-01T10:00:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "page_size": 20,
      "total": 150,
      "total_pages": 8
    }
  }
}
```

---

## Valid County Names

The following 22 county names are valid for the `county_name` field:

```
臺北市, 新北市, 基隆市, 桃園市, 新竹市, 新竹縣,
苗栗縣, 臺中市, 彰化縣, 南投縣, 雲林縣, 嘉義市,
嘉義縣, 臺南市, 高雄市, 屏東縣, 宜蘭縣, 花蓮縣,
臺東縣, 澎湖縣, 金門縣, 連江縣
```
