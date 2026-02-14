# Research: User Authentication System (MVP)

**Feature**: User Authentication System (MVP)
**Date**: 2025-11-14
**Phase**: 0 - Technology Research and Decision Documentation

## Purpose

Document technology choices, best practices, and implementation patterns for the authentication feature. All decisions align with ACAP Constitution v1.0.0 technology stack requirements.

## Technology Stack Research

### Backend: Go 1.21+ with Gin Framework

**Decision**: Use Go 1.21+ with Gin web framework and GORM ORM

**Rationale**:
- **Constitution Mandated**: Go 1.21+, Gin, and GORM are locked choices per Constitution Principle III
- **Performance**: Go's lightweight goroutines handle concurrent authentication requests efficiently on 0.25 vCPU ECS Fargate
- **Simplicity**: Gin provides minimalist routing with good documentation; GORM simplifies database operations
- **Deployment**: Single binary compilation makes Docker container deployment straightforward

**Alternatives Considered**: None - constitution locks this choice

**Best Practices Applied**:
- Use `internal/` directory pattern to prevent accidental package exposure
- Separate handler/service/model layers for testability
- Environment-based configuration loading (12-factor app principles)

### Password Hashing: bcrypt

**Decision**: Use Go's `golang.org/x/crypto/bcrypt` package with cost factor 10

**Rationale**:
- **Industry Standard**: bcrypt is proven secure for password hashing (20+ year track record)
- **Adaptive**: Cost factor can be increased over time as CPU power grows
- **Timing Attack Resistant**: Constant-time comparison prevents timing attacks
- **Built-in Salt**: Automatic salt generation per password

**Alternatives Considered**:
- **Argon2**: More modern but bcrypt is simpler and adequate for MVP; Go bcrypt library is stdlib-adjacent (golang.org/x/crypto)
- **PBKDF2**: Older standard, bcrypt provides better protection against GPU attacks

**Implementation Details**:
- Cost factor 10: ~50-100ms per hash (acceptable for <20 concurrent users)
- Store bcrypt output (60-character string) directly in database VARCHAR(60)
- Use `bcrypt.CompareHashAndPassword()` for constant-time comparison

**Code Pattern**:
```go
// Hash password on registration
hashedPassword, err := bcrypt.GenerateFromPassword([]byte(password), 10)

// Validate password on login
err := bcrypt.CompareHashAndPassword([]byte(hashedPassword), []byte(password))
```

### JWT Token Management: jwt-go (golang-jwt/jwt)

**Decision**: Use `github.com/golang-jwt/jwt/v5` for JWT token generation and validation

