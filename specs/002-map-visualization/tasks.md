# Tasks: Taiwan Map Visualization

**Input**: Design documents from `/specs/002-map-visualization/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/map-api.yaml, quickstart.md

**Tests**: Manual testing per quickstart.md (automated tests optional for MVP)

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Web app**: `backend/` and `frontend/` at repository root
- Backend: `backend/cmd/server/`, `backend/internal/models/`, `backend/internal/services/`, `backend/internal/handlers/`, `backend/config/`
- Frontend: `frontend/src/pages/`, `frontend/src/components/`, `frontend/src/hooks/`, `frontend/src/lib/`, `frontend/src/types/`, `frontend/public/data/`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization, dependency installation, and basic configuration

- [X] T001 Install backend dependencies: add go-redis/redis/v8 to backend/go.mod
- [X] T002 [P] Install frontend dependencies: add leaflet@^1.9.4, react-leaflet@^4.2.1, @types/leaflet@^1.9.8 to frontend/package.json
- [X] T003 [P] Download Taiwan counties GeoJSON file and save to frontend/public/data/taiwan-counties.geojson
- [X] T004 [P] Create backend Redis configuration file at backend/config/redis.go
- [X] T005 [P] Add REDIS_URL and REDIS_PASSWORD to backend/.env and backend/.env.example
- [X] T006 [P] Add NEXT_PUBLIC_API_URL to frontend/.env.local
- [X] T007 Verify backend and frontend environment files are properly configured

**Checkpoint**: Dependencies installed, environment variables configured

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [X] T008 Create database index on schools.county_name: CREATE INDEX IF NOT EXISTS idx_county_name ON schools(county_name) (if not exists)
- [X] T009 [P] Initialize Redis client in backend/config/redis.go with connection pooling
- [X] T010 [P] Create CountyStatistics model struct in backend/internal/models/county.go with GORM tags
- [X] T011 [P] Create TypeScript interfaces for CountyStatistics and AllCountyStatistics in frontend/src/types/county.ts
- [X] T012 Create county name validation constants (22 valid Taiwan counties) in backend/internal/models/county.go
- [X] T013 Create CountyService struct with database and Redis client dependencies in backend/internal/services/county_service.go
- [X] T014 Create CountyHandler struct with service dependency in backend/internal/handlers/county_handler.go

**Checkpoint**: Foundation ready - database indexed, models created, services scaffolded, user story implementation can now begin

---

## Phase 3: User Story 1 - View Taiwan Map Overview (Priority: P1) 🎯 MVP

**Goal**: Display Taiwan map with counties colored by data availability (green = has data, gray = no data). Authenticated users can view the map page.

**Independent Test**: Log in and navigate to /map. Verify Taiwan map displays with counties colored green (has data) or gray (no data). County names are visible on map. Unauthenticated users are redirected to login.

### Backend Implementation for User Story 1

- [X] T015 [P] [US1] Implement GetAllCountyStatistics method in backend/internal/services/county_service.go with Redis caching (15-minute TTL)
- [X] T016 [P] [US1] Implement aggregation query for all counties using GORM in county_service.go (GROUP BY county_name, COUNT schools, COUNT students)
- [X] T017 [US1] Implement GET /api/v1/counties/statistics handler in backend/internal/handlers/county_handler.go
- [X] T018 [US1] Add authentication middleware to county routes in backend/cmd/server/main.go (reuse from 001-user-auth)
- [X] T019 [US1] Register GET /api/v1/counties/statistics route in backend/cmd/server/main.go
- [X] T020 [US1] Add error handling and logging for GetAllCountyStatistics endpoint in county_handler.go

### Frontend Implementation for User Story 1

- [X] T021 [P] [US1] Create useCountyStats React Query hook for fetching all counties in frontend/src/hooks/useCountyStats.ts
- [X] T022 [P] [US1] Create Leaflet utilities for map initialization in frontend/src/lib/leaflet-utils.ts
- [X] T023 [P] [US1] Create MapView component with Leaflet map container in frontend/src/components/map/MapView.tsx (use dynamic import with ssr: false)
- [X] T024 [P] [US1] Create CountyLayer component for GeoJSON rendering with color styling in frontend/src/components/map/CountyLayer.tsx
- [X] T025 [US1] Implement county color logic in CountyLayer.tsx (green if has_data=true, gray if has_data=false)
- [X] T026 [US1] Add county name labels to map in CountyLayer.tsx (display county_name property)
- [X] T027 [US1] Create map page at frontend/src/pages/map.tsx with ProtectedRoute wrapper (reuse from 001-user-auth)
- [X] T028 [US1] Import Leaflet CSS in map.tsx or _app.tsx (import 'leaflet/dist/leaflet.css')
- [X] T029 [US1] Integrate MapView and CountyLayer components in map.tsx
- [X] T030 [US1] Add loading state and error handling to map.tsx

**Checkpoint**: User Story 1 complete. Users can view Taiwan map with color-coded counties. Manual test: Login → Navigate to /map → Verify map displays with correct colors.

---

## Phase 4: User Story 2 - View County Statistics (Priority: P2)

**Goal**: Display county statistics (school count, student count) when user clicks on a county. Show popup with county name and statistics.

**Independent Test**: Click on any county on the map. Verify popup appears showing county name, school count, and student count. Counties without data show "No data available" message. Loading indicator appears while fetching data.

### Backend Implementation for User Story 2

- [X] T031 [P] [US2] Implement GetCountyStatistics method for single county in backend/internal/services/county_service.go with Redis caching
- [X] T032 [P] [US2] Implement aggregation query for single county using GORM in county_service.go (WHERE county_name = ?)
- [X] T033 [US2] Validate county name against 22-county whitelist in county_service.go
- [X] T034 [US2] Implement GET /api/v1/counties/{countyName}/statistics handler in backend/internal/handlers/county_handler.go
- [X] T035 [US2] Register GET /api/v1/counties/{countyName}/statistics route with auth middleware in backend/cmd/server/main.go
- [X] T036 [US2] Add error handling for invalid county names (404) and server errors (500) in county_handler.go

### Frontend Implementation for User Story 2

- [X] T037 [P] [US2] Extend useCountyStats hook to support single county fetching in frontend/src/hooks/useCountyStats.ts
- [X] T038 [P] [US2] Create CountyPopup component for displaying statistics in frontend/src/components/map/CountyPopup.tsx
- [X] T039 [US2] Add county click handler to CountyLayer component in CountyLayer.tsx
- [X] T040 [US2] Create map state context for selected county using Context API in frontend/src/hooks/useMapState.ts
- [X] T041 [US2] Implement popup open/close logic in MapView.tsx (Leaflet popup or custom React popup)
- [X] T042 [US2] Display county name, school count, student count in CountyPopup.tsx
- [X] T043 [US2] Add "No data available" message for counties with has_data=false in CountyPopup.tsx
- [X] T044 [US2] Add loading indicator while fetching county statistics in CountyPopup.tsx
- [X] T045 [US2] Implement popup close on outside click or escape key in MapView.tsx
- [X] T046 [US2] Update popup content when clicking different county (close previous, open new)

**Checkpoint**: User Story 2 complete. Users can click counties to view statistics. Manual test: Click multiple counties → Verify popup shows correct data → Test counties with/without data → Verify loading states.

---

## Phase 5: User Story 3 - Navigate and Explore Map (Priority: P3)

**Goal**: Enable map navigation through zoom in/out, pan, double-click zoom, and reset to default view. Ensure smooth navigation maintains county boundaries and colors.

**Independent Test**: Use zoom controls (buttons or mouse wheel) to zoom in/out. Drag map to pan. Double-click to zoom in on location. Click reset button to return to Taiwan-wide view. Verify county colors persist during all operations.

### Frontend Implementation for User Story 3

- [X] T047 [P] [US3] Create MapControls component with zoom in/out and reset buttons in frontend/src/components/map/MapControls.tsx
- [X] T048 [P] [US3] Add zoom state management to useMapState hook in frontend/src/hooks/useMapState.ts
- [X] T049 [US3] Implement zoom in/out button handlers in MapControls.tsx (call Leaflet map.zoomIn(), map.zoomOut())
- [X] T050 [US3] Implement reset/home button handler in MapControls.tsx (call map.setView([23.5, 121], 7))
- [X] T051 [US3] Enable mouse wheel zoom on Leaflet map in MapView.tsx (Leaflet default behavior via MAP_CONFIG)
- [X] T052 [US3] Enable map panning via drag in MapView.tsx (Leaflet default behavior via MAP_CONFIG)
- [X] T053 [US3] Enable double-click zoom in MapView.tsx (Leaflet default behavior via MAP_CONFIG)
- [X] T054 [US3] Integrate MapControls component into MapView.tsx
- [X] T055 [US3] Verify county colors persist after zoom/pan operations (test CountyLayer styling)

**Checkpoint**: User Story 3 complete. All navigation features work smoothly. Manual test: Zoom in → Zoom out → Pan map → Double-click → Reset → Verify colors maintain throughout.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Improvements, validation, and final touches that affect multiple user stories

- [X] T056 [P] Add desktop-only message for mobile users in frontend/src/pages/map.tsx (detect screen width < 1024px)
- [X] T057 [P] Optimize GeoJSON file size if needed (simplify polygons, compress file)
- [X] T058 [P] Add error fallback UI for map load failure in frontend/src/pages/map.tsx
- [X] T059 [P] Add graceful degradation for Redis unavailable (log warning, query database directly) in backend/internal/services/county_service.go
- [X] T060 [P] Verify all API responses follow consistent format ({data: {...}} or {error: {...}}) in backend/internal/handlers/county_handler.go
- [X] T061 [P] Add CORS configuration if needed in backend/cmd/server/main.go
- [X] T062 Verify county name normalization in database (all use "臺北市" not "台北市")
- [ ] T063 Run all quickstart.md manual testing scenarios (map load, authentication, caching, county clicks, navigation)
- [X] T064 [P] Code cleanup and remove console.log statements
- [X] T065 [P] Update CLAUDE.md with map visualization technology decisions (if needed)

**Checkpoint**: All polish tasks complete. Feature ready for production.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3-5)**: All depend on Foundational phase completion
  - User stories can then proceed in parallel (if staffed)
  - Or sequentially in priority order (P1 → P2 → P3)
- **Polish (Phase 6)**: Depends on all user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P2)**: Can start after Foundational (Phase 2) - Integrates with US1 map display but independently testable
- **User Story 3 (P3)**: Can start after Foundational (Phase 2) - Enhances US1 map but independently testable

### Within Each User Story

- Backend and frontend tasks can run in parallel
- Backend: Service implementation before handler, handler before route registration
- Frontend: Hooks and components can be built in parallel, then integrated into pages
- Each story should be complete and tested before moving to next priority

### Parallel Opportunities

- **Setup (Phase 1)**: T002, T003, T004, T005, T006 can all run in parallel
- **Foundational (Phase 2)**: T009, T010, T011 can run in parallel
- **User Story 1**: T015, T016 (backend), T021, T022, T023, T024 (frontend) can run in parallel before integration
- **User Story 2**: T031, T032, T033 (backend), T037, T038 (frontend) can run in parallel
- **User Story 3**: T047, T048 can run in parallel
- **Polish (Phase 6)**: T056, T057, T058, T059, T060, T061, T064, T065 can all run in parallel

---

## Parallel Example: User Story 1

```bash
# Backend tasks (can run in parallel):
Task T015: "Implement GetAllCountyStatistics method in backend/internal/services/county_service.go with Redis caching"
Task T016: "Implement aggregation query for all counties using GORM in county_service.go"

