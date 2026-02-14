# ICACP AI Coding Assistant Instructions

## Project Overview
ICACP (Integrated Children's Athletic Capacity Platform) is a comprehensive system for managing children's physical education data in Taiwan. It handles school management, student records, athletic performance tracking, and geographic visualization across Taiwan's 22 counties.

**Tech Stack:**
- **Backend:** Go 1.24+ with Gin web framework, GORM ORM, MySQL 8.0, Redis 7.x
- **Frontend:** Next.js 14 (Pages Router), React 18, TypeScript 5.x, Tailwind CSS
- **Maps:** Leaflet.js with React-Leaflet for Taiwan county visualization
- **State Management:** React Query (TanStack Query) v5 for server state
- **Forms:** React Hook Form + Zod validation
- **Charts:** Recharts for performance analytics

## Architecture Patterns

### Backend Structure
- **Clean Architecture:** `handlers/` (HTTP layer) → `services/` (business logic) → `models/` (data layer)
- **Dependency Injection:** Handlers receive services, services receive `*gorm.DB`
- **Soft Deletes:** All models use `gorm.DeletedAt` for data integrity
- **Raw SQL Queries:** Complex joins and aggregations use `db.Raw()` instead of GORM associations

### Model Conventions
```go
type School struct {
    ID         uint           `gorm:"primarykey" json:"id"`
    Name       string         `gorm:"size:100;not null" json:"name" binding:"required,max=100"`
    CountyName string         `gorm:"size:50;not null;index" json:"county_name" binding:"required"`
    // ... standard fields
    CreatedAt  time.Time      `json:"created_at"`
    UpdatedAt  time.Time      `json:"updated_at"`
    DeletedAt  gorm.DeletedAt `gorm:"index" json:"-"`
}
```

### Service Patterns
```go
type SchoolService struct {
    db *gorm.DB
}

func NewSchoolService(db *gorm.DB) *SchoolService {
    return &SchoolService{db: db}
}

func (s *SchoolService) List(page, pageSize int) ([]models.School, *models.Pagination, error) {
    // Business logic with Raw SQL for complex queries
}
```

### Handler Patterns
```go
type SchoolHandler struct {
    service *services.SchoolService
}

func NewSchoolHandler(service *services.SchoolService) *SchoolHandler {
    return &SchoolHandler{service: service}
}

func (h *SchoolHandler) List(c *gin.Context) {
    // HTTP handling with error responses
    h.sendErrorResponse(c, http.StatusInternalServerError, "INTERNAL_ERROR", "無法取得學校資料")
}
```

## Development Workflow

### Local Setup
```bash
# Start databases
docker-compose up -d mysql redis

# Backend
cd backend && go run cmd/server/main.go

# Frontend (separate terminal)
cd frontend && npm run dev
```

### Key Commands
- **Full stack:** `docker-compose up -d` (includes mysql, redis, backend, frontend)
- **Database only:** `docker-compose up -d mysql redis`
- **Rebuild containers:** `docker-compose up -d --build`
- **Clean shutdown:** `docker-compose down -v`

### Environment Variables
- Copy `backend/.env.example` to `backend/.env`
- Database: `DATABASE_URL=user:pass@tcp(host:port)/db?charset=utf8mb4&parseTime=True&loc=Local`
- Redis: `REDIS_URL=redis:6379`

## Domain-Specific Patterns

### Taiwan Localization
- **Counties:** Fixed 22 Taiwan counties (e.g., "台北市", "新北市") - use `CountyName` field
- **Student Identification:** `StudentNumber` unique per school (座號)
- **Sport Types:** 17 predefined athletic categories (體適能, 田徑, 球類) with units and value types

### Data Relationships
- **School → Students:** One-to-many, soft delete cascade
- **Student → SportRecords:** One-to-many with audit trail
- **SportType:** Reference table for athletic categories

### API Response Format
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

## Frontend Patterns

### Component Structure
- **Pages Router:** `/pages` directory for routing
- **API Client:** Axios with interceptors in `/lib`
- **React Query:** Custom hooks in `/hooks` for data fetching
- **Forms:** React Hook Form + Zod schemas for validation

### Map Integration
- **Leaflet Setup:** Use `react-leaflet` with marker clustering
- **Taiwan Bounds:** Coordinate system for island visualization
- **School Markers:** Display with student counts and county grouping

### State Management
- **Server State:** React Query for API data
- **Local State:** React hooks for UI state
- **Form State:** React Hook Form for complex forms

## Common Pitfalls

### Backend
- **GORM Associations:** Avoid lazy loading; use Raw SQL for complex queries
- **Soft Deletes:** Always include `deleted_at IS NULL` in WHERE clauses
- **Time Zones:** Use `loc=Local` in database connections
- **Error Handling:** Use structured error responses with error codes

### Frontend
- **React Query Keys:** Use descriptive arrays like `['schools', 'list', page]`
- **Map Re-rendering:** Memoize Leaflet components to prevent recreation
- **Form Validation:** Define Zod schemas matching backend binding tags

### Database
- **Character Set:** Always use `utf8mb4` for Chinese text
- **Indexes:** Add indexes for frequently queried fields (e.g., `county_name`)
- **Migrations:** Use GORM auto-migration in development

## File Organization Reference

### Backend Key Files
- `backend/internal/models/` - GORM models with relationships
- `backend/internal/services/` - Business logic layer
- `backend/internal/handlers/` - HTTP request handlers
- `backend/cmd/server/main.go` - Application entry point
- `backend/config/redis.go` - Redis configuration

### Frontend Key Files
- `frontend/src/pages/` - Next.js pages and API routes
- `frontend/src/components/` - Reusable React components
- `frontend/src/hooks/` - React Query data fetching hooks
- `frontend/src/lib/` - API clients and utilities
- `frontend/src/types/` - TypeScript type definitions

### Configuration Files
- `docker-compose.yml` - Multi-service container setup
- `backend/go.mod` - Go dependencies
- `frontend/package.json` - Node.js dependencies
- `docs/` - Architecture, API, and database documentation