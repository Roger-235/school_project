# Data Model: 學生運動資料管理系統

**Feature**: 003-student-sports-data
**Date**: 2025-12-01
**Phase**: 1 - Design & Contracts

## Entity Relationship Diagram

```
┌─────────────────┐       ┌─────────────────┐
│     School      │       │    SportType    │
├─────────────────┤       ├─────────────────┤
│ id (PK)         │       │ id (PK)         │
│ name            │       │ name            │
│ county_name     │       │ category        │
│ address         │       │ default_unit    │
│ phone           │       │ value_type      │
│ created_at      │       └────────┬────────┘
│ updated_at      │                │
│ deleted_at      │                │
└────────┬────────┘                │
         │                         │
         │ 1:N                     │ 1:N
         │                         │
         ▼                         │
┌─────────────────┐                │
│     Student     │                │
├─────────────────┤                │
│ id (PK)         │                │
│ school_id (FK)  │────────────────│
│ student_number  │                │
│ name            │                │
│ grade           │                │
│ class           │                │
│ gender          │                │
│ birth_date      │                │
│ created_at      │                │
│ updated_at      │                │
│ deleted_at      │                │
└────────┬────────┘                │
         │                         │
         │ 1:N                     │
         │                         │
         ▼                         ▼
┌─────────────────────────────────────────┐
│              SportRecord                │
├─────────────────────────────────────────┤
│ id (PK)                                 │
│ student_id (FK) ◄───────────────────────│
│ sport_type_id (FK) ◄────────────────────┘
│ value                                   │
│ test_date                               │
│ notes                                   │
│ created_at                              │
│ updated_at                              │
└────────┬────────────────────────────────┘
         │
         │ 1:N
         │
         ▼
┌─────────────────────────────────────────┐
│           SportRecordAudit              │
├─────────────────────────────────────────┤
│ id (PK)                                 │
│ sport_record_id (FK)                    │
│ old_value                               │
│ new_value                               │
│ changed_by                              │
│ changed_at                              │
│ reason                                  │
└─────────────────────────────────────────┘
```

## Entity Definitions

### School (學校)

代表一所學校，是學生資料的組織單位。

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | BIGINT UNSIGNED | PK, AUTO_INCREMENT | 主鍵 |
| name | VARCHAR(100) | NOT NULL | 學校名稱 |
| county_name | VARCHAR(50) | NOT NULL, INDEX | 縣市名稱 (22 縣市之一) |
| address | VARCHAR(255) | NULL | 學校地址 |
| phone | VARCHAR(20) | NULL | 聯絡電話 |
| created_at | TIMESTAMP | DEFAULT NOW() | 建立時間 |
| updated_at | TIMESTAMP | ON UPDATE NOW() | 更新時間 |
| deleted_at | TIMESTAMP | NULL, INDEX | 軟刪除時間 |

**Relationships**:
- Has many Students (1:N)

**Validation Rules**:
- name: 1-100 characters, required
- county_name: Must be one of 22 valid Taiwan counties
- phone: Max 20 characters, optional

**Go Model**:
```go
type School struct {
    ID         uint           `gorm:"primarykey" json:"id"`
    Name       string         `gorm:"size:100;not null" json:"name" binding:"required,max=100"`
    CountyName string         `gorm:"size:50;not null;index" json:"county_name" binding:"required"`
    Address    string         `gorm:"size:255" json:"address" binding:"max=255"`
    Phone      string         `gorm:"size:20" json:"phone" binding:"max=20"`
    CreatedAt  time.Time      `json:"created_at"`
    UpdatedAt  time.Time      `json:"updated_at"`
    DeletedAt  gorm.DeletedAt `gorm:"index" json:"-"`
    Students   []Student      `gorm:"foreignKey:SchoolID" json:"students,omitempty"`
}
```

**TypeScript Type**:
```typescript
interface School {
  id: number
  name: string
  countyName: string
  address?: string
  phone?: string
  createdAt: string
  updatedAt: string
  students?: Student[]
}
```

---

### Student (學生)

