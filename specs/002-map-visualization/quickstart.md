# Quickstart: Taiwan Map Visualization

**Feature**: Taiwan Map Visualization
**Prerequisites**: User authentication system (001-user-auth) must be completed
**Estimated Time**: 2-3 weeks development + testing

## Overview

This guide walks through implementing the Taiwan map visualization feature from scratch, including backend API, frontend map interface, and integration with the existing authentication system.

**What you'll build**:
- Interactive Taiwan map with county color coding (green = data, gray = no data)
- County statistics popup (school count, student count)
- Zoom, pan, and reset map controls
- Redis caching for performance

## Prerequisites

### Required

- ✅ **001-user-auth completed**: Authentication system functional (login, JWT middleware)
- ✅ **Go 1.21+** installed
- ✅ **Node.js 18+** installed
- ✅ **MySQL 8.0+** running
- ✅ **Redis** running (ElastiCache cache.t3.micro or local)

### Database Setup

Ensure `schools` table has `county_name` column with index:

```sql
-- Check if column exists
DESC schools;

-- Add column if missing
ALTER TABLE schools ADD COLUMN county_name VARCHAR(50) NOT NULL DEFAULT '';

-- Add index for performance (CRITICAL)
CREATE INDEX idx_county_name ON schools(county_name);

-- Verify index
SHOW INDEX FROM schools WHERE Key_name = 'idx_county_name';
```

### Sample Data (Optional, for Demo)

```sql
-- Insert sample schools across different counties
INSERT INTO schools (name, county_name, address, created_at) VALUES
('臺北市立中山國小', '臺北市', '臺北市中山區中山路123號', NOW()),
('新北市立板橋國小', '新北市', '新北市板橋區板橋路456號', NOW()),
('桃園市立中壢國小', '桃園市', '桃園市中壢區中壢路789號', NOW()),
('臺中市立北屯國小', '臺中市', '臺中市北屯區北屯路101號', NOW()),
('高雄市立鳳山國小', '高雄市', '高雄市鳳山區鳳山路202號', NOW());

-- Insert sample students (10 per school)
INSERT INTO students (school_id, name, grade, created_at)
SELECT s.id, CONCAT('學生', n), FLOOR(RAND() * 6) + 1, NOW()
FROM schools s
CROSS JOIN (SELECT 1 AS n UNION SELECT 2 UNION SELECT 3 UNION SELECT 4 UNION SELECT 5
            UNION SELECT 6 UNION SELECT 7 UNION SELECT 8 UNION SELECT 9 UNION SELECT 10) numbers;
```

### Download Taiwan GeoJSON

Download Taiwan county boundaries:

**Option 1 - Taiwan Open Data Platform** (recommended):
1. Visit: https://data.gov.tw
2. Search: "縣市界線"
3. Download GeoJSON format
4. Save as: `frontend/public/data/taiwan-counties.geojson`

**Option 2 - Manual**:
Create simplified GeoJSON with 22 counties (provided in this guide below)

## Phase 1: Backend Implementation

### Step 1.1: Install Go Dependencies

```bash
cd backend

# Install Redis client
go get github.com/go-redis/redis/v8@latest

# Verify dependencies
go mod tidy
```

### Step 1.2: Create County Statistics Model

Create `backend/internal/models/county_statistics.go`:

```go
package models

type CountyStatistics struct {
    CountyName   string `json:"county_name"`
    SchoolCount  int    `json:"school_count"`
    StudentCount int    `json:"student_count"`
    HasData      bool   `json:"has_data"`
}

type AllCountyStatistics struct {
    Counties []CountyStatistics `json:"counties"`
    Total    int                `json:"total"`
}
```

### Step 1.3: Setup Redis Connection

Create `backend/internal/database/redis.go`:

```go
package database

import (
    "context"
    "github.com/go-redis/redis/v8"
    "os"
)

var RedisClient *redis.Client
var ctx = context.Background()

func InitRedis() error {
    RedisClient = redis.NewClient(&redis.Options{
        Addr:     os.Getenv("REDIS_URL"),     // e.g., "localhost:6379"
        Password: os.Getenv("REDIS_PASSWORD"), // empty for local dev
        DB:       0,
    })

    // Test connection
    _, err := RedisClient.Ping(ctx).Result()
    return err
}
```

