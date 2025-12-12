# Research: 學生運動資料管理系統

**Feature**: 003-student-sports-data
**Date**: 2025-12-01
**Phase**: 0 - Technology Research and Decision Documentation

## Purpose

Document technology choices, best practices, and implementation patterns for the student sports data management feature. All decisions align with ACAP Constitution v1.0.0 technology stack requirements and build upon 001-user-auth and 002-map-visualization foundations.

## Technology Stack Research

### Backend: Go + Gin + GORM (Existing Stack)

**Decision**: Continue using Go 1.21+ with Gin framework and GORM ORM

**Rationale**:
- **Constitution Mandated**: Go + Gin + GORM locked choice
- **Existing Infrastructure**: Reuse 001-user-auth codebase and patterns
- **Performance**: Go handles concurrent requests efficiently
- **Type Safety**: Strong typing prevents runtime errors

**GORM Model Pattern**:
```go
type School struct {
    ID          uint           `gorm:"primarykey" json:"id"`
    Name        string         `gorm:"size:100;not null" json:"name"`
    CountyName  string         `gorm:"size:50;not null;index" json:"county_name"`
    Address     string         `gorm:"size:255" json:"address"`
    Phone       string         `gorm:"size:20" json:"phone"`
    CreatedAt   time.Time      `json:"created_at"`
    UpdatedAt   time.Time      `json:"updated_at"`
    DeletedAt   gorm.DeletedAt `gorm:"index" json:"-"`
    Students    []Student      `gorm:"foreignKey:SchoolID" json:"students,omitempty"`
}
```

### Soft Delete Strategy

**Decision**: Use GORM's built-in soft delete with `gorm.DeletedAt` field

**Rationale**:
- **Data Integrity**: Preserve historical sport records even when students/schools are "deleted"
- **GORM Native**: No custom implementation needed
- **Query Transparency**: GORM automatically excludes soft-deleted records
- **Recoverable**: Admin can restore deleted records if needed

**Implementation Pattern**:
```go
// Soft delete (sets deleted_at timestamp)
db.Delete(&student)

// Query excludes deleted records by default
db.Find(&students)

// Include deleted records (admin view)
db.Unscoped().Find(&students)

// Permanently delete (if ever needed)
db.Unscoped().Delete(&student)
```

### County Name Validation

**Decision**: Validate county names against fixed list of 22 Taiwan counties

**Rationale**:
- **Data Consistency**: Ensures schools use same county names as 002-map-visualization
- **Map Integration**: County statistics will aggregate correctly on map
- **Prevent Typos**: Users select from dropdown, not free text

**County List** (from 002-map-visualization):
```go
var ValidCounties = []string{
    "臺北市", "新北市", "基隆市", "桃園市", "新竹市", "新竹縣",
    "苗栗縣", "臺中市", "彰化縣", "南投縣", "雲林縣", "嘉義市",
    "嘉義縣", "臺南市", "高雄市", "屏東縣", "宜蘭縣", "花蓮縣",
    "臺東縣", "澎湖縣", "金門縣", "連江縣",
}

func IsValidCounty(name string) bool {
    for _, c := range ValidCounties {
        if c == name {
            return true
        }
    }
    return false
}
```

### Sport Types Seed Data

**Decision**: Pre-populate sport_types table with 17 standard items

**Rationale**:
- **User Convenience**: Users select from list, no manual entry
- **Data Consistency**: Uniform naming across all records
- **Correct Units**: Each type has appropriate default unit

