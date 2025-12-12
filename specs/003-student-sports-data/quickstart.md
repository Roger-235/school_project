# Quickstart: 學生運動資料管理系統

**Feature**: 003-student-sports-data
**Date**: 2025-12-01
**Phase**: 1 - Test Scenarios

## Prerequisites

Before testing this feature, ensure:

1. **Backend Running**: Go server running on `http://localhost:8080`
2. **Frontend Running**: Next.js dev server running on `http://localhost:3000`
3. **Database Ready**: MySQL database with migrations applied
4. **Sport Types Seeded**: 17 sport types in database
5. **Authentication Working**: 001-user-auth feature functional
6. **User Logged In**: Valid JWT token available

## Quick Setup

```bash
# Start backend
cd backend
go run cmd/server/main.go

# Start frontend (new terminal)
cd frontend
npm run dev
```

## Test Scenarios

### Scenario 1: Create School (User Story 1, AC-1)

**Goal**: Create a new school with basic information

**Steps**:
1. Login to the system
2. Navigate to Schools page (`/schools`)
3. Click "新增學校" button
4. Fill in:
   - 學校名稱: `台北市立測試國小`
   - 縣市: Select `臺北市`
   - 地址: `台北市中正區測試路1號`
   - 電話: `02-1234-5678`
5. Click "建立" button

**Expected**:
- Success message displayed
- Redirected to school list
- New school appears in list

**API Test**:
```bash
curl -X POST http://localhost:8080/api/v1/schools \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "台北市立測試國小",
    "county_name": "臺北市",
    "address": "台北市中正區測試路1號",
    "phone": "02-1234-5678"
  }'
```

---

### Scenario 2: Create Student (User Story 1, AC-2)

**Goal**: Add a student to an existing school

**Steps**:
1. Navigate to a school's detail page (`/schools/1`)
2. Click "新增學生" button
3. Fill in:
   - 學號: `11001`
   - 姓名: `王小明`
   - 年級: Select `5`
   - 班級: `甲班`
   - 性別: Select `男`
   - 出生日期: `2014-05-15`
4. Click "建立" button

**Expected**:
- Success message displayed
- Student appears in school's student list

**API Test**:
```bash
curl -X POST http://localhost:8080/api/v1/students \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "school_id": 1,
    "student_number": "11001",
    "name": "王小明",
    "grade": 5,
    "class": "甲班",
    "gender": "male",
    "birth_date": "2014-05-15"
  }'
```

---

### Scenario 3: Update Student (User Story 1, AC-3)

**Goal**: Modify an existing student's information

**Steps**:
1. Navigate to student detail page (`/students/1`)
2. Click "編輯" button
3. Change grade from `5` to `6`
4. Click "儲存" button

**Expected**:
- Success message displayed
- Student detail shows updated grade

**API Test**:
```bash
curl -X PUT http://localhost:8080/api/v1/students/1 \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "student_number": "11001",
    "name": "王小明",
    "grade": 6,
    "class": "甲班",
    "gender": "male",
    "birth_date": "2014-05-15"
  }'
```

---

### Scenario 4: Delete Student - Soft Delete (User Story 1, AC-4)

**Goal**: Delete a student (soft delete preserves data)

**Steps**:
1. Navigate to student detail page (`/students/1`)
2. Click "刪除" button
3. Confirm deletion in dialog

**Expected**:
- Success message: "學生已成功刪除"
- Student no longer appears in list
- Database record still exists with `deleted_at` set

**API Test**:
```bash
curl -X DELETE http://localhost:8080/api/v1/students/1 \
  -H "Authorization: Bearer <token>"
```

---

### Scenario 5: Add Sport Record (User Story 2, AC-1)

**Goal**: Record a sport test result for a student

**Steps**:
1. Navigate to student detail page (`/students/1`)
2. Click "新增運動記錄" button
3. Fill in:
   - 運動項目: Select `800公尺`
   - 數值: `180.5`
   - 測驗日期: `2025-11-15`
   - 備註: `表現良好`
4. Click "建立" button

**Expected**:
- Success message displayed
- Record appears in student's record list
- Unit automatically shows `秒` based on sport type

**API Test**:
```bash
curl -X POST http://localhost:8080/api/v1/sport-records \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "student_id": 1,
    "sport_type_id": 1,
    "value": 180.5,
    "test_date": "2025-11-15",
    "notes": "表現良好"
  }'
```

---

### Scenario 6: View Sport Records (User Story 2, AC-2)

**Goal**: View all sport records for a student

**Steps**:
1. Navigate to student detail page (`/students/1`)
2. View "運動記錄" section

