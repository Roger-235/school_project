# Research: Taiwan Map Visualization

**Feature**: Taiwan Map Visualization
**Date**: 2025-11-14
**Phase**: 0 - Technology Research and Decision Documentation

## Purpose

Document technology choices, best practices, and implementation patterns for the map visualization feature. All decisions align with ACAP Constitution v1.0.0 technology stack requirements and build upon 001-user-auth foundation.

## Technology Stack Research

### Frontend: Leaflet.js for Map Rendering

**Decision**: Use Leaflet.js 1.9+ for interactive map visualization

**Rationale**:
- **Constitution Aligned**: Integrates well with Next.js 14 + TypeScript stack
- **Lightweight**: ~42KB gzipped, minimal bundle impact for MVP
- **Taiwan Map Support**: Excellent support for GeoJSON (Taiwan boundary data widely available)
- **Production Ready**: Battle-tested library (used by GitHub, European Space Agency, many gov't sites)
- **Simple API**: Easy to implement zoom, pan, popups without complex configuration
- **No API Keys Required**: Unlike Google Maps, Leaflet with OpenStreetMap is free and open

**Alternatives Considered**:
- **Google Maps API**: Requires API key and billing; overkill for simple county visualization
- **Mapbox**: More modern but adds complexity; Leaflet sufficient for MVP requirements
- **D3.js**: Powerful but steep learning curve; Leaflet easier for standard map interactions

**Implementation Pattern**:
```typescript
// Basic Leaflet integration with Next.js
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

// Initialize map with Taiwan center
const map = L.map('map').setView([23.5, 121], 7)

// Add tile layer (OpenStreetMap)
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map)

// Add GeoJSON layer with county boundaries
L.geoJSON(taiwanCountiesGeoJSON, {
  style: (feature) => ({
    fillColor: feature.properties.hasData ? '#22c55e' : '#9ca3af',
    weight: 1,
    color: '#fff'
  }),
  onEachFeature: (feature, layer) => {
    layer.on('click', () => fetchCountyStats(feature.properties.name))
  }
}).addTo(map)
```

### Map Data: Taiwan County GeoJSON

**Decision**: Use open Taiwan administrative boundary data in GeoJSON format

**Rationale**:
- **Open Data**: Taiwan government provides county/city boundary data via open data portal
- **Standard Format**: GeoJSON is natively supported by Leaflet.js
- **22 Counties**: Taiwan has 22 counties/cities; manageable file size (~200KB)
- **No Runtime API**: Static file served with frontend, no external dependencies

**Data Source Options**:
1. **Taiwan Government Open Data Platform**: Most authoritative, regularly updated
2. **Natural Earth Data**: Global dataset including Taiwan, but less detailed
3. **OpenStreetMap**: Can export Taiwan boundaries, good fallback

**Recommended**: Taiwan Government Open Data Platform (政府資料開放平臺)

**Data Structure** (GeoJSON properties needed):
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
        "coordinates": [[...]]
      }
    }
  ]
}
```

### Backend: County Statistics API

**Decision**: Go + Gin RESTful API with MySQL aggregation queries

**Rationale**:
- **Constitution Mandated**: Go 1.21+ with Gin framework locked choice
- **Efficient Aggregation**: MySQL COUNT() and GROUP BY for school/student counts
- **Simple Queries**: No complex joins needed for MVP county stats
- **Redis Caching**: 15-minute cache per constitution performance requirements

**API Endpoint Design**:
```
GET /api/v1/counties/statistics
GET /api/v1/counties/{countyName}/statistics
```

**Database Query Pattern** (using GORM):
```go
type CountyStats struct {
    CountyName    string
    SchoolCount   int
    StudentCount  int
}

// Aggregate query
db.Raw(`
    SELECT
        s.county_name,
        COUNT(DISTINCT s.id) as school_count,
        COUNT(st.id) as student_count
    FROM schools s
    LEFT JOIN students st ON st.school_id = s.id
    GROUP BY s.county_name
`).Scan(&stats)
```

### Caching Strategy: Redis

**Decision**: Use Redis ElastiCache (cache.t3.micro) for county statistics with 15-minute TTL

**Rationale**:
- **Constitution Specified**: Redis caching for 15 minutes to reduce 80% database queries
- **Simple Key-Value**: `county:stats:{countyName}` → JSON string
- **Read-Heavy Workload**: County stats don't change frequently; perfect caching candidate
- **MVP Infrastructure**: cache.t3.micro sufficient for <20 concurrent users

**Cache Implementation Pattern**:
```go
import "github.com/go-redis/redis/v8"