### Step 1.4: Create Map Service

Create `backend/internal/map/service.go`:

```go
package mapservice

import (
    "context"
    "encoding/json"
    "fmt"
    "time"

    "github.com/go-redis/redis/v8"
    "gorm.io/gorm"
    "your-project/internal/database"
    "your-project/internal/models"
)

var ctx = context.Background()

// GetAllCountyStatistics retrieves statistics for all counties
func GetAllCountyStatistics(db *gorm.DB) (*models.AllCountyStatistics, error) {
    // Try cache first
    cacheKey := "county:stats:all"
    cached, err := database.RedisClient.Get(ctx, cacheKey).Result()
    if err == nil {
        var stats models.AllCountyStatistics
        json.Unmarshal([]byte(cached), &stats)
        return &stats, nil
    }

    // Cache miss: query database
    var counties []models.CountyStatistics

    err = db.Table("schools").
        Select(`
            schools.county_name,
            COUNT(DISTINCT schools.id) as school_count,
            COUNT(students.id) as student_count,
            (COUNT(DISTINCT schools.id) > 0) as has_data
        `).
        Joins("LEFT JOIN students ON students.school_id = schools.id").
        Group("schools.county_name").
        Scan(&counties).Error

    if err != nil {
        return nil, err
    }

    result := &models.AllCountyStatistics{
        Counties: counties,
        Total:    len(counties),
    }

    // Store in cache (15 minutes = 900 seconds)
    jsonData, _ := json.Marshal(result)
    database.RedisClient.Set(ctx, cacheKey, jsonData, 900*time.Second)

    return result, nil
}

// GetCountyStatistics retrieves statistics for a specific county
func GetCountyStatistics(db *gorm.DB, countyName string) (*models.CountyStatistics, error) {
    // Try cache first
    cacheKey := fmt.Sprintf("county:stats:%s", countyName)
    cached, err := database.RedisClient.Get(ctx, cacheKey).Result()
    if err == nil {
        var stats models.CountyStatistics
        json.Unmarshal([]byte(cached), &stats)
        return &stats, nil
    }

    // Cache miss: query database
    var stats models.CountyStatistics

    err = db.Table("schools").
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
        stats = models.CountyStatistics{
            CountyName:   countyName,
            SchoolCount:  0,
            StudentCount: 0,
            HasData:      false,
        }
    }

    // Store in cache
    jsonData, _ := json.Marshal(stats)
    database.RedisClient.Set(ctx, cacheKey, jsonData, 900*time.Second)

    return &stats, nil
}

// ValidateCountyName checks if county name is valid
func ValidateCountyName(name string) bool {
    validCounties := []string{
        "臺北市", "新北市", "桃園市", "臺中市", "臺南市", "高雄市",
        "基隆市", "新竹市", "嘉義市",
        "新竹縣", "苗栗縣", "彰化縣", "南投縣", "雲林縣", "嘉義縣",
        "屏東縣", "宜蘭縣", "花蓮縣", "臺東縣", "澎湖縣", "金門縣", "連江縣",
    }

    for _, county := range validCounties {
        if county == name {
            return true
        }
    }
    return false
}
```

### Step 1.5: Create Map Handler

Create `backend/internal/map/handler.go`:

```go
package mapservice

import (
    "net/http"

    "github.com/gin-gonic/gin"
    "gorm.io/gorm"
)

type Handler struct {
    DB *gorm.DB
}

// GetAllCountyStatistics handles GET /api/v1/counties/statistics
func (h *Handler) GetAllCountyStatistics(c *gin.Context) {
    stats, err := GetAllCountyStatistics(h.DB)
    if err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{
            "error": gin.H{
                "code":    "INTERNAL_ERROR",
                "message": "Unable to retrieve county statistics",
                "status":  500,
            },
        })
        return
    }

    c.JSON(http.StatusOK, gin.H{"data": stats})
}

// GetCountyStatistics handles GET /api/v1/counties/:name/statistics
func (h *Handler) GetCountyStatistics(c *gin.Context) {
    countyName := c.Param("name")

    // Validate county name
    if countyName == "" {
        c.JSON(http.StatusBadRequest, gin.H{
            "error": gin.H{
                "code":    "VALIDATION_ERROR",
                "message": "County name must be a non-empty string",
                "status":  400,
            },
        })
        return
    }

    if !ValidateCountyName(countyName) {
        c.JSON(http.StatusNotFound, gin.H{
            "error": gin.H{
                "code":    "COUNTY_NOT_FOUND",
                "message": "County name not recognized. Must be one of the 22 Taiwan counties/cities.",
                "status":  404,
            },
        })
        return
    }

    stats, err := GetCountyStatistics(h.DB, countyName)
    if err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{
            "error": gin.H{
                "code":    "INTERNAL_ERROR",
                "message": "Unable to retrieve county statistics",
                "status":  500,
            },
        })
        return
    }

    c.JSON(http.StatusOK, gin.H{"data": stats})
}
```

