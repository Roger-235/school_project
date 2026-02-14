# Feature Specification: Taiwan Map Visualization

**Feature Branch**: `002-map-visualization`
**Created**: 2025-11-14
**Status**: Draft
**Input**: User description: "開發全台地圖視覺化功能（MVP版）：
- 顯示台灣地圖（使用 Leaflet.js）
- 標示已登錄資料的縣市（使用顏色區分：綠色=有資料、灰色=無資料）
- 點擊縣市時顯示該縣市的基本統計（學校數、學童總數）
- 地圖可縮放、平移
- 需要整合認證系統（僅登入用戶可查看）

技術要求：
- 前端：Next.js 14 + TypeScript + Leaflet.js
- 後端：Go + Gin，提供 RESTful API 獲取縣市統計資料
- 資料庫：MySQL（查詢已有學童資料的縣市統計）
- 快取：Redis 快取縣市統計（15分鐘）

不包含：
- 即時更新（不需要 WebSocket）
- 動畫效果
- 複雜的地圖圖層
- 熱力圖"

## User Scenarios & Testing

### User Story 1 - View Taiwan Map Overview (Priority: P1)

Authenticated users need to see a visual overview of Taiwan with data coverage indicated by county/city colors. This provides an at-a-glance understanding of which regions have registered student athlete data.

**Why this priority**: This is the foundation of the map feature. Without the map display, users cannot interact with any geographic data. This delivers immediate visual value showing data distribution across Taiwan.

**Independent Test**: Can be fully tested by logging in and viewing the map page. Success means seeing Taiwan map with counties/cities colored based on data availability (green = has data, gray = no data). Delivers geographic data distribution visualization.

**Acceptance Scenarios**:

1. **Given** a logged-in user, **When** they navigate to the map page, **Then** they see Taiwan map centered on the screen
2. **Given** a county has registered student data, **When** map loads, **Then** that county is displayed in green color
3. **Given** a county has no registered student data, **When** map loads, **Then** that county is displayed in gray color
4. **Given** multiple counties with varying data, **When** map loads, **Then** each county displays the appropriate color based on data availability
5. **Given** an unauthenticated user, **When** they attempt to access the map page, **Then** they are redirected to login page

---

### User Story 2 - View County Statistics (Priority: P2)

Users need to see basic statistics for each county/city by clicking on the map. This allows them to quickly understand the number of schools and students in any geographic region.

**Why this priority**: After seeing the overview (P1), the next natural user action is to explore specific regions for detailed data. This enables data-driven decision making at the county level.

**Independent Test**: Can be tested by clicking on any county on the map and verifying a popup or panel appears showing school count and student count for that county. Delivers regional data insights.

**Acceptance Scenarios**:

1. **Given** a county with data, **When** user clicks on that county, **Then** a popup displays showing county name, number of schools, and total number of students
2. **Given** a county without data, **When** user clicks on that county, **Then** a popup displays showing county name and message indicating "No data available"
3. **Given** a county statistics popup is open, **When** user clicks on a different county, **Then** the popup updates to show the new county's statistics
4. **Given** a county statistics popup is open, **When** user clicks outside the popup or presses escape, **Then** the popup closes
5. **Given** the system is retrieving county data, **When** user clicks on a county, **Then** a loading indicator is displayed until data loads

---

### User Story 3 - Navigate and Explore Map (Priority: P3)

Users need to zoom in/out and pan the map to focus on specific regions or get a broader view. This enables detailed exploration of dense areas and overall national perspective.

**Why this priority**: Basic viewing (P1) and data access (P2) are more critical. Map navigation enhances user experience but is not required for core functionality. Users can still see all data without zooming/panning.

**Independent Test**: Can be tested by using zoom controls or mouse wheel to zoom in/out, and dragging the map to pan. Success means smooth navigation without losing county boundaries or colors. Delivers enhanced exploration capability.

**Acceptance Scenarios**:

1. **Given** the map is displayed, **When** user clicks the zoom-in button or scrolls up, **Then** the map zooms in centered on current view
2. **Given** the map is displayed, **When** user clicks the zoom-out button or scrolls down, **Then** the map zooms out centered on current view
3. **Given** the map is zoomed in, **When** user drags the map, **Then** the view pans to follow the drag direction
4. **Given** the map is zoomed, **When** user double-clicks on a location, **Then** the map zooms in centered on that location
5. **Given** the map is zoomed in, **When** user clicks a reset/home button, **Then** the map returns to default Taiwan-wide view

---

### Edge Cases

- **No data for any county**: What happens when the system is newly deployed with no student data? (Display: All counties in gray, message "No data available yet")
- **Extremely slow data loading**: How does system handle network delays for county statistics? (Display: Loading indicator for up to 10 seconds, then timeout message)
- **Invalid or missing county boundaries**: What if map data file is corrupted or incomplete? (Graceful error message, fallback to simple list view)
- **User loses authentication while viewing map**: What happens if session expires during map interaction? (Redirect to login with return URL to map page)
- **Partial data (only some counties)**: How is this visually represented? (Exactly as designed: green for data, gray for no data - clear visual distinction)
- **Very small screens (mobile)**: How does map display on small devices? (Decision: Desktop-only in MVP; mobile browser support deferred to future phase for faster delivery)

## Requirements

### Functional Requirements

**Map Display**:

- **FR-001**: System MUST display a geographic map of Taiwan with all county and city boundaries clearly visible
- **FR-002**: System MUST color-code each county/city based on data availability: green for counties with registered student data, gray for counties without data
- **FR-003**: System MUST load and display map on initial page view within 3 seconds on standard internet connection
- **FR-004**: System MUST maintain county color coding after zoom or pan operations
- **FR-005**: System MUST display county/city names permanently on the map for easy identification

**County Statistics**:

- **FR-006**: System MUST display county statistics when user clicks on a county/city region
- **FR-007**: County statistics popup MUST include: county/city name, number of schools, total number of students
- **FR-008**: System MUST display "No data available" message for counties without registered student data
- **FR-009**: System MUST show loading indicator while retrieving county statistics
- **FR-010**: System MUST allow only one county statistics popup to be open at a time

**Map Navigation**:

- **FR-011**: System MUST provide zoom in/out controls for map exploration
- **FR-012**: System MUST support panning (dragging) to move map view
- **FR-013**: System MUST provide a reset/home button to return to default Taiwan-wide view
- **FR-014**: System MUST preserve county color coding at all zoom levels

**Data Refresh**:

- **FR-015**: System MUST update statistics via manual browser page refresh (no dedicated refresh button in MVP)
- **FR-016**: System MUST display current data snapshot on page load

**Authentication Integration**:

- **FR-017**: System MUST require user authentication to access map visualization
- **FR-018**: System MUST redirect unauthenticated users attempting to access map to login page
- **FR-019**: System MUST preserve intended map page URL after login redirect for seamless navigation

**Data Accuracy**:

- **FR-020**: County statistics MUST reflect actual current data from the database
- **FR-021**: System MUST update county colors to reflect data availability changes on page refresh
- **FR-022**: System MUST handle counties with zero schools gracefully (display "0 schools" rather than error)

**Error Handling**:

- **FR-023**: System MUST display user-friendly error message if map data fails to load
- **FR-024**: System MUST provide fallback option to view data in list format if map cannot be displayed
- **FR-025**: System MUST log errors for troubleshooting without exposing technical details to users

**Explicitly Out of Scope** (MVP limitations):

- **FR-026**: System will NOT provide real-time data updates or auto-refresh functionality
- **FR-027**: System will NOT include animation effects for county color changes or popup displays
- **FR-028**: System will NOT support multiple map layers or overlays
- **FR-029**: System will NOT display heat maps or density visualizations
- **FR-030**: System will NOT support custom map styling or themes (standard map style only)
- **FR-031**: System will NOT support mobile browsers (desktop-only in MVP)

### Key Entities