代表一位學生，隸屬於某學校，是運動記錄的主體。

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | BIGINT UNSIGNED | PK, AUTO_INCREMENT | 主鍵 |
| school_id | BIGINT UNSIGNED | FK, NOT NULL, INDEX | 所屬學校 |
| student_number | VARCHAR(20) | NOT NULL | 學號 |
| name | VARCHAR(50) | NOT NULL, INDEX | 學生姓名 |
| grade | INT | NOT NULL | 年級 (1-12) |
| class | VARCHAR(20) | NULL | 班級 |
| gender | VARCHAR(10) | NOT NULL | 性別 (male/female) |
| birth_date | DATE | NULL | 出生日期 |
| created_at | TIMESTAMP | DEFAULT NOW() | 建立時間 |
| updated_at | TIMESTAMP | ON UPDATE NOW() | 更新時間 |
| deleted_at | TIMESTAMP | NULL, INDEX | 軟刪除時間 |

**Unique Constraint**: (school_id, student_number) - 學號在同一學校內唯一

**Relationships**:
- Belongs to School (N:1)
- Has many SportRecords (1:N)

**Validation Rules**:
- student_number: 1-20 characters, required, unique per school
- name: 1-50 characters, required
- grade: 1-12, required
- gender: "male" or "female", required
- birth_date: Valid date in past, optional

**Go Model**:
```go
type Student struct {
    ID            uint           `gorm:"primarykey" json:"id"`
    SchoolID      uint           `gorm:"not null;index" json:"school_id" binding:"required"`
    StudentNumber string         `gorm:"size:20;not null" json:"student_number" binding:"required,max=20"`
    Name          string         `gorm:"size:50;not null;index" json:"name" binding:"required,max=50"`
    Grade         int            `gorm:"not null" json:"grade" binding:"required,min=1,max=12"`
    Class         string         `gorm:"size:20" json:"class" binding:"max=20"`
    Gender        string         `gorm:"size:10;not null" json:"gender" binding:"required,oneof=male female"`
    BirthDate     *time.Time     `json:"birth_date"`
    CreatedAt     time.Time      `json:"created_at"`
    UpdatedAt     time.Time      `json:"updated_at"`
    DeletedAt     gorm.DeletedAt `gorm:"index" json:"-"`
    School        School         `gorm:"foreignKey:SchoolID" json:"school,omitempty"`
    SportRecords  []SportRecord  `gorm:"foreignKey:StudentID" json:"sport_records,omitempty"`
}
```

**TypeScript Type**:
```typescript
interface Student {
  id: number
  schoolId: number
  studentNumber: string
  name: string
  grade: number
  class?: string
  gender: 'male' | 'female'
  birthDate?: string
  createdAt: string
  updatedAt: string
  school?: School
  sportRecords?: SportRecord[]
}
```

---

### SportType (運動項目)

代表一種運動測驗項目，系統預設的 17 種項目。

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | BIGINT UNSIGNED | PK, AUTO_INCREMENT | 主鍵 |
| name | VARCHAR(50) | NOT NULL, UNIQUE | 項目名稱 |
| category | VARCHAR(20) | NOT NULL | 類別 (體適能/田徑/球類) |
| default_unit | VARCHAR(20) | NOT NULL | 預設單位 |
| value_type | VARCHAR(20) | NOT NULL | 數值類型 (time/distance/count/score) |

**Note**: This is seed data, not user-editable in MVP.

**Relationships**:
- Has many SportRecords (1:N)

**Go Model**:
```go
type SportType struct {
    ID          uint   `gorm:"primarykey" json:"id"`
    Name        string `gorm:"size:50;not null;uniqueIndex" json:"name"`
    Category    string `gorm:"size:20;not null" json:"category"`
    DefaultUnit string `gorm:"size:20;not null" json:"default_unit"`
    ValueType   string `gorm:"size:20;not null" json:"value_type"`
}
```

**TypeScript Type**:
```typescript
interface SportType {
  id: number
  name: string
  category: '體適能' | '田徑' | '球類'
  defaultUnit: string
  valueType: 'time' | 'distance' | 'count' | 'score'
}
```

**Seed Data** (17 items):