### Step 1.6: Register Map Routes

Update `backend/cmd/server/main.go`:

```go
import (
    "your-project/internal/auth"
    mapservice "your-project/internal/map"
    "your-project/internal/database"
)

func main() {
    // ... existing setup ...

    // Initialize Redis
    if err := database.InitRedis(); err != nil {
        log.Fatal("Failed to connect to Redis:", err)
    }

    // Map routes (protected by auth middleware)
    mapHandler := &mapservice.Handler{DB: db}
    mapRoutes := router.Group("/api/v1")
    mapRoutes.Use(auth.AuthMiddleware()) // Reuse from 001-user-auth
    {
        mapRoutes.GET("/counties/statistics", mapHandler.GetAllCountyStatistics)
        mapRoutes.GET("/counties/:name/statistics", mapHandler.GetCountyStatistics)
    }

    // ... start server ...
}
```

### Step 1.7: Update .env

Add Redis configuration to `backend/.env`:

```env
# Existing variables...

# Redis Configuration
REDIS_URL=localhost:6379
REDIS_PASSWORD=
```

### Step 1.8: Test Backend

```bash
# Start backend
cd backend
go run cmd/server/main.go

# Test (in another terminal, after logging in to get token)
TOKEN="your-jwt-token-here"

# Get all county statistics
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:8080/api/v1/counties/statistics

# Get specific county
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:8080/api/v1/counties/臺北市/statistics
```

**Expected Response**:
```json
{
  "data": {
    "counties": [
      {
        "county_name": "臺北市",
        "school_count": 1,
        "student_count": 10,
        "has_data": true
      }
    ],
    "total": 1
  }
}
```

## Phase 2: Frontend Implementation

### Step 2.1: Install Frontend Dependencies

```bash
cd frontend

# Install Leaflet
npm install leaflet@^1.9.4 react-leaflet@^4.2.1

# Install Leaflet types
npm install --save-dev @types/leaflet@^1.9.8
```

### Step 2.2: Prepare Taiwan GeoJSON

Create `frontend/public/data/taiwan-counties.geojson` (simplified example):

```json
{
  "type": "FeatureCollection",
  "features": [
    {
      "type": "Feature",
      "properties": {
        "COUNTYNAME": "臺北市",
        "COUNTYCODE": "63000"
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [[121.45, 25.0], [121.65, 25.0], [121.65, 25.2], [121.45, 25.2], [121.45, 25.0]]
        ]
      }
    }
  ]
}
```

**Note**: Use actual Taiwan GeoJSON from Open Data Platform for production.

### Step 2.3: Create Map Types

Create `frontend/src/types/map.ts`:

```typescript
export interface CountyStatistics {
  county_name: string
  school_count: number
  student_count: number
  has_data: boolean
}

export interface AllCountyStatistics {
  counties: CountyStatistics[]
  total: number
}

export interface CountyFeature {
  type: 'Feature'
  properties: {
    COUNTYNAME: string
    COUNTYCODE: string
  }
  geometry: {
    type: 'Polygon' | 'MultiPolygon'
    coordinates: number[][][]
  }
}
```

### Step 2.4: Create Map Hook

Create `frontend/src/hooks/useCountyStats.ts`:

```typescript
import { useQuery } from '@tanstack/react-query'
import api from '@/lib/api'
import type { AllCountyStatistics, CountyStatistics } from '@/types/map'

export function useAllCountyStats() {
  return useQuery({
    queryKey: ['countyStats', 'all'],
    queryFn: async () => {
      const response = await api.get<{ data: AllCountyStatistics }>('/counties/statistics')
      return response.data.data
    },
    staleTime: 15 * 60 * 1000, // 15 minutes (matches Redis cache)
  })
}

export function useCountyStats(countyName: string | null) {
  return useQuery({
    queryKey: ['countyStats', countyName],
    queryFn: async () => {
      const response = await api.get<{ data: CountyStatistics }>(
        `/counties/${countyName}/statistics`
      )
      return response.data.data
    },
    enabled: !!countyName, // Only run if countyName is provided
    staleTime: 15 * 60 * 1000,
  })
}
```

### Step 2.5: Create Map Component

Create `frontend/src/components/map/MapView.tsx`:

```typescript
'use client'

import { useEffect, useRef, useState } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { useAllCountyStats } from '@/hooks/useCountyStats'
import taiwanCountiesGeoJSON from '@/data/taiwan-counties.geojson'

export default function MapView() {
  const mapRef = useRef<L.Map | null>(null)
  const [selectedCounty, setSelectedCounty] = useState<string | null>(null)
  const { data: stats, isLoading } = useAllCountyStats()

  useEffect(() => {
    // Initialize map only once
    if (!mapRef.current) {
      mapRef.current = L.map('map').setView([23.5, 121], 7)

      // Add tile layer
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
      }).addTo(mapRef.current)
    }

    // Add county layer when stats are loaded
    if (stats && mapRef.current) {
      const countyStatsMap = new Map(
        stats.counties.map((c) => [c.county_name, c])
      )

      L.geoJSON(taiwanCountiesGeoJSON as any, {
        style: (feature) => {
          const countyName = feature?.properties?.COUNTYNAME
          const countyStats = countyStatsMap.get(countyName)
          const hasData = countyStats?.has_data || false

          return {
            fillColor: hasData ? '#22c55e' : '#9ca3af', // green : gray
            weight: 1,
            color: '#fff',
            fillOpacity: 0.7,
          }
        },
        onEachFeature: (feature, layer) => {
          const countyName = feature.properties.COUNTYNAME

          // Add county name label
          layer.bindTooltip(countyName, {
            permanent: true,
            direction: 'center',
            className: 'county-label',
          })

          // Click handler
          layer.on('click', () => {
            setSelectedCounty(countyName)
          })
        },
      }).addTo(mapRef.current)
    }
  }, [stats])

  if (isLoading) {
    return <div className="flex items-center justify-center h-screen">Loading map...</div>
  }

  return (
    <div className="relative">
      <div id="map" style={{ height: '600px', width: '100%' }} />
      {selectedCounty && (
        <CountyPopup
          countyName={selectedCounty}
          onClose={() => setSelectedCounty(null)}
        />
      )}
    </div>
  )
}
```

### Step 2.6: Create County Popup

Create `frontend/src/components/map/CountyPopup.tsx`:

```typescript
import { useCountyStats } from '@/hooks/useCountyStats'

interface CountyPopupProps {
  countyName: string
  onClose: () => void
}

export default function CountyPopup({ countyName, onClose }: CountyPopupProps) {
  const { data: stats, isLoading } = useCountyStats(countyName)

  return (
    <div className="absolute top-4 right-4 bg-white rounded-lg shadow-lg p-4 min-w-[250px]">
      <div className="flex justify-between items-start mb-2">
        <h3 className="text-lg font-semibold">{countyName}</h3>
        <button
          onClick={onClose}
          className="text-gray-500 hover:text-gray-700"
        >
          ✕
        </button>
      </div>

      {isLoading && <p className="text-sm text-gray-500">Loading...</p>}

      {stats && (
        <div className="space-y-2">
          {stats.has_data ? (
            <>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">學校數:</span>
                <span className="text-sm font-medium">{stats.school_count}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">學童總數:</span>
                <span className="text-sm font-medium">{stats.student_count}</span>
              </div>
            </>
          ) : (
            <p className="text-sm text-gray-500">No data available</p>
          )}
        </div>
      )}
    </div>
  )
}
```

