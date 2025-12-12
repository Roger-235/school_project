# Tasks: School Map Markers with Detail Panel

**Feature**: 006-school-map-markers
**Created**: 2025-12-11

## Phase 1: Backend - Data Model & API

### Task 1.1: Add Latitude/Longitude to School Model
- [ ] Modify `backend/internal/models/school.go`
  - Add `Latitude *float64` field with GORM tags
  - Add `Longitude *float64` field with GORM tags
- [ ] Create migration (auto-migrate via GORM)
- [ ] Update `CreateSchoolRequest` and `UpdateSchoolRequest` structs
- **Files**: `backend/internal/models/school.go`
- **Acceptance**: School table has latitude/longitude columns

### Task 1.2: Add SchoolMapData Struct
- [ ] Create `SchoolMapData` struct for lightweight map data
- [ ] Include: id, name, latitude, longitude, student_count, county_name
- **Files**: `backend/internal/models/school.go`
- **Acceptance**: Struct exists and can be used in API responses

### Task 1.3: Implement GetSchoolsForMap Service Method
- [ ] Add `ListForMap()` method to `SchoolService`
- [ ] Query schools with non-null coordinates
- [ ] Include student count via subquery
- [ ] Return `[]SchoolMapData`
- **Files**: `backend/internal/services/school_service.go`
- **Acceptance**: Service returns schools with coordinates and counts

### Task 1.4: Implement GetSchoolsForMap Handler
- [ ] Add `GetSchoolsForMap` handler method
- [ ] Route: `GET /api/v1/schools/map`
- [ ] Return JSON with schools array and total count
- **Files**: `backend/internal/handlers/school_handler.go`, `backend/cmd/server/main.go`
- **Acceptance**: API endpoint returns correct data

### Task 1.5: Prepare School Coordinates Data
- [ ] Research coordinates for 64 seed schools (南部原住民學校)
- [ ] Create coordinate mapping file/struct
- [ ] Update seed script to include coordinates
- **Files**: `backend/cmd/seed/main.go`
- **Acceptance**: Seed data includes latitude/longitude for all schools

---

## Phase 2: Frontend - Dependencies & Types

### Task 2.1: Install react-leaflet-cluster
- [ ] Install package: `npm install react-leaflet-cluster`
- [ ] Verify TypeScript types are available
- **Files**: `frontend/package.json`
- **Acceptance**: Package installed, no type errors

### Task 2.2: Add TypeScript Types
- [ ] Add `SchoolMapData` interface
- [ ] Add `SchoolDetailPanelProps` interface
- **Files**: `frontend/src/types/school.ts` (new or existing)
- **Acceptance**: Types defined and exported

---

## Phase 3: Frontend - Hooks

### Task 3.1: Create useSchoolsForMap Hook
- [ ] Create React Query hook for fetching map schools
- [ ] Configure staleTime (5 minutes)
- [ ] Handle loading and error states
- **Files**: `frontend/src/hooks/useSchoolsForMap.ts`
- **Acceptance**: Hook fetches and caches school map data

---

## Phase 4: Frontend - Components

### Task 4.1: Create SchoolMarkerLayer Component
- [ ] Create component that renders school markers on map
- [ ] Implement marker clustering with react-leaflet-cluster
- [ ] Create custom school marker icon (green with school symbol)
- [ ] Handle marker click events
- [ ] Only render markers for schools with coordinates
- **Files**: `frontend/src/components/map/SchoolMarkerLayer.tsx`
- **Acceptance**: Markers appear on map, cluster when zoomed out

### Task 4.2: Create SchoolDetailPanel Component
- [ ] Create sliding side panel component
- [ ] Display school info: name, address, phone, county
- [ ] Display student count
- [ ] Display student list (name, grade, class)
- [ ] Implement close button and outside click to close
- [ ] Add loading state while fetching
- **Files**: `frontend/src/components/map/SchoolDetailPanel.tsx`
- **Acceptance**: Panel slides in/out, shows correct data

### Task 4.3: Add Navigation Buttons to Panel
- [ ] Add "View Details" button → `/schools/[id]`
- [ ] Add "Edit School" button → `/schools/[id]/edit`
- [ ] Add "Add Student" button → `/students/new?school_id=[id]`
- [ ] Make student rows clickable → `/students/[studentId]`
- **Files**: `frontend/src/components/map/SchoolDetailPanel.tsx`
- **Acceptance**: All navigation buttons work correctly

### Task 4.4: Add Panel Styling
- [ ] Width: 400px (100% on small screens)
- [ ] Slide animation from right (300ms)
- [ ] Shadow and proper z-index
- [ ] Responsive design for < 1280px screens
- **Files**: `frontend/src/components/map/SchoolDetailPanel.tsx`
- **Acceptance**: Panel looks good and animates smoothly

---

## Phase 5: Integration

### Task 5.1: Update map.tsx Page
- [ ] Add selectedSchoolId state
- [ ] Fetch schools for map with useSchoolsForMap
- [ ] Render SchoolMarkerLayer inside MapView
- [ ] Render SchoolDetailPanel outside MapView
- [ ] Handle school marker click to open panel
- [ ] Handle panel close to clear selection
- **Files**: `frontend/src/pages/map.tsx`
- **Acceptance**: Full flow works: click marker → panel opens → close panel

### Task 5.2: Coordinate CountyPopup and SchoolDetailPanel
- [ ] When school panel opens, close county popup
- [ ] When county popup opens, close school panel
- [ ] Ensure only one info display is open at a time
- **Files**: `frontend/src/pages/map.tsx`
- **Acceptance**: No overlapping popups/panels

---

## Phase 6: Testing & Polish

### Task 6.1: Manual Testing
- [ ] Test marker display at different zoom levels
- [ ] Test clustering behavior
- [ ] Test panel open/close animations
- [ ] Test navigation links
- [ ] Test on different screen sizes
- **Acceptance**: All flows work as expected

### Task 6.2: Edge Case Handling
- [ ] School without coordinates (should not show marker)
- [ ] School without students (show "No students" message)
- [ ] API error handling (show error with retry)
- **Acceptance**: Edge cases handled gracefully

---

## Summary Checklist

### Backend (5 tasks)
- [ ] Task 1.1: Add Latitude/Longitude to School Model
- [ ] Task 1.2: Add SchoolMapData Struct
- [ ] Task 1.3: Implement GetSchoolsForMap Service Method
- [ ] Task 1.4: Implement GetSchoolsForMap Handler
- [ ] Task 1.5: Prepare School Coordinates Data

### Frontend Dependencies (2 tasks)
- [ ] Task 2.1: Install react-leaflet-cluster
- [ ] Task 2.2: Add TypeScript Types

### Frontend Hooks (1 task)
- [ ] Task 3.1: Create useSchoolsForMap Hook

### Frontend Components (4 tasks)
- [ ] Task 4.1: Create SchoolMarkerLayer Component
- [ ] Task 4.2: Create SchoolDetailPanel Component
- [ ] Task 4.3: Add Navigation Buttons to Panel
- [ ] Task 4.4: Add Panel Styling

### Integration (2 tasks)
- [ ] Task 5.1: Update map.tsx Page
- [ ] Task 5.2: Coordinate CountyPopup and SchoolDetailPanel

### Testing (2 tasks)
- [ ] Task 6.1: Manual Testing
- [ ] Task 6.2: Edge Case Handling

**Total: 16 tasks**
