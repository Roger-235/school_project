# Feature Specification: School Map Markers with Detail Panel

**Feature Branch**: `006-school-map-markers`
**Created**: 2025-12-11
**Status**: Draft
**Input**: User description: "在地圖上顯示各個學校的詳細位置標記，點擊後可以直接看到學校的詳細資料和學生資料"

## User Scenarios & Testing

### User Story 1 - View School Locations on Map (Priority: P1)

Authenticated users need to see individual school locations marked on the Taiwan map. This provides geographic context for school distribution and enables users to locate specific schools by their position.

**Why this priority**: This is the foundation of the feature. Users must first see school markers before they can interact with them. It complements the existing county-level view with granular school-level information.

**Independent Test**: Can be fully tested by logging in, navigating to the map page, and observing school markers appear on the map. Success means seeing school markers clustered by location with school icons. Delivers geographic school distribution visualization.

**Acceptance Scenarios**:

1. **Given** a logged-in user, **When** they view the map page, **Then** they see school markers displayed at each school's geographic location
2. **Given** schools exist in the database with valid coordinates, **When** map loads, **Then** each school appears as a marker icon on the map
3. **Given** multiple schools are close together, **When** map is zoomed out, **Then** markers are clustered into numbered groups
4. **Given** clustered markers, **When** user clicks on the cluster, **Then** the map zooms in to reveal individual schools
5. **Given** a school without coordinates, **When** map loads, **Then** that school does not appear on the map (no error)

---

### User Story 2 - View School Details in Side Panel (Priority: P2)

Users need to see detailed school information when they click on a school marker. The side panel should display school details and student list without leaving the map view.

**Why this priority**: After seeing school locations (P1), the next natural action is to explore specific schools. Side panel provides seamless interaction while maintaining map context.

**Independent Test**: Can be tested by clicking on any school marker and verifying a side panel slides in from the right showing school name, address, phone, county, and student list. Delivers detailed school information access.

**Acceptance Scenarios**:

1. **Given** a school marker, **When** user clicks on the marker, **Then** a side panel slides in from the right side of the screen
2. **Given** the side panel is open, **When** loaded, **Then** it displays school name, address, phone number, county name, and student count
3. **Given** the side panel is open, **When** loaded, **Then** it displays a list of students showing name, grade, and class
4. **Given** the side panel is open, **When** user clicks on a student name, **Then** they are navigated to that student's detail page
5. **Given** the side panel is open, **When** user clicks outside the panel or the close button, **Then** the panel slides out and closes
6. **Given** the side panel is open for School A, **When** user clicks on School B marker, **Then** the panel updates to show School B details

---

### User Story 3 - Navigate from Side Panel (Priority: P3)

Users need quick access to related pages from the side panel, enabling them to manage school and student data without losing context of their map exploration.

**Why this priority**: Basic viewing (P1) and detail display (P2) are more critical. Navigation features enhance workflow but are not required for core map interaction.

**Independent Test**: Can be tested by clicking navigation buttons in the side panel and verifying correct page navigation. Delivers streamlined data management workflow.

**Acceptance Scenarios**:

1. **Given** the side panel is open, **When** user clicks "View School Details" button, **Then** they are navigated to `/schools/[id]` page
2. **Given** the side panel is open, **When** user clicks "Edit School" button, **Then** they are navigated to `/schools/[id]/edit` page
3. **Given** the side panel is open, **When** user clicks "Add Student" button, **Then** they are navigated to `/students/new?school_id=[id]` page
4. **Given** the side panel shows a student, **When** user clicks on student row, **Then** they are navigated to `/students/[studentId]` page

---

### Edge Cases

- **No schools have coordinates**: Display message "No school locations available" and only show county-level view
- **School marker at exact same location**: Clustering should handle this automatically
- **User clicks marker while panel is animating**: Debounce clicks to prevent glitches
- **School has no students**: Display "No students registered" in the student list section
- **Very long school name or address**: Truncate with ellipsis and show full text on hover
- **Side panel on small screens**: Panel takes full width on screens < 1280px
- **Network error loading school details**: Show error message with retry button in the panel

## Requirements

### Functional Requirements

**School Markers**:

- **FR-001**: System MUST display school markers on the map for all schools with valid latitude and longitude coordinates
- **FR-002**: System MUST use a custom school icon for markers that is visually distinct from other map elements
- **FR-003**: System MUST cluster nearby school markers when zoomed out, showing the count of schools in each cluster
- **FR-004**: System MUST expand clusters when clicked or when the map is zoomed in sufficiently
- **FR-005**: System MUST NOT display markers for schools without coordinates (silently skip)

**Side Panel Display**:

- **FR-006**: System MUST display a side panel sliding from the right when a school marker is clicked
- **FR-007**: Side panel MUST include: school name, address, phone number, county name, and total student count
- **FR-008**: Side panel MUST display a list of students showing: name, grade, and class
- **FR-009**: System MUST show loading indicator while fetching school details
- **FR-010**: System MUST allow only one side panel to be open at a time
- **FR-011**: Side panel MUST be closable by clicking outside, clicking close button, or pressing Escape key

**Navigation Links**:

- **FR-012**: Side panel MUST include a "View Details" button linking to school detail page
- **FR-013**: Side panel MUST include an "Edit School" button linking to school edit page
- **FR-014**: Side panel MUST include an "Add Student" button linking to student creation page with school pre-selected
- **FR-015**: Each student in the list MUST be clickable and navigate to student detail page

**Data Management**:

- **FR-016**: School model MUST include latitude and longitude fields (nullable float64)
- **FR-017**: System MUST provide an API endpoint to retrieve all schools with coordinates for map display
- **FR-018**: API MUST include student count in the map school data for performance
- **FR-019**: System MUST cache school map data to reduce database queries

**Coordinate Data**:

- **FR-020**: System MUST include pre-populated coordinate data for existing seed schools
- **FR-021**: School creation/edit forms MAY include latitude/longitude fields for manual entry (future enhancement)

### Key Entities

- **School** (extended): Add latitude (float64, nullable), longitude (float64, nullable) fields
  - Relationships: Existing relationships unchanged

- **SchoolMapData**: Lightweight school data for map display
  - Attributes: id, name, latitude, longitude, student_count, county_name
  - Used for efficient map marker rendering

- **SchoolMarkerCluster**: Visual grouping of nearby schools
  - Attributes: center coordinates, school count, school IDs
  - Generated client-side by clustering library

## Success Criteria

### Measurable Outcomes

- **SC-001**: School markers appear on map within 2 seconds of page load for up to 100 schools
- **SC-002**: Users can identify school locations at a glance by marker icons
- **SC-003**: Clicking a school marker opens side panel within 500ms (panel animation)
- **SC-004**: School details and student list load within 1 second in the side panel
- **SC-005**: 90% of users successfully navigate to a school's detail page from the side panel on first attempt
- **SC-006**: Marker clustering effectively reduces visual clutter (no overlapping markers when zoomed out)
- **SC-007**: Side panel navigation links correctly route to expected pages 100% of the time
- **SC-008**: Schools without coordinates do not cause errors or broken UI elements

## Assumptions

1. **Coordinate Data Availability**: School coordinates can be obtained through address geocoding or manual research
2. **Clustering Library**: Leaflet.markercluster library is suitable and performant for this use case
3. **School Count**: MVP targets up to 100 schools; larger datasets may require additional optimization
4. **Side Panel Width**: 400px width provides sufficient space for school details and student list
5. **Student List Pagination**: For MVP, display first 20 students with "View All" link; pagination deferred

## Dependencies

- **Feature 002-map-visualization**: Existing map infrastructure (MapView, CountyLayer, MapControls)
- **Feature 003-student-sports-data**: School and Student CRUD APIs
- **Feature 005-data-source-unification**: Backend API and database connection

## Security Considerations

- **Authentication**: All school map data endpoints require authentication
- **Data Access**: Only authenticated users can view school details and student lists
- **Rate Limiting**: School detail API should implement rate limiting

## Performance Considerations

- **Initial Load**: School markers should load asynchronously, not blocking county layer rendering
- **Clustering**: Client-side clustering to reduce DOM elements and improve performance
- **Caching**: School map data can be cached for 5 minutes (less than county statistics)
- **Lazy Loading**: Student list in side panel loads on demand, not with initial marker data

## Technical Approach

### Backend Changes

1. Add `latitude` and `longitude` fields to School model
2. Create `GET /api/v1/schools/map` endpoint returning schools with coordinates
3. Update seed data with school coordinates

### Frontend Changes

1. Create `SchoolMarkerLayer.tsx` component for rendering school markers
2. Create `SchoolDetailPanel.tsx` component for side panel
3. Create `useSchoolsForMap.ts` React Query hook
4. Update `map.tsx` to include school markers and side panel
5. Add marker clustering with `react-leaflet-cluster` library

### Data Model Changes

```go
// School model additions
Latitude  *float64 `gorm:"type:decimal(10,8)" json:"latitude"`
Longitude *float64 `gorm:"type:decimal(11,8)" json:"longitude"`
```

### API Response

```json
// GET /api/v1/schools/map
{
  "data": {
    "schools": [
      {
        "id": 1,
        "name": "某某國小",
        "latitude": 23.4567,
        "longitude": 120.1234,
        "student_count": 45,
        "county_name": "嘉義縣"
      }
    ],
    "total": 64
  }
}
```
