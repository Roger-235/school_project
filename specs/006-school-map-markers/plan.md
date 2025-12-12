# Technical Plan: School Map Markers with Detail Panel

**Feature**: 006-school-map-markers
**Created**: 2025-12-11
**Status**: Draft

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           Map Page (map.tsx)                            │
├─────────────────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────┐  ┌──────────────────────────┐ │
│  │           MapView                   │  │   SchoolDetailPanel      │ │
│  │  ┌─────────────────────────────┐   │  │  ┌────────────────────┐  │ │
│  │  │      CountyLayer            │   │  │  │   School Info      │  │ │
│  │  │   (existing counties)       │   │  │  │   - Name           │  │ │
│  │  └─────────────────────────────┘   │  │  │   - Address        │  │ │
│  │  ┌─────────────────────────────┐   │  │  │   - Phone          │  │ │
│  │  │   SchoolMarkerLayer (NEW)   │   │  │  │   - County         │  │ │
│  │  │   - Marker clusters         │   │──▶│  └────────────────────┘  │ │
│  │  │   - Individual markers      │   │  │  ┌────────────────────┐  │ │
│  │  └─────────────────────────────┘   │  │  │   Student List     │  │ │
│  │  ┌─────────────────────────────┐   │  │  │   - Name, Grade    │  │ │
│  │  │      MapControls            │   │  │  │   - Click to nav   │  │ │
│  │  │   (existing controls)       │   │  │  └────────────────────┘  │ │
│  │  └─────────────────────────────┘   │  │  ┌────────────────────┐  │ │
│  └─────────────────────────────────────┘  │  │   Action Buttons   │  │ │
│                                           │  │   - View, Edit     │  │ │
│                                           │  │   - Add Student    │  │ │
│                                           │  └────────────────────┘  │ │
│                                           └──────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────┘
```

## Backend Changes

### 1. Database Model Changes

**File**: `backend/internal/models/school.go`

```go
type School struct {
    // ... existing fields ...
    Latitude  *float64 `gorm:"type:decimal(10,8)" json:"latitude"`
    Longitude *float64 `gorm:"type:decimal(11,8)" json:"longitude"`
}

// SchoolMapData - lightweight struct for map display
type SchoolMapData struct {
    ID           uint    `json:"id"`
    Name         string  `json:"name"`
    Latitude     float64 `json:"latitude"`
    Longitude    float64 `json:"longitude"`
    StudentCount int     `json:"student_count"`
    CountyName   string  `json:"county_name"`
}
```

### 2. New API Endpoint

**File**: `backend/internal/handlers/school_handler.go`

```go
// GetSchoolsForMap returns schools with coordinates for map display
// GET /api/v1/schools/map
func (h *SchoolHandler) GetSchoolsForMap(c *gin.Context) {
    // Returns only schools with non-null coordinates
    // Includes student count for each school
}
```

**File**: `backend/internal/services/school_service.go`

```go
// ListForMap retrieves schools with coordinates for map display
func (s *SchoolService) ListForMap() ([]models.SchoolMapData, error) {
    // SELECT id, name, latitude, longitude, county_name,
    //        (SELECT COUNT(*) FROM students WHERE school_id = schools.id) as student_count
    // FROM schools
    // WHERE latitude IS NOT NULL AND longitude IS NOT NULL
}
```

### 3. Seed Data Update

**File**: `backend/cmd/seed/main.go`

Update existing school seed data with actual coordinates. Schools to update:
- 高雄市: 那瑪夏區、桃源區、茂林區、甲仙區 schools
- 屏東縣: 三地門鄉、霧臺鄉、瑪家鄉、泰武鄉、來義鄉、春日鄉、獅子鄉、牡丹鄉、滿州鄉 schools
- 臺南市: 南化區、楠西區、白河區 schools
- 嘉義縣: 阿里山鄉、番路鄉、竹崎鄉 schools
- 嘉義市: 各學校

## Frontend Changes

### 1. New Components

#### SchoolMarkerLayer.tsx
```typescript
// frontend/src/components/map/SchoolMarkerLayer.tsx
interface SchoolMarkerLayerProps {
    map: LeafletMap;
    schools: SchoolMapData[];
    onSchoolClick: (school: SchoolMapData) => void;
}
// Uses react-leaflet-cluster for marker clustering
// Custom school icon (green marker with school symbol)
```

#### SchoolDetailPanel.tsx
```typescript
// frontend/src/components/map/SchoolDetailPanel.tsx
interface SchoolDetailPanelProps {
    schoolId: number | null;
    isOpen: boolean;
    onClose: () => void;
}
// Slides in from right
// Fetches full school details with students on open
// Navigation buttons to school/student pages
```

### 2. New Hooks

#### useSchoolsForMap.ts
```typescript
// frontend/src/hooks/useSchoolsForMap.ts
export function useSchoolsForMap() {
    return useQuery({
        queryKey: ['schools', 'map'],
        queryFn: fetchSchoolsForMap,
        staleTime: 5 * 60 * 1000, // 5 minutes
    });
}
```

### 3. Updated Pages

#### map.tsx
```typescript
// Add state for selected school
const [selectedSchoolId, setSelectedSchoolId] = useState<number | null>(null);