**Expected**:
- Records displayed in table format
- Sorted by date (newest first)
- Each record shows: 項目, 數值, 單位, 日期, 備註

**API Test**:
```bash
curl -X GET "http://localhost:8080/api/v1/students/1/records" \
  -H "Authorization: Bearer <token>"
```

---

### Scenario 7: Search Students (User Story 3, AC-1,2,3)

**Goal**: Search for students with various filters

**Steps**:
1. Navigate to Students page (`/students`)
2. Enter `王` in name search box
3. Select a school from dropdown
4. Select grade `5`
5. Click "搜尋" button

**Expected**:
- Results filtered by all criteria
- Matching students displayed
- School and grade visible in results

**API Test**:
```bash
curl -X GET "http://localhost:8080/api/v1/students?name=王&school_id=1&grade=5" \
  -H "Authorization: Bearer <token>"
```

---

### Scenario 8: Empty Search Results (User Story 3, AC-4)

**Goal**: Handle case when no students match search

**Steps**:
1. Navigate to Students page (`/students`)
2. Enter `不存在的名字` in name search box
3. Click "搜尋" button

**Expected**:
- Message displayed: "無符合條件的學生"
- Suggestion to adjust search criteria

---

### Scenario 9: Sport Type Auto-Unit (User Story 2, AC-3)

**Goal**: Verify sport type selection auto-fills unit

**Steps**:
1. Navigate to add sport record form
2. Select different sport types and observe unit field

**Expected**:
- `800公尺` → Unit shows `秒`
- `立定跳遠` → Unit shows `公分`
- `鉛球` → Unit shows `公尺`
- `1分鐘仰臥起坐` → Unit shows `次`

---

### Scenario 10: Record Modification History (User Story 2, AC-4)

**Goal**: Verify modification creates audit trail

**Steps**:
1. Create a sport record
2. Edit the record (change value)
3. View record history

**Expected**:
- Audit entry created with old and new values
- Changed timestamp recorded
- User who made change recorded

**API Test**:
```bash
# Update record
curl -X PUT http://localhost:8080/api/v1/sport-records/1 \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "value": 175.2,
    "test_date": "2025-11-15",
    "reason": "修正計時錯誤"
  }'

# Get history
curl -X GET http://localhost:8080/api/v1/sport-records/1/history \
  -H "Authorization: Bearer <token>"
```

---

## Edge Case Tests

### EC-1: Duplicate Student Number

**Steps**:
1. Create student with student_number `11001` in school 1
2. Try to create another student with same student_number in school 1

**Expected**:
- Error: "此學號已存在於該學校"

---

### EC-2: Invalid County Name

**Steps**:
1. Try to create school with invalid county name via API

**API Test**:
```bash
curl -X POST http://localhost:8080/api/v1/schools \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test School",
    "county_name": "Invalid County"
  }'
```

**Expected**:
- Error: "無效的縣市名稱"

---

### EC-3: Future Date for Sport Record

**Steps**:
1. Try to create sport record with future date

**Expected**:
- Error: "測驗日期不能是未來日期"

---

### EC-4: Negative Value for Sport Record

**Steps**:
1. Try to create sport record with negative value

**Expected**:
- Error: "測驗數值必須為正數"

---

### EC-5: Unauthenticated Access

**Steps**:
1. Try to access any API without JWT token

**Expected**:
- Status: 401 Unauthorized
- Error: "未授權的存取"

---

## Performance Tests

### PT-1: School List Loading

**Goal**: List 50+ schools loads under 2 seconds

**Setup**: Create 50 test schools
**Test**: Load `/schools` page
**Expected**: Page renders within 2 seconds

---

### PT-2: Student Search Performance

**Goal**: Search among 1000+ students completes under 2 seconds

**Setup**: Create 1000 test students
**Test**: Execute search with name filter
**Expected**: Results return within 2 seconds

---

### PT-3: Record List Performance

**Goal**: List 500 sport records for one student loads under 3 seconds

**Setup**: Create 500 records for one student
**Test**: Load student detail page with records
**Expected**: Page renders within 3 seconds

---

## Checklist Summary

| Scenario | User Story | Priority | Status |
|----------|------------|----------|--------|
| Create School | US1 | P1 | [ ] |
| Create Student | US1 | P1 | [ ] |
| Update Student | US1 | P1 | [ ] |
| Delete Student | US1 | P1 | [ ] |
| Add Sport Record | US2 | P2 | [ ] |
| View Sport Records | US2 | P2 | [ ] |
| Search Students | US3 | P3 | [ ] |
| Empty Search | US3 | P3 | [ ] |
| Auto-Unit | US2 | P2 | [ ] |
| Modification History | US2 | P2 | [ ] |
