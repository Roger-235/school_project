# Data Model: Taiwan Map Visualization

**Feature**: Taiwan Map Visualization
**Date**: 2025-11-14
**Phase**: 1 - Data Model Design

## Overview

The map visualization feature does NOT introduce new database tables. It leverages existing data from the `schools` and `students` tables (assumed to be created by other features) and performs aggregation queries to generate county statistics.

The feature uses:
- **Read-only queries** on existing tables
- **Redis cache** for aggregated results (15-minute TTL)
- **Static GeoJSON file** for Taiwan county boundaries (not in database)

## Existing Entities (Read-Only Access)

### Entity: School

**Description**: Represents a school that participates in the student athlete program. Must have a `county_name` field for geographic aggregation.

**Assumed Schema** (from other features):

| Attribute | Type | Constraints | Description |
|-----------|------|-------------|-------------|
| id | BIGINT UNSIGNED | PRIMARY KEY, AUTO_INCREMENT | Unique identifier for the school |
| name | VARCHAR(255) | NOT NULL | School name |
| county_name | VARCHAR(50) | NOT NULL, INDEX | County/city where school is located (e.g., "臺北市", "新北市") |
| address | TEXT | NULL | Full school address |
| created_at | TIMESTAMP | NOT NULL, DEFAULT CURRENT_TIMESTAMP | When the school was added to system |
| updated_at | TIMESTAMP | NOT NULL, DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP | Last modification timestamp |

**Index Requirements**:
- **INDEX** on `county_name`: Critical for fast aggregation queries (GROUP BY county_name)
- Without this index, county statistics query will be slow (table scan)

**Validation Rules** (assumed):
- `county_name` must be one of the 22 valid Taiwan counties/cities
- Names should be normalized (e.g., all use "臺北市" not "台北市")

### Entity: Student

**Description**: Represents a student athlete enrolled in a school. Used to count total students per county.

**Assumed Schema** (from other features):

| Attribute | Type | Constraints | Description |
|-----------|------|-------------|-------------|
| id | BIGINT UNSIGNED | PRIMARY KEY, AUTO_INCREMENT | Unique identifier for the student |
| school_id | BIGINT UNSIGNED | NOT NULL, FOREIGN KEY → schools.id | Which school the student belongs to |
| name | VARCHAR(255) | NOT NULL | Student name |
| grade | INT | NOT NULL | Student grade level |
| created_at | TIMESTAMP | NOT NULL, DEFAULT CURRENT_TIMESTAMP | When the student was added to system |
| updated_at | TIMESTAMP | NOT NULL, DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP | Last modification timestamp |

**Index Requirements**:
- **FOREIGN KEY INDEX** on `school_id`: Already exists for referential integrity
- This enables efficient `JOIN schools.id = students.school_id`

## Non-Persisted Entity: County Statistics

### Description

Aggregated data for a specific county/city. **NOT stored in database**; calculated on-demand and cached in Redis.

### In-Memory Representation (Go)

```go
package models

type CountyStatistics struct {
    CountyName   string `json:"county_name"`   // County/city name (e.g., "臺北市")
    SchoolCount  int    `json:"school_count"`  // Number of schools in this county
    StudentCount int    `json:"student_count"` // Total number of students in this county
    HasData      bool   `json:"has_data"`      // True if school_count > 0
}

// For GET /api/v1/counties/statistics (all counties)
type AllCountyStatistics struct {
    Counties []CountyStatistics `json:"counties"`
    Total    int                `json:"total"` // Total number of counties
}
```

### TypeScript Type Definition (Frontend)

```typescript
export interface CountyStatistics {
  county_name: string       // County/city name
  school_count: number      // Number of schools
  student_count: number     // Total students
  has_data: boolean         // Whether county has any data
}

export interface AllCountyStatistics {
  counties: CountyStatistics[]
  total: number             // Total number of counties (22)
}
```

### Aggregation Query (SQL)

```sql
-- Get statistics for all counties
SELECT
    s.county_name,
    COUNT(DISTINCT s.id) as school_count,
    COUNT(st.id) as student_count,
    (COUNT(DISTINCT s.id) > 0) as has_data
FROM schools s
LEFT JOIN students st ON st.school_id = s.id
GROUP BY s.county_name;

-- Get statistics for a specific county
SELECT
    s.county_name,
    COUNT(DISTINCT s.id) as school_count,
    COUNT(st.id) as student_count,
    (COUNT(DISTINCT s.id) > 0) as has_data
FROM schools s
LEFT JOIN students st ON st.school_id = s.id
WHERE s.county_name = ?
GROUP BY s.county_name;
```

**Query Performance**:
- **With index on `county_name`**: O(log n) county lookup + O(m) for JOIN where m = schools in county
- **Expected time**: <100ms for typical county (<100 schools)
- **Worst case** (without index): O(n) table scan, not acceptable