| Name | Category | Default Unit | Value Type |
|------|----------|--------------|------------|
| 800公尺 | 體適能 | 秒 | time |
| 1600公尺 | 體適能 | 秒 | time |
| 坐姿體前彎 | 體適能 | 公分 | distance |
| 1分鐘仰臥起坐 | 體適能 | 次 | count |
| 立定跳遠 | 體適能 | 公分 | distance |
| 1分鐘屈膝仰臥起坐 | 體適能 | 次 | count |
| 100公尺 | 田徑 | 秒 | time |
| 200公尺 | 田徑 | 秒 | time |
| 400公尺 | 田徑 | 秒 | time |
| 跳遠 | 田徑 | 公分 | distance |
| 跳高 | 田徑 | 公分 | distance |
| 鉛球 | 田徑 | 公尺 | distance |
| 壘球擲遠 | 田徑 | 公尺 | distance |
| 籃球運球 | 球類 | 秒 | time |
| 足球運球 | 球類 | 秒 | time |
| 排球墊球 | 球類 | 次 | count |
| 桌球正手擊球 | 球類 | 次 | count |

---

### SportRecord (運動記錄)

代表一筆運動測驗記錄，關聯學生和運動項目。

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | BIGINT UNSIGNED | PK, AUTO_INCREMENT | 主鍵 |
| student_id | BIGINT UNSIGNED | FK, NOT NULL, INDEX | 所屬學生 |
| sport_type_id | BIGINT UNSIGNED | FK, NOT NULL, INDEX | 運動項目 |
| value | DECIMAL(10,2) | NOT NULL | 測驗數值 |
| test_date | DATE | NOT NULL, INDEX | 測驗日期 |
| notes | VARCHAR(500) | NULL | 備註 |
| created_at | TIMESTAMP | DEFAULT NOW() | 建立時間 |
| updated_at | TIMESTAMP | ON UPDATE NOW() | 更新時間 |

**Relationships**:
- Belongs to Student (N:1)
- Belongs to SportType (N:1)
- Has many SportRecordAudits (1:N)

**Validation Rules**:
- value: Positive number, required
- test_date: Valid date, not in future, required
- notes: Max 500 characters, optional

**Go Model**:
```go
type SportRecord struct {
    ID          uint      `gorm:"primarykey" json:"id"`
    StudentID   uint      `gorm:"not null;index" json:"student_id" binding:"required"`
    SportTypeID uint      `gorm:"not null;index" json:"sport_type_id" binding:"required"`
    Value       float64   `gorm:"type:decimal(10,2);not null" json:"value" binding:"required,gt=0"`
    TestDate    time.Time `gorm:"type:date;not null;index" json:"test_date" binding:"required"`
    Notes       string    `gorm:"size:500" json:"notes" binding:"max=500"`
    CreatedAt   time.Time `json:"created_at"`
    UpdatedAt   time.Time `json:"updated_at"`
    Student     Student   `gorm:"foreignKey:StudentID" json:"student,omitempty"`
    SportType   SportType `gorm:"foreignKey:SportTypeID" json:"sport_type,omitempty"`
}
```

**TypeScript Type**:
```typescript
interface SportRecord {
  id: number
  studentId: number
  sportTypeId: number
  value: number
  testDate: string
  notes?: string
  createdAt: string
  updatedAt: string
  student?: Student
  sportType?: SportType
}
```

---

### SportRecordAudit (運動記錄修改歷史)

追蹤運動記錄的修改歷史。

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | BIGINT UNSIGNED | PK, AUTO_INCREMENT | 主鍵 |
| sport_record_id | BIGINT UNSIGNED | FK, NOT NULL, INDEX | 原始記錄 |
| old_value | DECIMAL(10,2) | NULL | 原始數值 |
| new_value | DECIMAL(10,2) | NULL | 新數值 |
| changed_by | BIGINT UNSIGNED | NOT NULL | 修改者 (User ID) |
| changed_at | TIMESTAMP | DEFAULT NOW() | 修改時間 |
| reason | VARCHAR(255) | NULL | 修改原因 |

**Relationships**:
- Belongs to SportRecord (N:1)

**Go Model**:
```go
type SportRecordAudit struct {
    ID            uint      `gorm:"primarykey" json:"id"`
    SportRecordID uint      `gorm:"not null;index" json:"sport_record_id"`
    OldValue      *float64  `gorm:"type:decimal(10,2)" json:"old_value"`
    NewValue      *float64  `gorm:"type:decimal(10,2)" json:"new_value"`
    ChangedBy     uint      `gorm:"not null" json:"changed_by"`
    ChangedAt     time.Time `json:"changed_at"`
    Reason        string    `gorm:"size:255" json:"reason"`
}
```

