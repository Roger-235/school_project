# Student API Contract

**Base URL**: `/api/v1/students`
**Authentication**: Required (JWT Bearer Token)

## Endpoints

### List Students (Search)

```
GET /api/v1/students
```

**Description**: Search and list students with various filters.

**Query Parameters**:
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| page | integer | No | Page number (default: 1) |
| page_size | integer | No | Items per page (default: 20, max: 100) |
| name | string | No | Filter by name (fuzzy match) |
| school_id | integer | No | Filter by school |
| grade | integer | No | Filter by grade (1-12) |
| gender | string | No | Filter by gender (male/female) |

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
        "updated_at": "2025-12-01T10:00:00Z",
        "school": {
          "id": 1,
          "name": "台北市立第一國小",
          "county_name": "臺北市"
        }
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

**Empty Result Response** (200 OK):
```json
{
  "data": {
    "students": [],
    "pagination": {
      "page": 1,
      "page_size": 20,
      "total": 0,
      "total_pages": 0
    },
    "message": "無符合條件的學生"
  }
}
```

---

### Get Student by ID

```
GET /api/v1/students/:id
```

**Description**: Get detailed information about a specific student, including their sport records.

**Path Parameters**:
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | integer | Yes | Student ID |

**Query Parameters**:
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| include_records | boolean | No | Include sport records (default: false) |

**Response** (200 OK):
```json
{
  "data": {
    "student": {
      "id": 1,
      "school_id": 1,
      "student_number": "11001",
      "name": "王小明",
      "grade": 5,
      "class": "甲班",
      "gender": "male",
      "birth_date": "2014-05-15",
      "created_at": "2025-12-01T10:00:00Z",
      "updated_at": "2025-12-01T10:00:00Z",
      "school": {
        "id": 1,
        "name": "台北市立第一國小",
        "county_name": "臺北市"
      },
      "sport_records": [
        {
          "id": 1,
          "sport_type_id": 1,
          "value": 180.5,
          "test_date": "2025-11-15",
          "notes": "表現良好",
          "sport_type": {
            "id": 1,
            "name": "800公尺",
            "category": "體適能",
            "default_unit": "秒"
          }
        }
      ]
    }
  }
}
```

**Error Response** (404 Not Found):
```json
{
  "error": {
    "code": "STUDENT_NOT_FOUND",
    "message": "學生不存在",
    "status": 404
  }
}
```

---

### Create Student

```
POST /api/v1/students
```

**Description**: Create a new student under a school.

**Request Body**:
```json
{
  "school_id": 1,
  "student_number": "11001",
  "name": "王小明",
  "grade": 5,
  "class": "甲班",
  "gender": "male",
  "birth_date": "2014-05-15"
}
```

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| school_id | integer | Yes | Must be valid school ID |
| student_number | string | Yes | 1-20 characters, unique per school |
| name | string | Yes | 1-50 characters |
| grade | integer | Yes | 1-12 |
| class | string | No | Max 20 characters |
| gender | string | Yes | "male" or "female" |
| birth_date | string | No | ISO date format (YYYY-MM-DD) |

**Response** (201 Created):
```json
{
  "data": {
    "student": {
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
  }
}
```

**Error Response** (400 Bad Request):
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "姓名為必填欄位",
    "status": 400
  }
}
```

**Error Response** (400 Bad Request - Invalid School):
```json
{
  "error": {
    "code": "INVALID_SCHOOL",
    "message": "學校不存在",
    "status": 400
  }
}
```

**Error Response** (409 Conflict):
```json
{
  "error": {
    "code": "STUDENT_NUMBER_EXISTS",
    "message": "此學號已存在於該學校",
    "status": 409
  }
}
```

---

### Update Student

```
PUT /api/v1/students/:id
```

**Description**: Update an existing student's information.

**Path Parameters**:
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | integer | Yes | Student ID |

**Request Body**:
```json
{
  "student_number": "11001",
  "name": "王小明",
  "grade": 6,
  "class": "甲班",
  "gender": "male",
  "birth_date": "2014-05-15"
}
```

**Note**: `school_id` cannot be changed after creation.

**Response** (200 OK):
```json
{
  "data": {
    "student": {
      "id": 1,
      "school_id": 1,
      "student_number": "11001",
      "name": "王小明",
      "grade": 6,
      "class": "甲班",
      "gender": "male",
      "birth_date": "2014-05-15",
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
    "code": "STUDENT_NOT_FOUND",
    "message": "學生不存在",
    "status": 404
  }
}
```

---

### Delete Student

```
DELETE /api/v1/students/:id
```

**Description**: Soft delete a student. All associated sport records are preserved.

**Path Parameters**:
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | integer | Yes | Student ID |

**Response** (200 OK):
```json
{
  "data": {
    "message": "學生已成功刪除"
  }
}
```

**Error Response** (404 Not Found):
```json
{
  "error": {
    "code": "STUDENT_NOT_FOUND",
    "message": "學生不存在",
    "status": 404
  }
}
```

---

### Get Student Sport Records

```
GET /api/v1/students/:id/records
```

**Description**: Get all sport records for a specific student.

**Path Parameters**:
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | integer | Yes | Student ID |

**Query Parameters**:
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| page | integer | No | Page number (default: 1) |
| page_size | integer | No | Items per page (default: 20, max: 100) |
| sport_type_id | integer | No | Filter by sport type |
| from_date | string | No | Filter records from date (YYYY-MM-DD) |
| to_date | string | No | Filter records to date (YYYY-MM-DD) |

**Response** (200 OK):
```json
{
  "data": {
    "records": [
      {
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