### GORM Query Pattern (Go)

```go
func GetAllCountyStatistics(db *gorm.DB) ([]CountyStatistics, error) {
    var stats []CountyStatistics

    err := db.Table("schools").
        Select(`
            schools.county_name,
            COUNT(DISTINCT schools.id) as school_count,
            COUNT(students.id) as student_count,
            (COUNT(DISTINCT schools.id) > 0) as has_data
        `).
        Joins("LEFT JOIN students ON students.school_id = schools.id").
        Group("schools.county_name").
        Scan(&stats).Error

    return stats, err
}

func GetCountyStatistics(db *gorm.DB, countyName string) (*CountyStatistics, error) {
    var stats CountyStatistics

    err := db.Table("schools").
        Select(`
            schools.county_name,
            COUNT(DISTINCT schools.id) as school_count,
            COUNT(students.id) as student_count,
            (COUNT(DISTINCT schools.id) > 0) as has_data
        `).
        Joins("LEFT JOIN students ON students.school_id = schools.id").
        Where("schools.county_name = ?", countyName).
        Group("schools.county_name").
        Scan(&stats).Error

    if err != nil {
        return nil, err
    }

    // If no schools found, return empty stats
    if stats.CountyName == "" {
        stats.CountyName = countyName
        stats.SchoolCount = 0
        stats.StudentCount = 0
        stats.HasData = false
    }

    return &stats, nil
}
```

## Non-Persisted Entity: Taiwan County GeoJSON

### Description

Geographic boundary data for Taiwan's 22 counties/cities. Stored as a **static JSON file** in the frontend project, NOT in the database.

### File Location

```
frontend/public/data/taiwan-counties.geojson
```

### GeoJSON Structure

```json
{
  "type": "FeatureCollection",
  "features": [
    {
      "type": "Feature",
      "properties": {
        "COUNTYNAME": "臺北市",
        "COUNTYCODE": "63000",
        "COUNTYENG": "Taipei City"
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [[121.5, 25.0], [121.6, 25.0], [121.6, 25.1], [121.5, 25.1], [121.5, 25.0]]
        ]
      }
    }
  ]
}
```

**Properties Required**:
- `COUNTYNAME`: Chinese county name (must match `schools.county_name`)
- `COUNTYCODE`: Optional identifier
- `COUNTYENG`: English name (for internationalization, future)

**Geometry**:
- `type`: "Polygon" or "MultiPolygon" (some counties have islands)
- `coordinates`: Array of coordinate arrays (longitude, latitude pairs)

### Loading Pattern (Frontend)

```typescript
// Load GeoJSON dynamically
import taiwanCountiesGeoJSON from '@/data/taiwan-counties.geojson'

// Or fetch from public directory
const response = await fetch('/data/taiwan-counties.geojson')
const geoJSON = await response.json()
```

## Redis Cache Schema

### Cache Key Pattern

```
county:stats:{countyName}     # Individual county statistics
county:stats:all               # All counties statistics
```

**Examples**:
- `county:stats:臺北市` → `{"county_name":"臺北市","school_count":150,"student_count":3200,"has_data":true}`
- `county:stats:all` → `{"counties":[...],"total":22}`

### Cache Expiration

- **TTL**: 900 seconds (15 minutes)
- **Invalidation Strategy**: Time-based expiration only (no manual invalidation in MVP)
- **Refresh**: Browser page refresh queries database, then updates cache

### Redis Commands (Pseudo-code)

```go
// Set cache
redisClient.Set(ctx, "county:stats:臺北市", jsonString, 900*time.Second)

// Get cache
jsonString, err := redisClient.Get(ctx, "county:stats:臺北市").Result()

// Cache miss: err == redis.Nil
```

## Data Access Patterns

### Query Patterns

1. **Get All County Statistics** (for map initialization):
   ```
   Frequency: Every map page load (once per session)
   Cache Key: county:stats:all
   Database Query: Aggregation query on schools + students (GROUP BY county_name)
   Performance: <1 second for all 22 counties (target: <500ms)
   ```

2. **Get Single County Statistics** (for popup click):
   ```
   Frequency: Every county click (up to 22 clicks per session)
   Cache Key: county:stats:{countyName}
   Database Query: Aggregation query with WHERE county_name = ?
   Performance: <1 second per county (target: <200ms)
   ```

### Cache Hit Ratio

**Expected**:
- First page load: Cache miss (0% hit ratio) → Database query
- Subsequent loads within 15 min: Cache hit (100% hit ratio) → No database query
- After 15 min: Cache expired → Database query, cache refresh

**MVP Target**: 80% cache hit ratio (per constitution requirement)

## Data Integrity Constraints

### Application-Level Constraints

1. **County Name Validation**:
   - Must be one of the 22 valid Taiwan counties/cities
   - Validation list maintained in backend configuration
   - Invalid names return 404 error