**Seed Data Structure**:
```go
type SportType struct {
    ID          uint   `gorm:"primarykey" json:"id"`
    Name        string `gorm:"size:50;not null;uniqueIndex" json:"name"`
    Category    string `gorm:"size:20;not null" json:"category"` // 體適能, 田徑, 球類
    DefaultUnit string `gorm:"size:20;not null" json:"default_unit"`
    ValueType   string `gorm:"size:20;not null" json:"value_type"` // time, distance, count, score
}

var SeedSportTypes = []SportType{
    // 體適能標準項目
    {Name: "800公尺", Category: "體適能", DefaultUnit: "秒", ValueType: "time"},
    {Name: "1600公尺", Category: "體適能", DefaultUnit: "秒", ValueType: "time"},
    {Name: "坐姿體前彎", Category: "體適能", DefaultUnit: "公分", ValueType: "distance"},
    {Name: "1分鐘仰臥起坐", Category: "體適能", DefaultUnit: "次", ValueType: "count"},
    {Name: "立定跳遠", Category: "體適能", DefaultUnit: "公分", ValueType: "distance"},
    {Name: "1分鐘屈膝仰臥起坐", Category: "體適能", DefaultUnit: "次", ValueType: "count"},

    // 田徑基礎項目
    {Name: "100公尺", Category: "田徑", DefaultUnit: "秒", ValueType: "time"},
    {Name: "200公尺", Category: "田徑", DefaultUnit: "秒", ValueType: "time"},
    {Name: "400公尺", Category: "田徑", DefaultUnit: "秒", ValueType: "time"},
    {Name: "跳遠", Category: "田徑", DefaultUnit: "公分", ValueType: "distance"},
    {Name: "跳高", Category: "田徑", DefaultUnit: "公分", ValueType: "distance"},
    {Name: "鉛球", Category: "田徑", DefaultUnit: "公尺", ValueType: "distance"},
    {Name: "壘球擲遠", Category: "田徑", DefaultUnit: "公尺", ValueType: "distance"},

    // 球類基礎測驗
    {Name: "籃球運球", Category: "球類", DefaultUnit: "秒", ValueType: "time"},
    {Name: "足球運球", Category: "球類", DefaultUnit: "秒", ValueType: "time"},
    {Name: "排球墊球", Category: "球類", DefaultUnit: "次", ValueType: "count"},
    {Name: "桌球正手擊球", Category: "球類", DefaultUnit: "次", ValueType: "count"},
}
```

### Student Number Uniqueness

**Decision**: Unique constraint on (school_id, student_number) composite key

**Rationale**:
- **School Scope**: Same student number can exist in different schools
- **Prevents Duplicates**: Database-level enforcement
- **Flexible Numbering**: Schools can use their own numbering systems

**Implementation**:
```go
type Student struct {
    ID            uint           `gorm:"primarykey" json:"id"`
    SchoolID      uint           `gorm:"not null;index" json:"school_id"`
    StudentNumber string         `gorm:"size:20;not null" json:"student_number"`
    Name          string         `gorm:"size:50;not null" json:"name"`
    Grade         int            `gorm:"not null" json:"grade"` // 1-12
    Class         string         `gorm:"size:20" json:"class"`
    Gender        string         `gorm:"size:10;not null" json:"gender"` // male, female
    BirthDate     time.Time      `json:"birth_date"`
    CreatedAt     time.Time      `json:"created_at"`
    UpdatedAt     time.Time      `json:"updated_at"`
    DeletedAt     gorm.DeletedAt `gorm:"index" json:"-"`
    School        School         `gorm:"foreignKey:SchoolID" json:"school,omitempty"`
    SportRecords  []SportRecord  `gorm:"foreignKey:StudentID" json:"sport_records,omitempty"`
}

// Migration with composite unique index
db.Exec("CREATE UNIQUE INDEX idx_school_student_number ON students(school_id, student_number) WHERE deleted_at IS NULL")
```

### Sport Record History

**Decision**: Store modification history in separate audit table

**Rationale**:
- **Requirement FR-012**: System must preserve modification history
- **Audit Trail**: Track who changed what and when
- **Performance**: Main table stays lean, history queried separately

**Implementation Pattern**:
```go
type SportRecord struct {
    ID           uint      `gorm:"primarykey" json:"id"`
    StudentID    uint      `gorm:"not null;index" json:"student_id"`
    SportTypeID  uint      `gorm:"not null;index" json:"sport_type_id"`
    Value        float64   `gorm:"not null" json:"value"`
    TestDate     time.Time `gorm:"not null;index" json:"test_date"`
    Notes        string    `gorm:"size:500" json:"notes"`
    CreatedAt    time.Time `json:"created_at"`
    UpdatedAt    time.Time `json:"updated_at"`
    Student      Student   `gorm:"foreignKey:StudentID" json:"student,omitempty"`
    SportType    SportType `gorm:"foreignKey:SportTypeID" json:"sport_type,omitempty"`
}

type SportRecordAudit struct {
    ID            uint      `gorm:"primarykey"`
    SportRecordID uint      `gorm:"not null;index"`
    OldValue      float64
    NewValue      float64
    ChangedBy     uint      // User ID
    ChangedAt     time.Time
    Reason        string    `gorm:"size:255"`
}
```

### Frontend: Next.js 14 Pages Router (Existing Stack)

**Decision**: Continue using Next.js 14 with Pages Router

**Rationale**:
- **Constitution Mandated**: Pages Router (NOT App Router)
- **Existing Codebase**: Reuse patterns from 001-user-auth and 002-map-visualization
- **React Query**: Already integrated for data fetching