# Frontend tasks (can run in parallel):
Task T021: "Create useCountyStats React Query hook in frontend/src/hooks/useCountyStats.ts"
Task T022: "Create Leaflet utilities in frontend/src/lib/leaflet-utils.ts"
Task T023: "Create MapView component in frontend/src/components/map/MapView.tsx"
Task T024: "Create CountyLayer component in frontend/src/components/map/CountyLayer.tsx"

# Then integrate:
Task T017: "Implement GET /api/v1/counties/statistics handler"
Task T027: "Create map page at frontend/src/pages/map.tsx"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (T001-T007)
2. Complete Phase 2: Foundational (T008-T014) - CRITICAL - blocks all stories
3. Complete Phase 3: User Story 1 (T015-T030)
4. **STOP and VALIDATE**: Test User Story 1 independently
   - Login to application
   - Navigate to /map
   - Verify Taiwan map displays
   - Verify counties are colored correctly (green/gray)
   - Verify county names are visible
   - Verify authentication redirect for unauthenticated users
5. Deploy/demo if ready

### Incremental Delivery

1. **Complete Setup + Foundational** → Foundation ready
2. **Add User Story 1** → Test independently → Deploy/Demo (MVP: View Taiwan Map Overview)
3. **Add User Story 2** → Test independently → Deploy/Demo (Enhanced: Click counties for statistics)
4. **Add User Story 3** → Test independently → Deploy/Demo (Full Feature: Map navigation)
5. **Add Polish** → Final validation → Production ready
6. Each story adds value without breaking previous stories

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together (T001-T014)
2. Once Foundational is done:
   - **Developer A**: User Story 1 Backend (T015-T020)
   - **Developer B**: User Story 1 Frontend (T021-T030)
   - **Developer C**: User Story 2 Backend (T031-T036)
   - **Developer D**: User Story 2 Frontend (T037-T046)