**Rationale**:
- **Stateless Authentication**: No server-side session storage needed; scales easily
- **24h Expiration**: Balances security (limits window for stolen tokens) with UX (users don't re-login daily)
- **Role-based Access**: JWT payload includes user role for authorization checks
- **Standard**: RFC 7519 compliant, interoperable with frontend libraries

**Alternatives Considered**:
- **Session cookies**: Requires server-side storage (Redis); JWT is simpler for MVP
- **Opaque tokens**: Would require DB lookup on every request; JWT validates cryptographically

**Implementation Details**:
- **Algorithm**: HS256 (HMAC-SHA256) - symmetric signing, simpler for MVP (no public/private key management)
- **Secret Key**: Load from environment variable `JWT_SECRET` (min 32 characters)
- **Payload**:
  ```json
  {
    "sub": "user_id",
    "email": "user@example.com",
    "role": "admin|school_staff",
    "exp": 1699987200,  // Unix timestamp (24h from issuance)
    "iat": 1699900800   // Issued at timestamp
  }
  ```
- **Validation**: Check signature, expiration, and required claims on every protected endpoint

**Security Considerations**:
- Store JWT in httpOnly cookie (CSRF protection needed) or localStorage (XSS risk - rely on CSP)
- Set short expiration (24h) to limit stolen token window
- No token revocation in MVP (would require server-side blacklist)

### Email Whitelist: Environment Variable

**Decision**: Store whitelist as comma-separated list in `ADMIN_WHITELIST` environment variable

**Rationale**:
- **Simplest for MVP**: No additional database table or admin UI needed
- **Infrastructure-managed**: Update via ECS task definition or env config file
- **Adequate for Scale**: MVP expects <10 admin emails; env var handles this easily
- **Fast Validation**: Parse once at startup, check in-memory on registration

**Alternatives Considered**:
- **Static Config File**: Requires file management in container; env var is simpler
- **Database Table**: Over-engineering for MVP; requires additional CRUD operations

**Implementation Pattern**:
```go
// Load at startup
adminWhitelist := strings.Split(os.Getenv("ADMIN_WHITELIST"), ",")
whitelistMap := make(map[string]bool)
for _, email := range adminWhitelist {
    whitelistMap[strings.TrimSpace(strings.ToLower(email))] = true
}

// Validate on registration
func IsWhitelisted(email string) bool {
    return whitelistMap[strings.ToLower(email)]
}
```

### Frontend: Next.js 14 Pages Router + TypeScript

**Decision**: Use Next.js 14 with Pages Router, TypeScript strict mode, and shadcn/ui

**Rationale**:
- **Constitution Mandated**: Next.js 14 Pages Router (NOT App Router), TypeScript, Tailwind CSS, shadcn/ui locked per Constitution Principle III
- **Pages Router**: More mature and stable than App Router; simpler mental model for MVP
- **TypeScript**: Type safety prevents common bugs; strict mode enforces best practices
- **shadcn/ui**: Copy-paste components (not npm dependency), customizable, accessible

**Alternatives Considered**: None - constitution locks this choice

**Best Practices Applied**:
- Pages in `src/pages/` for clear structure
- Shared components in `src/components/auth/` for reusability
- API client abstraction in `src/lib/api.ts` for centralized error handling

### State Management: React Query + Context API

**Decision**: Use React Query for server state, Context API for auth state

**Rationale**:
- **Constitution Mandated**: React Query + Context API locked per Constitution Principle III (NO Redux/MobX)
- **React Query**: Excellent for API state (caching, refetching, loading states)
- **Context API**: Sufficient for simple global state (current user, token)
- **Simplicity**: No Redux boilerplate; easier to maintain

**Alternatives Considered**: None - constitution forbids Redux/MobX

**Implementation Pattern**:
```typescript
// Context for current user + token
export const AuthContext = createContext<AuthState>({ user: null, token: null })

// React Query for API mutations
const loginMutation = useMutation({
  mutationFn: (credentials) => api.post('/auth/login', credentials),
  onSuccess: (data) => {
    setAuthContext({ user: data.user, token: data.token })
  }
})
```

### Form Validation: Zod

**Decision**: Use Zod for schema validation (frontend + backend API payloads)

**Rationale**:
- **TypeScript-first**: Infers types from schemas automatically
- **Composable**: Share validation logic between frontend forms and API contract validation
- **Error Messages**: Built-in support for user-friendly error messages
- **Lightweight**: Small bundle size (~12KB minified)

**Alternatives Considered**:
- **Yup**: Similar but Zod has better TypeScript integration
- **Joi**: Backend-focused, Zod works better for frontend + backend sharing

**Implementation Pattern**:
```typescript
const loginSchema = z.object({
  email: z.string().email("Invalid email format").toLowerCase(),
  password: z.string().min(8, "Password must be at least 8 characters")
})

type LoginForm = z.infer<typeof loginSchema>  // Type inferred automatically
```

## Database Schema Research

### User Table Design

**Decision**: Single `users` table with role enum

**Schema**:
```sql
CREATE TABLE users (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(60) NOT NULL,  -- bcrypt output
    role ENUM('admin', 'school_staff') NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    last_login_at TIMESTAMP NULL,
    INDEX idx_email (email)  -- For login queries
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

**Rationale**:
- **Single Table**: Simple for two roles; no need for separate tables or complex joins
- **Email as Unique Key**: Natural identifier; normalized to lowercase for case-insensitive comparison
- **Role Enum**: Database-enforced constraint (only 'admin' or 'school_staff' allowed)
- **Timestamps**: Audit trail (created_at, updated_at) + last login tracking for security
- **Index on Email**: Optimizes login query (SELECT WHERE email = ?)

**Performance Considerations**:
- Email index makes lookups O(log n) via B-tree
- VARCHAR(255) sufficient for email addresses (RFC 5321 max is 320, but 255 is practical limit)
- bcrypt VARCHAR(60) is fixed size for bcrypt output
- InnoDB engine provides ACID guarantees

**Migration Strategy**:
- Use GORM AutoMigrate for MVP simplicity: `db.AutoMigrate(&User{})`
- For production, switch to versioned migrations (golang-migrate or similar)

## API Design Research

### RESTful Authentication Endpoints

**Decision**: 5 RESTful endpoints following standard patterns

**Endpoints**:
1. `POST /api/v1/auth/register` - Admin self-registration (whitelist check)
2. `POST /api/v1/auth/login` - User login (email + password)
3. `POST /api/v1/auth/logout` - Logout (client-side token clear + server logs event)
4. `POST /api/v1/admin/users` - Admin creates school staff user
5. `GET /api/v1/auth/me` - Get current user info (validates token)

**Rationale**:
- **Standard REST verbs**: POST for mutations, GET for reads
- **Versioned**: `/v1/` allows future API changes without breaking clients
- **Resource-oriented**: `/auth/` for authentication operations, `/admin/` for admin-only

**Alternatives Considered**:
- **GraphQL**: Over-engineering for MVP; REST is simpler
- **Separate login/register for admin vs school staff**: Violates DRY; single login endpoint handles both roles

**Error Response Format**:
```json
{
  "error": {
    "code": "INVALID_CREDENTIALS",
    "message": "Invalid email or password",
    "status": 401
  }
}
```

**Success Response Format**:
```json
{
  "data": {
    "user": { "id": 123, "email": "admin@example.com", "role": "admin" },
    "token": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

## Security Best Practices

### Input Validation

**Decision**: Validate on both frontend (UX) and backend (security)

**Validation Rules**:
- **Email**: RFC 5322 format, normalized to lowercase, trimmed
- **Password**: Min 8 chars, at least 1 letter + 1 number, no leading/trailing whitespace
- **Max Length Limits**: Email 255 chars, password 72 chars (bcrypt limit)

**Implementation**:
- Frontend: Zod schema validation before API call
- Backend: Go validator or manual checks before database operations

### CORS Configuration

**Decision**: Restrict CORS to frontend origin only

**Configuration**:
```go
config := cors.DefaultConfig()
config.AllowOrigins = []string{os.Getenv("FRONTEND_URL")}  // e.g., https://acap.vercel.app
config.AllowMethods = []string{"GET", "POST", "PUT", "DELETE"}
config.AllowHeaders = []string{"Origin", "Content-Type", "Authorization"}
config.AllowCredentials = true  // For httpOnly cookies if used
```

**Rationale**:
- **Security**: Prevents unauthorized websites from calling API
- **Credentials**: Allow cookies if using httpOnly cookie storage for JWT

### Environment Variables

**Required Backend Env Vars**:
- `DATABASE_URL`: MySQL connection string (from RDS)
- `JWT_SECRET`: 32+ character random string (generate with `openssl rand -base64 32`)
- `ADMIN_WHITELIST`: Comma-separated admin emails
- `FRONTEND_URL`: Frontend origin for CORS
- `PORT`: Server listen port (default 8080)

**Required Frontend Env Vars**:
- `NEXT_PUBLIC_API_URL`: Backend API base URL (e.g., https://api.acap.example.com)

## Testing Strategy

### Backend Testing

**Unit Tests** (Go `testing` package):
- `auth_service_test.go`: Test password hashing, JWT generation, whitelist validation
- `whitelist_test.go`: Test email normalization and whitelist membership

**Integration Tests**:
- `auth_test.go`: Test full registration → login → protected endpoint flow
- Use in-memory SQLite database for test isolation

**Test Coverage Goal**: 60% for core authentication logic (per constitution lightweight testing strategy)

### Frontend Testing

**Manual Testing** (documented in `tests/manual/test-plan.md`):
- Test all user stories from spec.md
- Verify form validation errors
- Check token persistence (page refresh, logout)
- Test with valid/invalid credentials
- Test whitelist acceptance/rejection

**Browser Compatibility**: Chrome, Safari, Firefox (per constitution)

**Automated E2E Tests**: Deferred (constitution allows deferring if time-constrained)

## Performance Optimization

### Database Connection Pooling

**Decision**: GORM default pool settings, tuned for 10 connection limit

**Configuration**:
```go
sqlDB, _ := db.DB()
sqlDB.SetMaxOpenConns(10)        // RDS t3.micro limit
sqlDB.SetMaxIdleConns(5)         // Half of max
sqlDB.SetConnMaxLifetime(5 * time.Minute)
```

**Rationale**:
- **10 max connections**: Stays within RDS t3.micro limits
- **5 idle connections**: Balance between keeping connections alive and resource usage
- **5 min lifetime**: Prevents stale connections

### bcrypt Performance

**Decision**: Cost factor 10 (default)

**Benchmarking**:
- Cost 10: ~50-100ms per hash on modern CPU
- <20 concurrent users → <2 concurrent hashing operations at peak
- 0.25 vCPU can handle ~2-4 concurrent bcrypt operations without blocking

**Rationale**: Cost 10 is industry standard and acceptable for MVP load profile

## Deployment Research

### Backend Deployment: AWS ECS Fargate

**Container Configuration**:
- **Resources**: 0.25 vCPU, 0.5GB RAM (per constitution)
- **Port**: Expose 8080 for health checks and traffic
- **Health Check**: `GET /health` endpoint returns 200 OK
- **Environment Variables**: Injected via ECS task definition

**Docker Image**:
```dockerfile
FROM golang:1.21-alpine AS builder
WORKDIR /app
COPY go.mod go.sum ./
RUN go mod download
COPY . .
RUN CGO_ENABLED=0 GOOS=linux go build -o server ./cmd/server

FROM alpine:latest
RUN apk --no-cache add ca-certificates
WORKDIR /root/
COPY --from=builder /app/server .
EXPOSE 8080
CMD ["./server"]
```

### Frontend Deployment: Vercel

**Configuration**:
- **Framework**: Next.js (auto-detected)
- **Build Command**: `npm run build`
- **Output Directory**: `.next`
- **Environment Variables**: Set in Vercel dashboard

**Rationale**:
- **Constitution Recommended**: Vercel deployment mentioned as option
- **Free Tier**: Sufficient for MVP (<5 schools)
- **CDN**: Built-in edge network for fast load times
- **HTTPS**: Automatic SSL certificates

## Risk Mitigation

### Security Risks

| Risk | Mitigation |
|------|------------|
| JWT Secret Leaked | Store in environment variable, never commit to git, rotate periodically |
| Brute Force Login Attacks | Defer to future (rate limiting not in MVP scope per spec) |
| XSS Token Theft | Use httpOnly cookies OR rely on CSP headers in Vercel |
| SQL Injection | GORM parameterized queries prevent injection |
| Password Reuse | Out of scope for MVP (no password reset means user must contact admin) |

### Performance Risks

| Risk | Mitigation |
|------|------------|
| bcrypt CPU Overload | Cost 10 is acceptable for 20 concurrent users; monitor CPU usage |
| Database Connection Exhaustion | 10 connection limit with pooling; JWT validation doesn't hit DB |
| Large Whitelist Parsing | Load once at startup into map; O(1) lookup |

### Operational Risks

| Risk | Mitigation |
|------|------------|
| Forgotten Admin Password | Manual reset by root admin with direct DB access (acceptable for MVP) |
| Whitelist Update Requires Deploy | Document process: update ECS task definition → restart tasks |
| Token Expiration Annoyance | 24h expiration balances security and UX per spec decision |

## Dependencies

### Backend Go Modules

```go
require (
    github.com/gin-gonic/gin v1.9.1           // Web framework
    gorm.io/gorm v1.25.5                       // ORM
    gorm.io/driver/mysql v1.5.2                // MySQL driver
    github.com/golang-jwt/jwt/v5 v5.2.0        // JWT
    golang.org/x/crypto v0.17.0                // bcrypt
    github.com/gin-contrib/cors v1.5.0         // CORS middleware
)
```

### Frontend npm Packages

```json
{
  "dependencies": {
    "next": "14.0.4",
    "react": "18.2.0",
    "react-dom": "18.2.0",
    "@tanstack/react-query": "5.17.0",
    "zod": "3.22.4",
    "axios": "1.6.2"
  },
  "devDependencies": {
    "typescript": "5.3.3",
    "@types/react": "18.2.45",
    "@types/react-dom": "18.2.18",
    "tailwindcss": "3.4.0",
    "autoprefixer": "10.4.16",
    "postcss": "8.4.32"
  }
}
```

**Total Dependency Count**:
- Backend: 6 libraries (within <10 limit)
- Frontend: 10 libraries (at <10 limit)

## Next Steps

Phase 0 research complete. All technology decisions documented and aligned with ACAP Constitution v1.0.0.

**Ready for Phase 1**: Generate data-model.md, contracts/, and quickstart.md based on this research.