**Page Structure**:
```
pages/
├── schools/
│   ├── index.tsx      # List all schools
│   ├── new.tsx        # Create school form
│   └── [id]/
│       ├── index.tsx  # School detail + student list
│       └── edit.tsx   # Edit school form
└── students/
    ├── index.tsx      # Search students
    ├── new.tsx        # Create student form
    └── [id]/
        ├── index.tsx  # Student detail + sport records
        ├── edit.tsx   # Edit student form
        └── records/
            └── new.tsx # Add sport record
```

### Form Handling: React Hook Form + Zod

**Decision**: Use React Hook Form with Zod validation (Constitution mandated)

**Rationale**:
- **Constitution Mandated**: React Hook Form + Zod locked choice
- **Type Safety**: Zod schemas generate TypeScript types
- **Validation**: Client and server validation aligned

**Schema Example**:
```typescript
import { z } from 'zod'

export const schoolSchema = z.object({
  name: z.string().min(1, '學校名稱為必填').max(100),
  countyName: z.string().min(1, '縣市為必填'),
  address: z.string().max(255).optional(),
  phone: z.string().max(20).optional(),
})

export const studentSchema = z.object({
  schoolId: z.number().positive(),
  studentNumber: z.string().min(1, '學號為必填').max(20),
  name: z.string().min(1, '姓名為必填').max(50),
  grade: z.number().min(1).max(12),
  class: z.string().max(20).optional(),
  gender: z.enum(['male', 'female']),
  birthDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
})

export const sportRecordSchema = z.object({
  studentId: z.number().positive(),
  sportTypeId: z.number().positive(),
  value: z.number().positive(),
  testDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  notes: z.string().max(500).optional(),
})
```

### API Response Format

**Decision**: Follow constitution-mandated consistent response format

**Success Response**:
```json
{
  "data": {
    "school": {
      "id": 1,
      "name": "台北市立第一國小",
      "county_name": "臺北市",
      "address": "台北市中正區...",
      "phone": "02-1234-5678",
      "created_at": "2025-12-01T10:00:00Z"
    }
  }
}
```

**List Response with Pagination**:
```json
{
  "data": {
    "students": [...],
    "pagination": {
      "page": 1,
      "page_size": 20,
      "total": 150,
      "total_pages": 8
    }
  }
}
```

**Error Response**:
```json
{
  "error": {
    "code": "STUDENT_NUMBER_EXISTS",
    "message": "此學號已存在於該學校",
    "status": 400
  }
}
```

### Search Implementation

**Decision**: Use GORM's WHERE clauses with LIKE for fuzzy search

**Rationale**:
- **Simple Implementation**: No external search engine needed for MVP
- **Performance**: Database indexes on searchable fields
- **Flexibility**: Combine multiple filters easily

**Implementation Pattern**:
```go
func (s *StudentService) Search(query SearchQuery) ([]Student, Pagination, error) {
    db := s.db.Model(&Student{})

    if query.Name != "" {
        db = db.Where("name LIKE ?", "%"+query.Name+"%")
    }
    if query.SchoolID > 0 {
        db = db.Where("school_id = ?", query.SchoolID)
    }
    if query.Grade > 0 {
        db = db.Where("grade = ?", query.Grade)
    }

    var total int64
    db.Count(&total)

    var students []Student
    db.Preload("School").
        Offset((query.Page - 1) * query.PageSize).
        Limit(query.PageSize).
        Find(&students)

    return students, Pagination{...}, nil
}
```

### Caching Strategy

**Decision**: Use Redis for frequently accessed data (from 002-map-visualization)

**Cacheable Data**:
- Sport types list (rarely changes): 1 hour TTL
- County list: Static, cache indefinitely
- School list for dropdown: 15 minutes TTL

**Non-cacheable Data**:
- Student records (frequently updated)
- Sport records (frequently updated)
- Search results (too varied)

### Authentication Integration

**Decision**: Reuse auth middleware from 001-user-auth

**Pattern**:
```go
// In routes setup
schoolRoutes := router.Group("/api/v1/schools")
schoolRoutes.Use(auth.AuthMiddleware())
{
    schoolRoutes.GET("", schoolHandler.List)
    schoolRoutes.POST("", schoolHandler.Create)
    schoolRoutes.GET("/:id", schoolHandler.Get)
    schoolRoutes.PUT("/:id", schoolHandler.Update)
    schoolRoutes.DELETE("/:id", schoolHandler.Delete)
}
```