2. **County Name Normalization**:
   - Ensure consistent spelling (e.g., "臺北市" not "台北市")
   - Normalize on data entry (schools table)
   - Case-sensitive matching

3. **Aggregation Accuracy**:
   - `school_count` uses `COUNT(DISTINCT schools.id)` to avoid duplicates
   - `student_count` uses `COUNT(students.id)` (NULL-safe)
   - `has_data` derived from `school_count > 0`

### Database-Level Constraints

**No new constraints needed**. Relies on existing constraints:
- `schools.id` PRIMARY KEY
- `students.school_id` FOREIGN KEY → `schools.id`
- `schools.county_name` NOT NULL

## Performance Considerations

### Query Optimization

1. **Index on `schools.county_name`**:
   ```sql
   CREATE INDEX idx_county_name ON schools(county_name);
   ```
   - **Critical for performance**: GROUP BY operation will use this index
   - Without index: Full table scan (slow as table grows)

2. **Foreign Key Index on `students.school_id`**:
   - Already exists for referential integrity
   - Enables efficient JOIN

3. **EXPLAIN Plan** (verify before deployment):
   ```sql
   EXPLAIN SELECT county_name, COUNT(DISTINCT id) FROM schools GROUP BY county_name;
   ```
   - Should show "Using index" (not "Using filesort")

### Cache Performance

- **Redis GET**: O(1) time complexity, ~1ms latency
- **Cache vs DB**: Cache is 100x faster than database query
- **Memory Usage**: ~2KB per county × 22 counties = ~44KB total (negligible)

### Estimated Load (MVP)

- **Total Schools**: <100 (5 schools × 20 counties, sparse data)
- **Total Students**: <2000 (5 schools × 20 counties × 20 students/school)
- **Query Time**: <50ms for aggregation (small dataset)
- **Cache Memory**: <100KB total (all county statistics)

**Conclusion**: Single `schools` and `students` tables on RDS t3.micro are vastly over-provisioned for MVP load.

## Migration Strategy

### No New Tables

**Decision**: No database migrations required for this feature.

**Assumptions**:
1. `schools` table already exists with `county_name` column
2. `students` table already exists with `school_id` foreign key
3. Index on `schools.county_name` will be added if missing

### Index Migration (if needed)

```sql
-- Check if index exists
SHOW INDEX FROM schools WHERE Key_name = 'idx_county_name';

-- Create index if missing (safe, can run multiple times)
CREATE INDEX IF NOT EXISTS idx_county_name ON schools(county_name);
```

**Migration Script** (Go):
```go
func EnsureIndexes(db *gorm.DB) error {
    // Check and create index on county_name
    sqlDB, _ := db.DB()
    _, err := sqlDB.Exec(`
        CREATE INDEX IF NOT EXISTS idx_county_name
        ON schools(county_name)
    `)
    return err
}
```

## Data Seeding (Optional, for Demo)

### Sample County Data

For MVP demonstration, seed sample data covering multiple counties:

```sql
-- Insert sample schools across different counties
INSERT INTO schools (name, county_name, address, created_at) VALUES
('臺北市立中山國小', '臺北市', '臺北市中山區...', NOW()),
('新北市立板橋國小', '新北市', '新北市板橋區...', NOW()),
('桃園市立中壢國小', '桃園市', '桃園市中壢區...', NOW()),
('臺中市立北屯國小', '臺中市', '臺中市北屯區...', NOW()),
('高雄市立鳳山國小', '高雄市', '高雄市鳳山區...', NOW());

-- Insert sample students for each school
INSERT INTO students (school_id, name, grade, created_at)
SELECT id, CONCAT('學生', FLOOR(RAND() * 100)), FLOOR(RAND() * 6) + 1, NOW()
FROM schools
LIMIT 50; -- 50 students total
```

**Goal**: Ensure at least 5 counties have data (green on map) for demo purposes.

## Security Considerations

### Data Exposure

- **County-level aggregation only**: No individual student/school details exposed
- **Read-only access**: Feature only performs SELECT queries, no INSERT/UPDATE/DELETE
- **Authentication required**: All endpoints protected by JWT middleware (from 001-user-auth)

### SQL Injection Prevention

- **Parameterized Queries**: GORM uses parameterized queries by default
- **No string concatenation**: County name passed as parameter, not concatenated into SQL

### Cache Poisoning Prevention

- **Key Validation**: County name validated before cache lookup
- **TTL Expiration**: Cache expires after 15 minutes, limiting stale data exposure

## Conclusion

The map visualization feature is read-only and aggregation-focused, requiring:
- **No new tables**: Uses existing `schools` and `students` tables
- **One critical index**: `schools.county_name` for performance
- **Redis cache**: 15-minute TTL for county statistics
- **Static GeoJSON**: Taiwan county boundaries served as frontend asset

This minimal data model aligns with MVP principles and constitution requirements.
