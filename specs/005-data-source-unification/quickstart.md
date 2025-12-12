# Quickstart: Data Source Unification

**Feature**: 005-data-source-unification
**Date**: 2025-12-11

## Prerequisites

- [ ] Docker installed and running (for MySQL)
- [ ] Go 1.21+ installed
- [ ] Node.js 18+ installed
- [ ] Backend `.env` file configured

## Setup Steps

### Step 1: Start MySQL Database

```bash
cd D:\work\ICACP
docker-compose up -d mysql
```

Verify MySQL is running:
```bash
docker-compose ps
```

### Step 2: Start Backend Server

```bash
cd D:\work\ICACP\backend
go run cmd/server/main.go
```

Expected output:
```
✓ Connected to MySQL database successfully
Running database migrations...
✓ Database migrations completed successfully
Seeding sport types...
✓ Seeded 17 sport types successfully
⚠ Warning: Redis not available... - caching disabled
🚀 Server starting on port 8080
```

Verify backend is running:
```bash
curl http://localhost:8080/health
# Expected: {"status":"ok"}
```

### Step 3: Switch Frontend to Backend API

Edit `frontend/.env.local`:

```diff
- NEXT_PUBLIC_API_URL=/api/v1
+ NEXT_PUBLIC_API_URL=http://localhost:8080/api/v1
```

### Step 4: Restart Frontend Server

```bash
cd D:\work\ICACP\frontend
# Stop existing dev server (Ctrl+C)
npm run dev
```

### Step 5: Verify Data Source Unification

1. Open http://localhost:3000 in browser
2. Login with test credentials:
   - Email: `admin@example.com`
   - Password: `password123`
3. Navigate to Schools page
4. Add a new school (e.g., in 台北市)
5. Navigate to Map page
6. Verify 台北市 shows "1" school

## Verification Checklist

### Scenario 1: Schools API

- [ ] Visit `/schools` page
- [ ] School list loads from backend (check Network tab: request to `localhost:8080`)
- [ ] Add new school → appears in list

### Scenario 2: Students API

- [ ] Visit `/students` page
- [ ] Student list loads from backend
- [ ] Add new student → appears in list

### Scenario 3: County Statistics API

- [ ] Visit `/map` page
- [ ] County statistics load from backend
- [ ] Counties with schools show green color
- [ ] Click on county → popup shows correct school/student count

### Scenario 4: Data Consistency

- [ ] Add school in 台北市 via `/schools/new`
- [ ] Refresh `/map` page
- [ ] 台北市 shows updated school count

### Scenario 5: Authentication

- [ ] Login works (uses Mock API at `/api/auth/login`)
- [ ] After login, can access all data pages
- [ ] Logout works correctly

## Troubleshooting

### CORS Error

**Symptom**: Browser console shows "Access-Control-Allow-Origin" error

**Solution**: Ensure backend is running and FRONTEND_URL is set correctly in backend `.env`:
```
FRONTEND_URL=http://localhost:3000
```

### Empty Data

**Symptom**: Pages show "no data" or empty lists

**Cause**: Database is empty (expected for fresh setup)

**Solution**: Add data via UI:
1. Login
2. Go to Schools → Add school
3. Go to Students → Add student (select the school)

### 401 Unauthorized

**Symptom**: API calls return 401 error

**Cause**: Backend auth middleware not implemented

**Current Status**: Backend endpoints don't require auth (TODO in main.go). This is expected behavior for now.

### Network Timeout

**Symptom**: Frontend can't connect to backend

**Solution**:
1. Verify backend is running: `curl http://localhost:8080/health`
2. Verify MySQL is running: `docker-compose ps`
3. Check backend logs for errors

## Rollback

To revert to Mock APIs:

```diff
# frontend/.env.local
- NEXT_PUBLIC_API_URL=http://localhost:8080/api/v1
+ NEXT_PUBLIC_API_URL=/api/v1
```

Then restart frontend server.