**Frontend Protection**:
```typescript
// In pages/schools/index.tsx
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'

export default function SchoolsPage() {
  return (
    <ProtectedRoute>
      <SchoolList />
    </ProtectedRoute>
  )
}
```

## Database Schema Design

### Tables Overview

```sql
-- Schools table
CREATE TABLE schools (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    county_name VARCHAR(50) NOT NULL,
    address VARCHAR(255),
    phone VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL,
    INDEX idx_county_name (county_name),
    INDEX idx_deleted_at (deleted_at)
);

-- Students table
CREATE TABLE students (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    school_id BIGINT UNSIGNED NOT NULL,
    student_number VARCHAR(20) NOT NULL,
    name VARCHAR(50) NOT NULL,
    grade INT NOT NULL,
    class VARCHAR(20),
    gender VARCHAR(10) NOT NULL,
    birth_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL,
    FOREIGN KEY (school_id) REFERENCES schools(id),
    UNIQUE INDEX idx_school_student (school_id, student_number),
    INDEX idx_name (name),
    INDEX idx_deleted_at (deleted_at)
);

-- Sport types table (seed data)
CREATE TABLE sport_types (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    category VARCHAR(20) NOT NULL,
    default_unit VARCHAR(20) NOT NULL,
    value_type VARCHAR(20) NOT NULL
);

-- Sport records table
CREATE TABLE sport_records (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    student_id BIGINT UNSIGNED NOT NULL,
    sport_type_id BIGINT UNSIGNED NOT NULL,
    value DECIMAL(10,2) NOT NULL,
    test_date DATE NOT NULL,
    notes VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES students(id),
    FOREIGN KEY (sport_type_id) REFERENCES sport_types(id),
    INDEX idx_student_sport (student_id, sport_type_id),
    INDEX idx_test_date (test_date)
);

-- Sport record audit table
CREATE TABLE sport_record_audits (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    sport_record_id BIGINT UNSIGNED NOT NULL,
    old_value DECIMAL(10,2),
    new_value DECIMAL(10,2),
    changed_by BIGINT UNSIGNED NOT NULL,
    changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    reason VARCHAR(255),
    FOREIGN KEY (sport_record_id) REFERENCES sport_records(id),
    INDEX idx_record (sport_record_id)
);
```

## Testing Strategy

### Backend Testing

**Unit Tests**:
- Validation functions (county name, student number format)
- Service layer business logic
- Search query building

**Integration Tests**:
- CRUD operations for all entities
- Soft delete behavior
- Search with various filters
- Audit trail creation

### Frontend Testing

**Component Tests**:
- Form components with validation
- List components with pagination
- Search filters

**Integration Tests**:
- Page navigation flow
- Form submission and error handling
- Protected route redirects

## Performance Considerations

### Database Indexes

Required indexes for MVP:
- `schools.county_name` - County statistics aggregation
- `students.school_id` - Student list by school
- `students.name` - Name search
- `sport_records.student_id` - Records by student
- `sport_records.test_date` - Records by date range

### Pagination

Default page size: 20 items
Maximum page size: 100 items

### Preloading

Use GORM Preload to avoid N+1 queries:
```go
db.Preload("School").Preload("SportRecords").Find(&students)
```

## Security Considerations

### Input Validation

1. **County Name**: Whitelist validation against 22 counties
2. **Grade**: Range validation (1-12)
3. **Gender**: Enum validation (male/female)
4. **Dates**: Format validation (YYYY-MM-DD)
5. **Numeric Values**: Positive numbers only for sport records

### SQL Injection Prevention

- GORM parameterized queries (automatic)
- No raw SQL with user input

### Rate Limiting

- Reuse rate limiting from 001-user-auth
- Search endpoint: 60 requests/minute per user

## Dependencies

### Go Packages (Backend)

```go
require (
    github.com/gin-gonic/gin v1.9.1  // Already installed
    gorm.io/gorm v1.25.5              // Already installed
    gorm.io/driver/mysql v1.5.2      // Already installed
    github.com/go-redis/redis/v8 v8.11.5 // Already installed
)
```

No new dependencies required.

### NPM Packages (Frontend)

```json
{
  "dependencies": {
    "react-hook-form": "^7.x.x",    // Already installed
    "zod": "^3.x.x",                 // Already installed
    "@tanstack/react-query": "^5.x.x", // Already installed
    "axios": "^1.x.x"                // Already installed
  }
}
```

No new dependencies required.

## Next Steps

Phase 0 research complete. All technology decisions documented and aligned with ACAP Constitution v1.0.0.

**Ready for Phase 1**: Generate data-model.md, contracts/, and quickstart.md based on this research.