func GetCountyStats(countyName string) (*CountyStats, error) {
    // Try cache first
    cacheKey := fmt.Sprintf("county:stats:%s", countyName)
    cached, err := redisClient.Get(ctx, cacheKey).Result()
    if err == nil {
        var stats CountyStats
        json.Unmarshal([]byte(cached), &stats)
        return &stats, nil
    }

    // Cache miss: query database
    stats := queryCountyStats(countyName)

    // Store in cache (15 minutes = 900 seconds)
    json, _ := json.Marshal(stats)
    redisClient.Set(ctx, cacheKey, json, 900*time.Second)

    return stats, nil
}
```

### Frontend State Management: React Query + Context API

**Decision**: React Query for server state (county data), Context API for map UI state

**Rationale**:
- **Constitution Mandated**: React Query + Context API locked choice (NO Redux/MobX)
- **Perfect Fit**: React Query designed for API data fetching, caching, refetching
- **Context for UI**: Map zoom level, selected county stored in Context (not server data)
- **Automatic Refetching**: React Query handles stale data, retries, loading states

**Implementation Pattern**:
```typescript
// React Query for county statistics
const { data: stats, isLoading } = useQuery({
  queryKey: ['countyStats', countyName],
  queryFn: () => api.get(`/counties/${countyName}/statistics`),
  staleTime: 15 * 60 * 1000, // 15 minutes (matches Redis cache)
})

// Context for map state
interface MapContextType {
  selectedCounty: string | null
  setSelectedCounty: (county: string) => void
  mapZoom: number
  setMapZoom: (zoom: number) => void
}
```

### Component Structure: Next.js Pages Router

**Decision**: Pages Router with single `/map` page and reusable components

**Rationale**:
- **Constitution Mandated**: Next.js 14 Pages Router (NOT App Router)
- **Simple Navigation**: Single map page, no nested routing needed for MVP
- **Component Reusability**: Separate MapView, CountyPopup, MapControls components

**Folder Structure**:
```
frontend/src/
├── pages/
│   └── map.tsx                    # Main map page (protected route)
├── components/map/
│   ├── MapView.tsx                # Leaflet map container
│   ├── CountyPopup.tsx            # Statistics popup component
│   ├── MapControls.tsx            # Zoom/reset controls
│   └── CountyLayer.tsx            # GeoJSON layer with styling
├── hooks/
│   ├── useCountyStats.ts          # React Query hook for stats
│   └── useMapState.ts             # Map UI state management
├── lib/
│   └── leaflet-utils.ts           # Leaflet initialization helpers
└── data/
    └── taiwan-counties.geojson    # Static GeoJSON file
```

## Integration Patterns

### Authentication Integration

**Pattern**: Reuse authentication middleware from 001-user-auth feature

**Backend**:
```go
// In cmd/server/main.go
mapRoutes := router.Group("/api/v1")
mapRoutes.Use(auth.AuthMiddleware()) // Reuse from 001-user-auth
{
    mapRoutes.GET("/counties/statistics", mapHandler.GetAllCountyStats)
    mapRoutes.GET("/counties/:name/statistics", mapHandler.GetCountyStats)
}
```

**Frontend**:
```typescript
// In pages/map.tsx
import { ProtectedRoute } from '@/components/auth/ProtectedRoute' // Reuse from 001-user-auth

export default function MapPage() {
  return (
    <ProtectedRoute>
      <MapView />
    </ProtectedRoute>
  )
}
```

### Database Schema Integration

**Required Tables** (assume already exist from other features):
- `schools` table with `county_name` column
- `students` table with `school_id` foreign key

**New Requirements**: None for MVP (aggregation queries only)

**Migration Strategy**: No new tables; ensure `schools.county_name` indexed for performance

### API Response Format

**Decision**: Follow constitution-mandated consistent response format

**Success Response**:
```json
{
  "data": {
    "counties": [
      {
        "name": "臺北市",
        "school_count": 150,
        "student_count": 3200,
        "has_data": true
      }
    ]
  }
}
```

**Error Response**:
```json
{
  "error": {
    "code": "COUNTY_NOT_FOUND",
    "message": "County name not recognized",
    "status": 404
  }
}
```

## Performance Optimizations

### Frontend Optimizations

1. **GeoJSON Optimization**:
   - Simplify polygon coordinates (reduce precision if file too large)
   - Lazy-load GeoJSON (dynamic import, only load when map page accessed)

2. **Map Tile Caching**:
   - Use OpenStreetMap default tile caching (browser handles this)
   - Consider CDN for GeoJSON file (Vercel edge network)

3. **Component Memoization**:
   - Use `React.memo()` for `CountyPopup` to prevent re-renders
   - Memoize color calculation function

### Backend Optimizations

1. **Query Optimization**:
   - Add index on `schools.county_name` column
   - Use `LEFT JOIN` to handle counties with no schools gracefully
   - Consider materialized view if query becomes slow (unlikely in MVP)

2. **Redis Connection Pooling**:
   - Use single Redis client instance (not per-request)
   - Connection pooling handled by `go-redis` library

3. **Response Gzipping**:
   - Enable gzip middleware in Gin for large responses
   - County statistics JSON typically <2KB, but good practice

## Error Handling Strategy

### Frontend Error Handling

1. **Map Load Failure**:
   - Display error message: "Unable to load map. Please refresh page."
   - Fallback: Show county list in table format (FR-021 requirement)

2. **County Stats Fetch Failure**:
   - Show "Data temporarily unavailable" in popup
   - Retry button in popup (manual trigger)

3. **GeoJSON Load Failure**:
   - Critical error: Cannot render map
   - Redirect to error page with support contact

### Backend Error Handling

1. **Database Connection Failure**:
   - Return 503 Service Unavailable
   - Log error with context for monitoring

2. **Redis Connection Failure**:
   - Graceful degradation: Query database directly
   - Log warning (cache unavailable, performance impact)

3. **Invalid County Name**:
   - Return 404 with clear error message
   - Validate county name against known list (22 counties)

## Security Considerations

### Input Validation

1. **County Name Parameter**:
   - Whitelist validation: Check against known 22 county names
   - Prevent SQL injection: Use parameterized queries (GORM handles this)
   - Sanitize input: Trim whitespace, normalize case

2. **Authentication Token**:
   - Reuse JWT validation from 001-user-auth
   - No additional validation needed (already handled by middleware)

### Rate Limiting

**Decision**: Basic rate limiting on county statistics endpoint

**Pattern**:
```go
// Use gin-contrib/ratelimit
import "github.com/gin-contrib/ratelimit"