---

## Indexes

### Performance Indexes

| Table | Index Name | Columns | Purpose |
|-------|-----------|---------|---------|
| schools | idx_county_name | county_name | County statistics aggregation |
| schools | idx_deleted_at | deleted_at | Soft delete filtering |
| students | idx_school_student | school_id, student_number | Unique constraint + lookup |
| students | idx_name | name | Name search |
| students | idx_deleted_at | deleted_at | Soft delete filtering |
| sport_records | idx_student_sport | student_id, sport_type_id | Records by student and type |
| sport_records | idx_test_date | test_date | Records by date range |
| sport_record_audits | idx_record | sport_record_id | Audit history lookup |

---

## Migration Strategy

### GORM AutoMigrate Order

```go
func Migrate(db *gorm.DB) error {
    return db.AutoMigrate(
        &School{},
        &SportType{},
        &Student{},
        &SportRecord{},
        &SportRecordAudit{},
    )
}
```

### Seed Data

```go
func SeedSportTypes(db *gorm.DB) error {
    sportTypes := []SportType{
        {Name: "800公尺", Category: "體適能", DefaultUnit: "秒", ValueType: "time"},
        {Name: "1600公尺", Category: "體適能", DefaultUnit: "秒", ValueType: "time"},
        {Name: "坐姿體前彎", Category: "體適能", DefaultUnit: "公分", ValueType: "distance"},
        {Name: "1分鐘仰臥起坐", Category: "體適能", DefaultUnit: "次", ValueType: "count"},
        {Name: "立定跳遠", Category: "體適能", DefaultUnit: "公分", ValueType: "distance"},
        {Name: "1分鐘屈膝仰臥起坐", Category: "體適能", DefaultUnit: "次", ValueType: "count"},
        {Name: "100公尺", Category: "田徑", DefaultUnit: "秒", ValueType: "time"},
        {Name: "200公尺", Category: "田徑", DefaultUnit: "秒", ValueType: "time"},
        {Name: "400公尺", Category: "田徑", DefaultUnit: "秒", ValueType: "time"},
        {Name: "跳遠", Category: "田徑", DefaultUnit: "公分", ValueType: "distance"},
        {Name: "跳高", Category: "田徑", DefaultUnit: "公分", ValueType: "distance"},
        {Name: "鉛球", Category: "田徑", DefaultUnit: "公尺", ValueType: "distance"},
        {Name: "壘球擲遠", Category: "田徑", DefaultUnit: "公尺", ValueType: "distance"},
        {Name: "籃球運球", Category: "球類", DefaultUnit: "秒", ValueType: "time"},
        {Name: "足球運球", Category: "球類", DefaultUnit: "秒", ValueType: "time"},
        {Name: "排球墊球", Category: "球類", DefaultUnit: "次", ValueType: "count"},
        {Name: "桌球正手擊球", Category: "球類", DefaultUnit: "次", ValueType: "count"},
    }

    for _, st := range sportTypes {
        db.FirstOrCreate(&st, SportType{Name: st.Name})
    }
    return nil
}
```

---

## Query Patterns

### Common Queries

**List schools by county**:
```go
db.Where("county_name = ?", countyName).Find(&schools)
```

**List students by school with pagination**:
```go
db.Where("school_id = ?", schoolID).
    Offset((page-1)*pageSize).
    Limit(pageSize).
    Preload("School").
    Find(&students)
```

**Search students by name (fuzzy)**:
```go
db.Where("name LIKE ?", "%"+searchTerm+"%").Find(&students)
```

**Get student with all sport records**:
```go
db.Preload("SportRecords.SportType").
    Preload("School").
    First(&student, studentID)
```

**Get sport records by student and type**:
```go
db.Where("student_id = ? AND sport_type_id = ?", studentID, typeID).
    Order("test_date DESC").
    Find(&records)
```

**County statistics (for map integration)**:
```go
db.Raw(`
    SELECT
        s.county_name,
        COUNT(DISTINCT s.id) as school_count,
        COUNT(DISTINCT st.id) as student_count
    FROM schools s
    LEFT JOIN students st ON st.school_id = s.id AND st.deleted_at IS NULL
    WHERE s.deleted_at IS NULL
    GROUP BY s.county_name
`).Scan(&stats)
```
