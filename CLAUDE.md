# ACAP Development Guidelines

Auto-generated from all feature plans. Last updated: 2025-12-01

## Active Technologies
- TypeScript 5.x with Next.js 14 (Pages Router) + React 18, Next.js 14, MainLayout component, Header component, Breadcrumb component (004-navigation-enhancement)
- N/A (純前端重構，無資料庫變更) (004-navigation-enhancement)
- Go 1.21+ (backend), TypeScript/Next.js 14 (frontend) + Gin, GORM, Axios, React Query (005-data-source-unification)
- MySQL 8.0+ (005-data-source-unification)
- Go 1.21+ (backend), TypeScript 5.x with Next.js 14 Pages Router (frontend) + Gin (routing), GORM (ORM), excelize (Excel parsing), React Hook Form + Zod (form validation), React Query (data fetching) (007-excel-batch-import)
- MySQL 8.0+ (existing database with students, sport_records, sport_types tables) (007-excel-batch-import)

- Go 1.21+ (backend), TypeScript with Next.js 14 Pages Router (frontend) (001-user-auth)
- Leaflet.js 1.9.4 + React-Leaflet 4.2.1 for map visualization (002-map-visualization)
- Redis for county statistics caching with 15-minute TTL (002-map-visualization)
- React Query v5 for data fetching and client-side caching (002-map-visualization)
- GORM models for School, Student, SportType, SportRecord entities (003-student-sports-data)
- Soft delete pattern with gorm.DeletedAt for data integrity (003-student-sports-data)
- React Hook Form + Zod for form validation (003-student-sports-data)

## Project Structure

```text
backend/
├── internal/
│   ├── models/         # GORM models (user, school, student, sport_type, sport_record)
│   ├── services/       # Business logic
│   ├── handlers/       # HTTP handlers
│   └── middleware/     # Auth middleware
frontend/
├── src/
│   ├── components/     # React components (auth, map, schools, students, records)
│   ├── pages/          # Next.js pages
│   ├── hooks/          # React Query hooks
│   └── lib/            # API clients, utilities
tests/
specs/                  # Feature specifications
├── 001-user-auth/
├── 002-map-visualization/
└── 003-student-sports-data/
```

## Commands

```bash
# Frontend
cd frontend && npm run dev

# Backend (requires MySQL and Redis)
cd backend && go run cmd/server/main.go

# Start database services (Docker required)
docker-compose up -d mysql redis

# Run tests
npm test; npm run lint
```

## Development Setup

```bash
# 1. Start MySQL and Redis using Docker
docker-compose up -d

# 2. Configure backend environment
cp backend/.env.example backend/.env
# Edit .env with your database credentials

# 3. Start backend (auto-runs migrations)
cd backend && go run cmd/server/main.go

# 4. Start frontend
cd frontend && npm run dev
```

## Code Style

Go 1.21+ (backend), TypeScript with Next.js 14 Pages Router (frontend): Follow standard conventions

## Key Entities (003-student-sports-data)

- **School**: id, name, county_name (22 Taiwan counties), address, phone
- **Student**: id, school_id (FK), student_number (unique per school), name, grade, class, gender, birth_date
- **SportType**: id, name, category (體適能/田徑/球類), default_unit, value_type (17 predefined items)
- **SportRecord**: id, student_id (FK), sport_type_id (FK), value, test_date, notes

## API Endpoints (003-student-sports-data)

- `GET/POST /api/v1/schools` - List/Create schools
- `GET/PUT/DELETE /api/v1/schools/:id` - Get/Update/Delete school
- `GET /api/v1/schools/:id/students` - List students by school
- `GET/POST /api/v1/students` - Search/Create students
- `GET/PUT/DELETE /api/v1/students/:id` - Get/Update/Delete student
- `GET /api/v1/students/:id/records` - List records by student
- `GET /api/v1/sport-types` - List sport types
- `POST /api/v1/sport-records` - Create sport record
- `GET/PUT/DELETE /api/v1/sport-records/:id` - Get/Update/Delete record
- `GET /api/v1/sport-records/:id/history` - Get audit history
- `GET /api/v1/sport-records/progress` - Get student progress/regress analysis
- `GET /api/v1/sport-records/ranking` - Get school ranking for sport type
- `GET /api/v1/sport-records/trend` - Get student performance trend

## Recent Changes
- 007-excel-batch-import: Added Go 1.21+ (backend), TypeScript 5.x with Next.js 14 Pages Router (frontend) + Gin (routing), GORM (ORM), excelize (Excel parsing), React Hook Form + Zod (form validation), React Query (data fetching)
- 005-data-source-unification: Added Go 1.21+ (backend), TypeScript/Next.js 14 (frontend) + Gin, GORM, Axios, React Query
- 004-navigation-enhancement: Added TypeScript 5.x with Next.js 14 (Pages Router) + React 18, Next.js 14, MainLayout component, Header component, Breadcrumb component


<!-- MANUAL ADDITIONS START -->
<!-- MANUAL ADDITIONS END -->