// Limit to 100 requests per minute per IP
limiter := ratelimit.NewRateLimiter(time.Minute, 100)
router.Use(ratelimit.RateLimiterMiddleware(limiter))
```

### Data Privacy

- **County-level aggregation only**: No individual student/school details exposed
- **Public knowledge**: County names and aggregate counts not sensitive
- **Authentication required**: Prevents public access to internal data

## Testing Strategy

### Frontend Testing

**Manual Testing** (documented in quickstart.md):
- Test map load on different screen sizes (≥1024x768)
- Test county click interactions (all 22 counties)
- Test zoom/pan operations
- Test authentication redirect (logout then access map)

**Automated Testing** (optional, can defer):
- Component tests for `CountyPopup` (using React Testing Library)
- Integration test for map page load

### Backend Testing

**Unit Tests**:
- Test county statistics aggregation function
- Test cache hit/miss logic
- Test county name validation

**Integration Tests**:
- Test `/counties/statistics` endpoint (authenticated)
- Test `/counties/{name}/statistics` endpoint
- Test cache expiration (15-minute TTL)

**Performance Testing**:
- Benchmark county stats query (<1 second per FR-003)
- Load test with 20 concurrent users (constitution requirement)

## Dependencies

### NPM Packages (Frontend)

```json
{
  "dependencies": {
    "leaflet": "^1.9.4",
    "react-leaflet": "^4.2.1",  // Optional: React bindings for Leaflet
    "@tanstack/react-query": "^5.28.4",  // Already in 001-user-auth
    "axios": "^1.6.8"  // Already in 001-user-auth
  },
  "devDependencies": {
    "@types/leaflet": "^1.9.8"
  }
}
```

**Total**: 2 new dependencies (leaflet, react-leaflet)

### Go Packages (Backend)

```go
require (
    github.com/gin-gonic/gin v1.9.1  // Already in 001-user-auth
    gorm.io/gorm v1.25.5  // Already in 001-user-auth
    github.com/go-redis/redis/v8 v8.11.5  // NEW for caching
)
```

**Total**: 1 new dependency (go-redis)

### External Data

- **Taiwan Counties GeoJSON**: Download from Taiwan Open Data Platform or prepare manually
- **Leaflet CSS**: Bundled with `leaflet` npm package
- **OpenStreetMap Tiles**: Free, no API key, CDN-hosted

## Risk Mitigation

| Risk | Mitigation |
|------|------------|
| GeoJSON file too large (slow load) | Simplify polygons, compress file, serve via CDN |
| Taiwan boundary data unavailable | Prepare fallback GeoJSON manually; many open sources available |
| Leaflet.js SSR issues with Next.js | Use dynamic import with `ssr: false` for Leaflet components |
| Redis unavailable | Graceful degradation: Query database directly (log warning) |
| County name inconsistencies | Normalize county names in database; maintain mapping table if needed |
| Mobile users accessing desktop-only page | Show message: "This feature is optimized for desktop. Mobile support coming soon." |

## Next Steps

Phase 0 research complete. All technology decisions documented and aligned with ACAP Constitution v1.0.0.

**Ready for Phase 1**: Generate data-model.md, contracts/, and quickstart.md based on this research.