// Add SchoolMarkerLayer and SchoolDetailPanel to render
<SchoolMarkerLayer
    map={map}
    schools={schoolsForMap}
    onSchoolClick={(school) => setSelectedSchoolId(school.id)}
/>
<SchoolDetailPanel
    schoolId={selectedSchoolId}
    isOpen={selectedSchoolId !== null}
    onClose={() => setSelectedSchoolId(null)}
/>
```

### 4. New Dependencies

```json
// frontend/package.json
{
    "dependencies": {
        "react-leaflet-cluster": "^2.1.0"
    }
}
```

## API Design

### GET /api/v1/schools/map

**Request**: No parameters

**Response**:
```json
{
    "data": {
        "schools": [
            {
                "id": 1,
                "name": "那瑪夏國民中學",
                "latitude": 23.2847,
                "longitude": 120.7033,
                "student_count": 45,
                "county_name": "高雄市"
            }
        ],
        "total": 64
    }
}
```

### GET /api/v1/schools/:id (existing, with students)

Used by SchoolDetailPanel to fetch full details including student list.

## Component Hierarchy

```
map.tsx
├── MainLayout
├── MapView
│   ├── CountyLayer (existing)
│   ├── SchoolMarkerLayer (NEW)
│   │   └── MarkerClusterGroup
│   │       └── Marker (for each school)
│   └── MapControls (existing)
├── CountyPopup (existing)
└── SchoolDetailPanel (NEW)
    ├── School Info Section
    ├── Student List Section
    │   └── StudentListItem (clickable)
    └── Action Buttons
```

## State Management

```typescript
// map.tsx state additions
const [selectedSchoolId, setSelectedSchoolId] = useState<number | null>(null);

// Interaction flow:
// 1. User clicks school marker
// 2. SchoolMarkerLayer calls onSchoolClick(school)
// 3. map.tsx sets selectedSchoolId
// 4. SchoolDetailPanel opens and fetches school details
// 5. User clicks close/outside
// 6. setSelectedSchoolId(null)
// 7. Panel closes
```

## Styling Approach

### Side Panel
- Width: 400px (or 100% on screens < 1280px)
- Animation: slide-in from right (300ms)
- Shadow: large drop shadow for depth
- Z-index: above map but below modals

### School Markers
- Custom icon: green circle with white school icon (SVG)
- Size: 32x32px
- Cluster icon: green circle with white number

## Error Handling

1. **Schools API fails**: Show toast notification, county layer still works
2. **School detail API fails**: Show error message in panel with retry button
3. **No schools with coordinates**: Don't render SchoolMarkerLayer, no error shown

## Testing Strategy

### Unit Tests
- SchoolMarkerLayer renders correct number of markers
- SchoolDetailPanel displays school info correctly
- Navigation buttons link to correct URLs

### Integration Tests
- Click marker opens panel with correct school
- Panel updates when clicking different marker
- Close panel works via button and outside click

### E2E Tests
- Full flow: Load map → Click marker → View details → Navigate to school page
