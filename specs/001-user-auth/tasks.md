# Tasks: User Authentication System (MVP)

**Input**: Design documents from `/specs/001-user-auth/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Branch**: `001-user-auth`
**Generated**: 2025-11-14

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3, US4, US5)
- Include exact file paths in descriptions

## Path Conventions

This is a web application with separate backend and frontend:
- **Backend**: `backend/` (Go with Gin framework)
- **Frontend**: `frontend/` (Next.js 14 with TypeScript)

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [ ] T001 Create backend directory structure (cmd/server, internal/{auth,models,database,config}, tests/{unit,integration})
- [ ] T002 Initialize Go module in backend/go.mod with github.com/yourusername/acap-backend
- [ ] T003 [P] Install backend Go dependencies (Gin, GORM, MySQL driver, jwt-go, bcrypt, cors, godotenv) in backend/go.mod
- [ ] T004 [P] Create frontend directory structure (src/{pages,components,lib,hooks,context,styles}, tests/manual)
- [ ] T005 [P] Initialize Next.js 14 project with TypeScript in frontend/ (package.json, tsconfig.json, next.config.js)
- [ ] T006 [P] Install frontend npm dependencies (React Query, axios, Zod, Tailwind CSS, shadcn/ui) in frontend/package.json
- [ ] T007 [P] Configure Tailwind CSS in frontend/tailwind.config.ts and frontend/postcss.config.js
- [ ] T008 [P] Create backend/.env.example with required environment variables (DATABASE_URL, JWT_SECRET, ADMIN_WHITELIST, PORT, FRONTEND_URL)
- [ ] T009 [P] Create frontend/.env.local with NEXT_PUBLIC_API_URL

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [ ] T010 Implement configuration loader in backend/internal/config/config.go (loads env vars, validates required fields)
- [ ] T011 [P] Implement database connection with GORM in backend/internal/database/db.go (connection pooling, AutoMigrate)
- [ ] T012 [P] Create User model in backend/internal/models/user.go (GORM struct with BeforeCreate/BeforeUpdate hooks)
- [ ] T013 [P] Implement email whitelist loader in backend/internal/auth/whitelist.go (parse env var, provide IsWhitelisted function)
- [ ] T014 [P] Implement JWT middleware for protected routes in backend/internal/auth/middleware.go (AuthMiddleware, AdminOnly)
- [ ] T015 [P] Create API client with axios interceptors in frontend/src/lib/api.ts (add auth token to requests)
- [ ] T016 [P] Create auth utilities in frontend/src/lib/auth.ts (setAuthToken, getAuthToken, clearAuthToken, isAuthenticated)
- [ ] T017 [P] Create Zod validation schemas in frontend/src/lib/validation.ts (loginSchema, registerSchema with type inference)
- [ ] T018 [P] Create AuthContext in frontend/src/context/AuthContext.tsx (user state, logout function, React Query client setup)
- [ ] T019 [P] Configure CORS middleware in backend/cmd/server/main.go (restrict to FRONTEND_URL origin)
- [ ] T020 Implement server entry point in backend/cmd/server/main.go (load config, connect DB, setup routes, start server)

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Admin Self-Registration with Email Whitelist (Priority: P1) 🎯 MVP

**Goal**: Enable system administrators to create their own accounts using whitelisted email addresses. This is the entry point for bootstrapping the system.

**Independent Test**: Register with whitelisted email → success, register with non-whitelisted email → rejection, login with registered admin account → success

### Implementation for User Story 1

- [ ] T021 [US1] Implement RegisterAdmin service method in backend/internal/auth/service.go (whitelist check, password validation, bcrypt hashing, create user with admin role, generate JWT)
- [ ] T022 [US1] Implement Register HTTP handler in backend/internal/auth/handler.go (bind JSON, call RegisterAdmin, return user+token or error)
- [ ] T023 [US1] Add POST /api/v1/auth/register route in backend/cmd/server/main.go
- [ ] T024 [P] [US1] Create RegisterForm component in frontend/src/components/auth/RegisterForm.tsx (email/password inputs, Zod validation, React Query mutation)
- [ ] T025 [P] [US1] Create register page in frontend/src/pages/register.tsx (render RegisterForm, handle success/error, redirect to dashboard)
- [ ] T026 [US1] Add registration flow integration (submit form → API call → save token → redirect) in frontend/src/pages/register.tsx

**Checkpoint**: Admins can now self-register with whitelisted emails and log in

---

## Phase 4: User Story 2 - User Login with Email and Password (Priority: P2)

**Goal**: Enable all registered users (admins and school staff) to authenticate using email and password, receiving JWT tokens for session management.

**Independent Test**: Login with valid credentials → success + token, login with invalid credentials → error, access protected page with valid token → allowed

### Implementation for User Story 2

- [ ] T027 [US2] Implement Login service method in backend/internal/auth/service.go (find user by email, compare password with bcrypt, update last_login_at, generate JWT)
- [ ] T028 [US2] Implement Login HTTP handler in backend/internal/auth/handler.go (bind JSON, call Login, return user+token or generic error)
- [ ] T029 [US2] Add POST /api/v1/auth/login route in backend/cmd/server/main.go
- [ ] T030 [P] [US2] Create LoginForm component in frontend/src/components/auth/LoginForm.tsx (email/password inputs, Zod validation, React Query mutation)
- [ ] T031 [P] [US2] Create login page in frontend/src/pages/login.tsx (render LoginForm, handle success/error, redirect to dashboard)
- [ ] T032 [US2] Add login flow integration (submit form → API call → save token → update AuthContext → redirect) in frontend/src/pages/login.tsx
- [ ] T033 [P] [US2] Create ProtectedRoute HOC in frontend/src/components/auth/ProtectedRoute.tsx (check auth, redirect to login if not authenticated)
- [ ] T034 [P] [US2] Create dashboard page in frontend/src/pages/dashboard.tsx (protected route, display user info from AuthContext)

**Checkpoint**: All users (admin + school staff) can log in and access protected pages

---

## Phase 5: User Story 3 - Admin Creates School Staff Accounts (Priority: P3)

**Goal**: Enable administrators to onboard school personnel by creating school_staff accounts. This allows the system to scale beyond initial admins.

**Independent Test**: Login as admin → create school staff account → logout → login as school staff with created credentials → success

### Implementation for User Story 3

- [ ] T035 [US3] Implement CreateSchoolStaff service method in backend/internal/auth/service.go (password validation, bcrypt hashing, create user with school_staff role)
- [ ] T036 [US3] Implement CreateUser HTTP handler in backend/internal/auth/handler.go (bind JSON, call CreateSchoolStaff, return user or error)
- [ ] T037 [US3] Add POST /api/v1/admin/users route with AuthMiddleware + AdminOnly in backend/cmd/server/main.go
- [ ] T038 [P] [US3] Create CreateUserForm component in frontend/src/components/auth/CreateUserForm.tsx (email/password inputs, Zod validation, React Query mutation)
- [ ] T039 [P] [US3] Create admin/create-user page in frontend/src/pages/admin/create-user.tsx (protected+admin-only route, render CreateUserForm, handle success/error)
- [ ] T040 [US3] Add role-based route protection (admin-only pages check user.role === 'admin') in frontend/src/components/auth/ProtectedRoute.tsx

**Checkpoint**: Admins can create school staff accounts, school staff can log in with their credentials

---

## Phase 6: User Story 4 - Token-Based Session Management (Priority: P4)

**Goal**: Implement secure, time-limited JWT sessions that expire after 24 hours, balancing security with user convenience.

**Independent Test**: Login → access protected page (works) → wait 24+ hours (or manipulate token exp) → access protected page → token expired error → forced re-login

### Implementation for User Story 4

- [ ] T041 [US4] Implement JWT token generation helper in backend/internal/auth/service.go (generateToken with 24h expiration, include sub/email/role claims)
- [ ] T042 [US4] Implement GetCurrentUser HTTP handler in backend/internal/auth/handler.go (extract user ID from JWT claims, fetch user from DB, return user data)
- [ ] T043 [US4] Add GET /api/v1/auth/me route with AuthMiddleware in backend/cmd/server/main.go
- [ ] T044 [P] [US4] Create useAuth hook in frontend/src/hooks/useAuth.ts (React Query hook for fetching current user from /auth/me)
- [ ] T045 [US4] Update AuthContext to fetch user on mount (if token exists) in frontend/src/context/AuthContext.tsx
- [ ] T046 [US4] Add token expiration handling (catch 401 errors, clear token, redirect to login) in frontend/src/lib/api.ts axios interceptors
- [ ] T047 [P] [US4] Create token persistence logic (save to localStorage on login, load on page refresh) in frontend/src/context/AuthContext.tsx

**Checkpoint**: Sessions are time-limited, tokens expire after 24h, expired tokens trigger re-login

---

## Phase 7: User Story 5 - User Logout (Priority: P5)

**Goal**: Provide users with explicit session termination for security on shared devices and clean session management.

**Independent Test**: Login → access dashboard → logout → token cleared → access dashboard → redirected to login → back button → still logged out

### Implementation for User Story 5

- [ ] T048 [US5] Implement Logout HTTP handler in backend/internal/auth/handler.go (return success message, server logs event)
- [ ] T049 [US5] Add POST /api/v1/auth/logout route with AuthMiddleware in backend/cmd/server/main.go
- [ ] T050 [P] [US5] Add logout button to dashboard in frontend/src/pages/dashboard.tsx (calls logout mutation, clears token, redirects to login)
- [ ] T051 [US5] Implement logout mutation in frontend/src/hooks/useAuth.ts (call /auth/logout API, call AuthContext.logout)
- [ ] T052 [US5] Update AuthContext.logout to clear token and user state in frontend/src/context/AuthContext.tsx
- [ ] T053 [US5] Add logout confirmation modal (optional UX enhancement) in frontend/src/components/auth/LogoutButton.tsx

**Checkpoint**: Users can log out, tokens are cleared, protected pages are inaccessible after logout

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories, production readiness, and validation

- [ ] T054 [P] Add error handling and logging in backend/internal/auth/service.go (log auth events, structured logging)
- [ ] T055 [P] Add comprehensive error messages for all API endpoints in backend/internal/auth/handler.go (follow error response format from contracts)
- [ ] T056 [P] Create health check endpoint in backend/cmd/server/main.go (GET /health returns 200 OK)
- [ ] T057 [P] Update _app.tsx to wrap with AuthProvider and QueryClientProvider in frontend/src/pages/_app.tsx
- [ ] T058 [P] Add loading states to all forms in frontend/src/components/auth/ (LoginForm, RegisterForm, CreateUserForm)
- [ ] T059 [P] Add form validation error display in frontend/src/components/auth/ (show Zod validation errors)
- [ ] T060 [P] Create global styles in frontend/src/styles/globals.css (Tailwind directives, base styles)
- [ ] T061 [P] Add redirect logic (logged-in users accessing /login redirect to /dashboard) in frontend/src/pages/login.tsx and frontend/src/pages/register.tsx
- [ ] T062 Add backend unit tests for auth service in backend/tests/unit/auth_service_test.go (test password hashing, JWT generation, whitelist validation)
- [ ] T063 [P] Add backend integration tests for auth flow in backend/tests/integration/auth_test.go (register → login → protected endpoint)
- [ ] T064 [P] Create manual test plan in frontend/tests/manual/test-plan.md (document test scenarios from quickstart.md)
- [ ] T065 Create Dockerfile for backend in backend/Dockerfile (multi-stage build, Alpine base)
- [ ] T066 [P] Add README.md for backend in backend/README.md (setup instructions, environment variables, API endpoints)
- [ ] T067 [P] Add README.md for frontend in frontend/README.md (setup instructions, available scripts, environment variables)
- [ ] T068 Run through quickstart.md validation (verify all acceptance scenarios pass)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Story 1 (Phase 3)**: Depends on Foundational (Phase 2) - Can start after foundation ready
- **User Story 2 (Phase 4)**: Depends on Foundational (Phase 2) - Independent of US1 but builds on same auth infrastructure
- **User Story 3 (Phase 5)**: Depends on Foundational (Phase 2) AND User Story 2 (admin must be able to log in first)
- **User Story 4 (Phase 6)**: Depends on Foundational (Phase 2) AND User Story 2 (login must work to test sessions)
- **User Story 5 (Phase 7)**: Depends on Foundational (Phase 2) AND User Story 2 (must be logged in to log out)
- **Polish (Phase 8)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Independent - Only depends on Foundational phase
- **User Story 2 (P2)**: Independent - Only depends on Foundational phase (can implement in parallel with US1 if desired)
- **User Story 3 (P3)**: Depends on US2 (admin must log in before creating accounts)
- **User Story 4 (P4)**: Depends on US2 (login must work to test JWT sessions)
- **User Story 5 (P5)**: Depends on US2 (must log in before logging out)

### Within Each User Story

- Backend service → Backend handler → Backend route
- Frontend component (can be parallel with backend) → Frontend page → Integration
- Each story builds from models → services → endpoints → UI

### Parallel Opportunities

**Phase 1 (Setup)**: Tasks T003, T004, T005, T006, T007, T008, T009 can all run in parallel

**Phase 2 (Foundational)**: Tasks T011-T019 can run in parallel (different files, no dependencies)

**User Story 1**: T024, T025 (frontend) can run in parallel with T021-T023 (backend)

**User Story 2**: T030, T031, T033, T034 (frontend) can run in parallel with T027-T029 (backend)

**User Story 3**: T038, T039 (frontend) can run in parallel with T035-T037 (backend)

**User Story 4**: T044, T047 (frontend) can run in parallel with T041-T043 (backend)

**User Story 5**: T050, T053 (frontend) can run in parallel with T048-T049 (backend)

**Phase 8 (Polish)**: Tasks T054-T061, T064, T066, T067 can run in parallel

---

## Parallel Example: User Story 1 (Admin Registration)

```bash
# Backend team:
Task T021: "Implement RegisterAdmin service method in backend/internal/auth/service.go"
Task T022: "Implement Register HTTP handler in backend/internal/auth/handler.go"
Task T023: "Add POST /api/v1/auth/register route in backend/cmd/server/main.go"