- **County/City**: Geographic administrative region in Taiwan
  - Attributes: Name, geographic boundary coordinates, data availability status (boolean), school count, student count
  - Relationships: Contains multiple schools; belongs to Taiwan nation

- **County Statistics**: Aggregated data summary for a specific county/city
  - Attributes: County name, number of schools, total student count, last updated timestamp
  - Relationships: Associated with one county/city; calculated from school and student data

- **User Session**: Authenticated user accessing the map (leverages existing authentication system from User Auth feature)
  - Attributes: User ID, authentication status, session expiration
  - Relationships: Required to access map visualization

## Success Criteria

### Measurable Outcomes

- **SC-001**: Authenticated users can view Taiwan map with county color coding within 3 seconds of page load on standard internet connection
- **SC-002**: Users can identify which counties have registered student data at a glance by color distinction (green vs gray)
- **SC-003**: Users can view county statistics (school count, student count) by clicking on any county within 1 second
- **SC-004**: 90% of users successfully navigate to a specific county's statistics on their first attempt
- **SC-005**: Users can zoom and pan the map smoothly without losing county color information or boundary definitions
- **SC-006**: System displays accurate county statistics matching actual database counts (100% accuracy)
- **SC-007**: Unauthenticated users are prevented from accessing map page (100% redirect to login)
- **SC-008**: Users can return to default Taiwan view from any zoom/pan state in one click
- **SC-009**: System handles counties with zero data gracefully (no errors, clear "No data available" message)
- **SC-010**: Map page remains functional and navigable on desktop screens as small as 1024x768 pixels

## Assumptions

1. **Map Data Source**: Taiwan county/city boundary data (GeoJSON format) is available from open data sources or can be obtained for the project
2. **Data Refresh Frequency**: Manual page refresh is acceptable for MVP; users do not require real-time updates within their session
3. **Browser Compatibility**: Modern evergreen browsers (Chrome, Firefox, Safari, Edge latest versions) are the target; Internet Explorer is not supported
4. **Desktop-Only**: MVP targets desktop browsers only (minimum 1024x768 resolution); mobile browser support explicitly deferred to future phase for faster delivery
5. **Authentication Dependency**: User authentication system (feature 001-user-auth) is completed and functional before this feature begins development
6. **Initial Data**: At least some sample student/school data exists in the system for demonstration purposes (can be seed data)
7. **Network Assumption**: Users have stable internet connection (3G or better); offline mode not supported
8. **County Boundaries**: Taiwan has 22 counties/cities; this number is stable and map boundaries do not change during MVP period
9. **County Name Labels**: County/city names are permanently displayed on the map for easy navigation; users do not need to click to identify regions
10. **Manual Refresh**: Users will use browser refresh to update statistics; no dedicated refresh button in MVP to simplify implementation

## Dependencies

- **User Authentication System** (feature 001-user-auth): MUST be completed first; map feature relies on authentication middleware and user session management
- **Student and School Database**: Requires database schema for schools and students to be defined (even if not fully populated) to calculate county statistics
- **Taiwan Geographic Data**: Requires access to GeoJSON or similar format file defining Taiwan county/city boundaries for map rendering

## Security Considerations

- **Authentication Enforcement**: All map endpoints must verify user authentication; no geographic data should be accessible without valid session
- **Data Privacy**: County-level aggregated statistics are acceptable to display; individual student or school details must not be exposed on map popups
- **Rate Limiting**: County statistics API should implement basic rate limiting to prevent abuse or data scraping
- **Input Validation**: County identifiers (names or IDs) submitted via clicks must be validated against known county list to prevent injection attacks

## Performance Considerations

- **Initial Map Load**: Must render within 3 seconds on standard connection
- **County Statistics Fetch**: Should return within 1 second for typical counties (< 100 schools)
- **Zoom/Pan Responsiveness**: Map navigation should feel smooth with no perceptible lag (target < 100ms response)
- **Caching Strategy**: County statistics can be cached for 15 minutes to reduce database load (acceptable staleness for MVP)
- **Concurrent Users**: System should support at least 20 concurrent map viewers without performance degradation (aligns with MVP infrastructure)
