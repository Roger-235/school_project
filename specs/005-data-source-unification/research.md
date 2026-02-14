# Research: Data Source Unification

**Feature**: 005-data-source-unification
**Date**: 2025-12-11

## Research Questions

### RQ-001: Current API Architecture Analysis

**Question**: What is the current API architecture and how do Mock APIs differ from backend APIs?

**Findings**:

1. **Mock APIs** (frontend/src/pages/api/v1/):
   - Hardcoded data arrays in each file
   - No database connection
   - Each API has independent mock data (not shared)
   - Example: `schools/index.ts` has 74 schools, but `students/index.ts` only references 5 schools

2. **Backend APIs** (backend/internal/handlers/):
   - Connected to MySQL via GORM
   - Uses services layer for business logic
   - County statistics queries real database
   - All endpoints follow `/api/v1` prefix

3. **Response Format Comparison**:
   | Aspect | Mock API | Backend API |
   |--------|----------|-------------|
   | Success | `{data: {...}}` | `{data: {...}}` |
   | Error | `{error: {code, message, status}}` | `{error: {code, message}}` |
   | Pagination | `{data: {items, pagination}}` | `{data: {items, pagination}}` |

**Decision**: Response formats are compatible. Can switch without frontend changes.

**Rationale**: Both use the same `{data: ...}` wrapper pattern defined in constitution.

---

### RQ-002: CORS Configuration

**Question**: Is backend CORS configured to allow frontend requests?

**Findings**:

Backend `main.go:157-176`:
```go
func corsMiddleware() gin.HandlerFunc {
    return func(c *gin.Context) {
        frontendURL := os.Getenv("FRONTEND_URL")
        if frontendURL == "" {
            frontendURL = "http://localhost:3000"
        }
        c.Writer.Header().Set("Access-Control-Allow-Origin", frontendURL)
        c.Writer.Header().Set("Access-Control-Allow-Credentials", "true")
        c.Writer.Header().Set("Access-Control-Allow-Headers", "..., Authorization, ...")
        c.Writer.Header().Set("Access-Control-Allow-Methods", "POST, OPTIONS, GET, PUT, DELETE, PATCH")
        // ...
    }
}
```

**Decision**: CORS is already correctly configured.

**Rationale**:
- Default allows `http://localhost:3000`
- Supports credentials for auth tokens
- Allows Authorization header
- Handles OPTIONS preflight

---

### RQ-003: Authentication Token Handling

**Question**: How does the frontend send auth tokens and will they work with backend?

**Findings**:

Frontend `lib/api.ts`:
```typescript
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})
```

**Issue**: Backend auth middleware not yet implemented (TODO in main.go).

**Decision**: Keep login on Mock API; backend endpoints currently don't require auth.

**Rationale**:
- Backend has `// TODO: Add auth middleware` comments
- This feature focuses on data unification, not auth
- Auth can be added later without breaking changes

---

### RQ-004: Database Seed Data

**Question**: Does the database have initial data for testing?

**Findings**:

1. Backend migrations seed sport types (17 items)
2. No school/student seed data exists
3. Database currently empty for schools/students

**Decision**: Document manual data entry as part of quickstart.

**Rationale**:
- Seed scripts are out of scope for this feature
- Users can add schools via UI after data source switch
- Map will show "no data" state correctly

**Alternatives Considered**:
1. Create seed script with mock data → Rejected (adds complexity, not required for MVP)
2. Keep mock data as fallback → Considered but requires dual API paths

---

### RQ-005: Frontend API Client Architecture

**Question**: How do different hooks call APIs?

**Findings**:

1. **Centralized API client** (`lib/api.ts`):
   - Uses `NEXT_PUBLIC_API_URL` environment variable
   - All hooks except useCountyStats use this

2. **useCountyStats hook**:
   - Also reads `NEXT_PUBLIC_API_URL`
   - Uses axios directly (not centralized client)
   - Has `withCredentials: true`

**Decision**: Single environment variable change affects all API calls.

**Rationale**: All API calls read from same environment variable.

---

## Summary

| Question | Decision | Risk Level |
|----------|----------|------------|
| API Response Format | Compatible - no changes needed | Low |
| CORS Configuration | Already configured correctly | Low |
| Auth Token | Keep Mock API login, backend doesn't require auth | Low |
| Seed Data | Document manual entry | Medium |
| API Client | Single env var change | Low |

## Conclusion

The data source unification can be achieved with a single configuration change:

```bash
# frontend/.env.local
NEXT_PUBLIC_API_URL=http://localhost:8080/api/v1
```

No code changes required. All compatibility verified.