# Frontend team (can work in parallel with backend):
Task T024: "Create RegisterForm component in frontend/src/components/auth/RegisterForm.tsx"
Task T025: "Create register page in frontend/src/pages/register.tsx"
```

Both teams can work simultaneously once Foundational phase (Phase 2) is complete.

---

## Implementation Strategy

### MVP First (User Stories 1-2 Only) 🎯 Recommended

**Goal**: Ship working authentication system ASAP

1. Complete Phase 1: Setup → Project structure ready
2. Complete Phase 2: Foundational (CRITICAL) → Foundation ready
3. Complete Phase 3: User Story 1 (Admin Registration) → Admins can register
4. Complete Phase 4: User Story 2 (Login) → All users can log in
5. **STOP and VALIDATE**: Test US1+US2 independently
6. Deploy MVP demo

**Time Estimate**: 2-3 weeks (per quickstart.md)

**Deliverable**: Admins can self-register and log in. Ready for initial pilot.

### Incremental Delivery (All User Stories)

**Goal**: Add features incrementally without breaking existing functionality

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 → Test independently → **Milestone 1: Admin Registration** ✅
3. Add User Story 2 → Test independently → **Milestone 2: User Login (MVP!)** ✅
4. Add User Story 3 → Test independently → **Milestone 3: Multi-user System** ✅
5. Add User Story 4 → Test independently → **Milestone 4: Secure Sessions** ✅
6. Add User Story 5 → Test independently → **Milestone 5: Complete Auth** ✅
7. Complete Polish phase → **Production Ready** 🚀

**Time Estimate**: 3-4 weeks total (per plan.md)

### Parallel Team Strategy

With 2-3 developers:

**Week 1**: Everyone together on Setup (Phase 1) + Foundational (Phase 2)

**Week 2-3**: Once Foundational is done:
- **Developer A (Backend)**: US1 backend → US2 backend → US3 backend
- **Developer B (Frontend)**: US1 frontend → US2 frontend → US3 frontend
- **Developer C (Full-stack)**: US4 → US5 → Polish

**Week 4**: Integration, testing, polish

---

## Task Count Summary

- **Total Tasks**: 68
- **Setup (Phase 1)**: 9 tasks
- **Foundational (Phase 2)**: 11 tasks (BLOCKING)
- **User Story 1**: 6 tasks
- **User Story 2**: 8 tasks
- **User Story 3**: 6 tasks
- **User Story 4**: 7 tasks
- **User Story 5**: 6 tasks
- **Polish (Phase 8)**: 15 tasks

**Parallel Tasks**: 28 tasks marked [P] can run in parallel with other tasks

**MVP Scope (US1+US2)**: 34 tasks (Setup + Foundational + US1 + US2)

---

## Notes

- All tasks follow strict format: `- [ ] [ID] [P?] [Story?] Description with file path`
- Tasks are organized by user story for independent implementation and testing
- Each user story delivers a complete, testable increment
- Backend and frontend work can proceed in parallel after Foundational phase
- Stop at any checkpoint to validate story independently before proceeding
- Constitution compliance verified in plan.md (all checks passed)
- No tests explicitly requested in spec, so no test tasks in user story phases (only in Polish phase)