3. Stories integrate and test independently
4. Continue with User Story 3 and Polish in parallel

---

## Manual Testing Scenarios (from quickstart.md)

### User Story 1: Map Overview
1. **Authentication Test**: Logout → Navigate to /map → Verify redirect to login → Login → Verify map loads
2. **Map Display Test**: Verify Taiwan map centered on screen at [23.5, 121] zoom level 7
3. **County Color Test**: Verify counties with data show green (#22c55e), counties without data show gray (#9ca3af)
4. **County Label Test**: Verify all 22 county names are visible on map
5. **Performance Test**: Map loads within 3 seconds on standard connection

### User Story 2: County Statistics
1. **Click Test**: Click county with data → Verify popup shows county name, school count, student count
2. **No Data Test**: Click county without data → Verify popup shows "No data available"
3. **Multiple Clicks**: Click county A → Click county B → Verify popup updates to county B statistics
4. **Loading Test**: Click county → Verify loading indicator appears briefly
5. **Close Test**: Click outside popup or press Escape → Verify popup closes
6. **Cache Test**: Click county twice within 15 minutes → Second click should be instant (Redis cache hit)

### User Story 3: Map Navigation
1. **Zoom In Test**: Click zoom-in button or scroll up → Verify map zooms in, counties remain colored
2. **Zoom Out Test**: Click zoom-out button or scroll down → Verify map zooms out
3. **Pan Test**: Drag map in any direction → Verify map pans smoothly
4. **Double-Click Test**: Double-click on location → Verify map zooms in on that location
5. **Reset Test**: Zoom/pan map → Click reset button → Verify map returns to Taiwan-wide view [23.5, 121] zoom 7
6. **Color Persistence Test**: After all navigation operations → Verify county colors remain correct

### Edge Cases
1. **No Data Scenario**: Clear all school data → Reload map → Verify all counties gray, message "No data available yet"
2. **Network Delay**: Throttle network → Click county → Verify loading indicator shows, timeout after 10 seconds
3. **Session Expiry**: Expire JWT token while on map page → Click county → Verify redirect to login with return URL
4. **Mobile Browser**: Access map on mobile device → Verify message "This feature is optimized for desktop"

---

## Notes

- **[P] tasks** = different files, no dependencies, can run in parallel
- **[Story] label** maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Automated tests are OPTIONAL for MVP (manual testing is sufficient per spec.md)
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- **Critical Dependencies**: Phase 2 (Foundational) BLOCKS all user stories
- **GeoJSON File**: Download from Taiwan Open Data Platform or use prepared file
- **Redis Caching**: 15-minute TTL aligns with React Query staleTime for optimal cache hit ratio
- **Authentication**: Reuse existing JWT middleware and ProtectedRoute from 001-user-auth

---

## Task Summary

- **Total Tasks**: 65 tasks
- **Setup (Phase 1)**: 7 tasks
- **Foundational (Phase 2)**: 7 tasks (BLOCKS all user stories)
- **User Story 1 (Phase 3)**: 16 tasks (Backend: 6, Frontend: 10)
- **User Story 2 (Phase 4)**: 16 tasks (Backend: 6, Frontend: 10)
- **User Story 3 (Phase 5)**: 9 tasks (Frontend only)
- **Polish (Phase 6)**: 10 tasks
- **Parallel Opportunities**: 25+ tasks marked [P] can run in parallel within their phase
- **Independent Test Criteria**: Each user story has clear test criteria for validation
- **Suggested MVP Scope**: User Story 1 only (16 implementation tasks + Setup + Foundational = ~30 tasks)