### Step 2.7: Create Map Page

Create `frontend/src/pages/map.tsx`:

```typescript
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import MapView from '@/components/map/MapView'

export default function MapPage() {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <nav className="bg-white shadow">
          <div className="max-w-7xl mx-auto px-4 py-4">
            <h1 className="text-2xl font-bold">全台地圖視覺化</h1>
          </div>
        </nav>

        <main className="max-w-7xl mx-auto px-4 py-6">
          <MapView />
        </main>
      </div>
    </ProtectedRoute>
  )
}
```

### Step 2.8: Add Leaflet CSS to _app.tsx

Update `frontend/src/pages/_app.tsx`:

```typescript
import '@/styles/globals.css'
import 'leaflet/dist/leaflet.css'
// ... rest of imports
```

### Step 2.9: Test Frontend

```bash
# Start frontend
cd frontend
npm run dev

# Navigate to http://localhost:3000/map (after logging in)
```

## Testing Guide

### Manual Test Scenarios

#### Test 1: Map Display
1. Log in to application
2. Navigate to `/map`
3. ✅ Verify: Taiwan map displays centered on screen
4. ✅ Verify: Counties with data are green
5. ✅ Verify: Counties without data are gray
6. ✅ Verify: County names are visible on map

#### Test 2: County Click
1. Click on a green county (has data)
2. ✅ Verify: Popup appears with county name, school count, student count
3. Click on a gray county (no data)
4. ✅ Verify: Popup appears with "No data available" message

#### Test 3: Map Navigation
1. Use mouse wheel to zoom in
2. ✅ Verify: Map zooms smoothly
3. Drag map to pan
4. ✅ Verify: Map pans smoothly
5. ✅ Verify: County colors remain after zoom/pan

#### Test 4: Authentication
1. Log out
2. Try to access `/map` directly
3. ✅ Verify: Redirected to login page
4. Log in
5. ✅ Verify: Redirected back to map page

#### Test 5: Performance
1. Open browser DevTools → Network tab
2. Load map page
3. ✅ Verify: Initial load <3 seconds
4. Click on a county
5. ✅ Verify: Statistics appear <1 second

### API Testing with curl

```bash
# Login first
curl -X POST http://localhost:8080/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"password"}' \
  | jq -r '.data.token'

# Save token
TOKEN="<your-token>"

# Test: Get all counties
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:8080/api/v1/counties/statistics | jq

# Test: Get specific county
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:8080/api/v1/counties/臺北市/statistics | jq

# Test: Invalid county (should return 404)
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:8080/api/v1/counties/InvalidCounty/statistics | jq

# Test: No auth (should return 401)
curl http://localhost:8080/api/v1/counties/statistics | jq
```

## Troubleshooting

### Issue: Map not displaying

**Solution**:
- Check browser console for errors
- Verify `taiwan-counties.geojson` exists in `frontend/public/data/`
- Check that Leaflet CSS is imported in `_app.tsx`

### Issue: Counties not colored

**Solution**:
- Verify county names in GeoJSON match database `county_name`
- Check API returns data: `curl http://localhost:8080/api/v1/counties/statistics`
- Check browser console for network errors

### Issue: Redis connection failed

**Solution**:
- Verify Redis is running: `redis-cli ping` (should return PONG)
- Check `REDIS_URL` in backend `.env`
- Backend will gracefully fall back to database if Redis unavailable

### Issue: Slow county statistics query

**Solution**:
- Verify index exists: `SHOW INDEX FROM schools WHERE Key_name = 'idx_county_name'`
- Run `EXPLAIN` on query to check index usage
- Add index if missing: `CREATE INDEX idx_county_name ON schools(county_name)`

## Next Steps

1. ✅ Verify all acceptance scenarios pass (see spec.md)
2. Add navigation link to map from dashboard
3. Consider adding legend (green = data, gray = no data)
4. Monitor Redis cache hit ratio in production
5. Update CLAUDE.md with Leaflet.js technology

**Congratulations!** Your Taiwan map visualization feature is now complete.

**Time to Demo**: ~2 hours (assuming prerequisites met)
**Total Development Time**: 2-3 weeks (including testing, polish)
