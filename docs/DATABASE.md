# ICACP 資料庫結構文件

> 版本: 1.0
> 資料庫: MySQL 8.0+
> ORM: GORM
> 最後更新: 2025-12-17

---

## 目錄

1. [資料庫概述](#1-資料庫概述)
2. [實體關係圖](#2-實體關係圖)
3. [資料表定義](#3-資料表定義)
4. [索引說明](#4-索引說明)
5. [資料完整性](#5-資料完整性)
6. [種子資料](#6-種子資料)
7. [遷移說明](#7-遷移說明)

---

## 1. 資料庫概述

### 1.1 資料庫資訊

| 項目 | 值 |
|------|-----|
| 資料庫名稱 | acap_dev（開發）/ acap_prod（正式） |
| 字元集 | utf8mb4 |
| 排序規則 | utf8mb4_unicode_ci |
| 時區 | Local |

### 1.2 連線字串格式

```
DATABASE_URL="user:password@tcp(host:port)/database?charset=utf8mb4&parseTime=True&loc=Local"
```

### 1.3 資料表列表

| 資料表 | 說明 | 記錄數（參考） |
|--------|------|----------------|
| schools | 學校 | ~74 |
| students | 學生 | ~1,000+ |
| sport_types | 運動類型 | 17（固定） |
| sport_records | 運動記錄 | ~10,000+ |
| sport_record_audits | 記錄修改稽核 | 動態成長 |

---

## 2. 實體關係圖

```
┌─────────────────┐       ┌─────────────────┐
│     schools     │       │   sport_types   │
├─────────────────┤       ├─────────────────┤
│ id (PK)         │       │ id (PK)         │
│ name            │       │ name            │
│ county_name     │       │ category        │
│ address         │       │ default_unit    │
│ phone           │       │ value_type      │
│ latitude        │       └────────┬────────┘
│ longitude       │                │
│ created_at      │                │
│ updated_at      │                │
│ deleted_at      │                │
└────────┬────────┘                │
         │                         │
         │ 1:N                     │ 1:N
         │                         │
         ▼                         │
┌─────────────────┐                │
│    students     │                │
├─────────────────┤                │
│ id (PK)         │                │
│ school_id (FK)  │───────┐        │
│ student_number  │       │        │
│ name            │       │        │
│ grade           │       │        │
│ class           │       │        │
│ gender          │       │        │
│ birth_date      │       │        │
│ created_at      │       │        │
│ updated_at      │       │        │
│ deleted_at      │       │        │
└────────┬────────┘       │        │
         │                │        │
         │ 1:N            │        │
         │                │        │
         ▼                │        │
┌─────────────────┐       │        │
│  sport_records  │       │        │
├─────────────────┤       │        │
│ id (PK)         │       │        │
│ student_id (FK) │───────┘        │
│ sport_type_id   │────────────────┘
│ value           │
│ test_date       │
│ notes           │
│ created_at      │
│ updated_at      │
│ deleted_at      │
└────────┬────────┘
         │
         │ 1:N
         │
         ▼
┌─────────────────────┐
│ sport_record_audits │
├─────────────────────┤
│ id (PK)             │
│ sport_record_id(FK) │
│ old_value           │
│ new_value           │
│ changed_by          │
│ changed_at          │
│ reason              │
└─────────────────────┘
```

---

## 3. 資料表定義

### 3.1 schools（學校）

儲存學校基本資訊。

```sql
CREATE TABLE schools (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL COMMENT '學校名稱',
    county_name VARCHAR(20) NOT NULL COMMENT '縣市名稱',
    address VARCHAR(200) COMMENT '學校地址',
    phone VARCHAR(20) COMMENT '聯絡電話',
    latitude DECIMAL(10, 8) COMMENT '緯度',
    longitude DECIMAL(11, 8) COMMENT '經度',
    created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
    deleted_at DATETIME(3) COMMENT '軟刪除時間',

    INDEX idx_county_name (county_name),
    INDEX idx_deleted_at (deleted_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

**欄位說明：**

| 欄位 | 類型 | 允許空值 | 說明 |
|------|------|----------|------|
| id | BIGINT UNSIGNED | 否 | 主鍵，自動遞增 |
| name | VARCHAR(100) | 否 | 學校名稱 |
| county_name | VARCHAR(20) | 否 | 縣市名稱（22 個台灣縣市之一） |
| address | VARCHAR(200) | 是 | 學校地址 |
| phone | VARCHAR(20) | 是 | 聯絡電話 |
| latitude | DECIMAL(10,8) | 是 | 緯度座標 |
| longitude | DECIMAL(11,8) | 是 | 經度座標 |
| created_at | DATETIME(3) | 否 | 建立時間 |
| updated_at | DATETIME(3) | 否 | 更新時間 |
| deleted_at | DATETIME(3) | 是 | 軟刪除時間 |

### 3.2 students（學生）

儲存學生基本資訊。

```sql
CREATE TABLE students (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    school_id BIGINT UNSIGNED NOT NULL COMMENT '所屬學校 ID',
    student_number VARCHAR(20) NOT NULL COMMENT '學號/座號',
    name VARCHAR(50) NOT NULL COMMENT '姓名',
    grade INT NOT NULL COMMENT '年級 (1-12)',
    class VARCHAR(20) COMMENT '班級',
    gender VARCHAR(10) NOT NULL COMMENT '性別 (male/female)',
    birth_date DATE COMMENT '生日',
    created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
    deleted_at DATETIME(3) COMMENT '軟刪除時間',

    UNIQUE KEY uk_school_student (school_id, student_number),
    INDEX idx_school_id (school_id),
    INDEX idx_name (name),
    INDEX idx_deleted_at (deleted_at),

    CONSTRAINT fk_student_school FOREIGN KEY (school_id)
        REFERENCES schools(id) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

**欄位說明：**

| 欄位 | 類型 | 允許空值 | 說明 |
|------|------|----------|------|
| id | BIGINT UNSIGNED | 否 | 主鍵，自動遞增 |
| school_id | BIGINT UNSIGNED | 否 | 外鍵，關聯 schools.id |
| student_number | VARCHAR(20) | 否 | 學號/座號（校內唯一） |
| name | VARCHAR(50) | 否 | 學生姓名 |
| grade | INT | 否 | 年級（1-12） |
| class | VARCHAR(20) | 是 | 班級 |
| gender | VARCHAR(10) | 否 | 性別（male/female） |
| birth_date | DATE | 是 | 生日 |
| created_at | DATETIME(3) | 否 | 建立時間 |
| updated_at | DATETIME(3) | 否 | 更新時間 |
| deleted_at | DATETIME(3) | 是 | 軟刪除時間 |

**唯一約束：** `(school_id, student_number)` 確保同一學校內學號不重複。

### 3.3 sport_types（運動類型）

定義系統支援的運動測驗類型。

```sql
CREATE TABLE sport_types (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE COMMENT '運動類型名稱',
    category VARCHAR(20) NOT NULL COMMENT '分類 (體適能/田徑/球類)',
    default_unit VARCHAR(20) NOT NULL COMMENT '預設單位',
    value_type VARCHAR(20) NOT NULL COMMENT '數值類型 (time/distance/count/score)',
    created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),

    INDEX idx_category (category)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

**欄位說明：**

| 欄位 | 類型 | 允許空值 | 說明 |
|------|------|----------|------|
| id | BIGINT UNSIGNED | 否 | 主鍵，自動遞增 |
| name | VARCHAR(50) | 否 | 運動類型名稱（唯一） |
| category | VARCHAR(20) | 否 | 分類（體適能/田徑/球類） |
| default_unit | VARCHAR(20) | 否 | 預設單位（cm/kg/秒/次） |
| value_type | VARCHAR(20) | 否 | 數值類型 |

### 3.4 sport_records（運動記錄）

儲存學生的運動測驗記錄。

```sql
CREATE TABLE sport_records (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    student_id BIGINT UNSIGNED NOT NULL COMMENT '學生 ID',
    sport_type_id BIGINT UNSIGNED NOT NULL COMMENT '運動類型 ID',
    value DECIMAL(10, 2) NOT NULL COMMENT '測驗數值',
    test_date DATE NOT NULL COMMENT '測驗日期',
    notes TEXT COMMENT '備註',
    created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
    deleted_at DATETIME(3) COMMENT '軟刪除時間',

    INDEX idx_student_id (student_id),
    INDEX idx_sport_type_id (sport_type_id),
    INDEX idx_test_date (test_date),
    INDEX idx_deleted_at (deleted_at),

    CONSTRAINT fk_record_student FOREIGN KEY (student_id)
        REFERENCES students(id) ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT fk_record_sport_type FOREIGN KEY (sport_type_id)
        REFERENCES sport_types(id) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

**欄位說明：**

| 欄位 | 類型 | 允許空值 | 說明 |
|------|------|----------|------|
| id | BIGINT UNSIGNED | 否 | 主鍵，自動遞增 |
| student_id | BIGINT UNSIGNED | 否 | 外鍵，關聯 students.id |
| sport_type_id | BIGINT UNSIGNED | 否 | 外鍵，關聯 sport_types.id |
| value | DECIMAL(10,2) | 否 | 測驗數值 |
| test_date | DATE | 否 | 測驗日期 |
| notes | TEXT | 是 | 備註 |
| created_at | DATETIME(3) | 否 | 建立時間 |
| updated_at | DATETIME(3) | 否 | 更新時間 |
| deleted_at | DATETIME(3) | 是 | 軟刪除時間 |

### 3.5 sport_record_audits（運動記錄稽核）

記錄運動記錄的修改歷史。

```sql
CREATE TABLE sport_record_audits (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    sport_record_id BIGINT UNSIGNED NOT NULL COMMENT '運動記錄 ID',
    old_value DECIMAL(10, 2) COMMENT '修改前數值',
    new_value DECIMAL(10, 2) NOT NULL COMMENT '修改後數值',
    changed_by VARCHAR(100) COMMENT '修改者',
    changed_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) COMMENT '修改時間',
    reason TEXT COMMENT '修改原因',

    INDEX idx_sport_record_id (sport_record_id),
    INDEX idx_changed_at (changed_at),

    CONSTRAINT fk_audit_record FOREIGN KEY (sport_record_id)
        REFERENCES sport_records(id) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

**欄位說明：**

| 欄位 | 類型 | 允許空值 | 說明 |
|------|------|----------|------|
| id | BIGINT UNSIGNED | 否 | 主鍵，自動遞增 |
| sport_record_id | BIGINT UNSIGNED | 否 | 外鍵，關聯 sport_records.id |
| old_value | DECIMAL(10,2) | 是 | 修改前數值（新建時為空） |
| new_value | DECIMAL(10,2) | 否 | 修改後數值 |
| changed_by | VARCHAR(100) | 是 | 修改者識別 |
| changed_at | DATETIME(3) | 否 | 修改時間 |
| reason | TEXT | 是 | 修改原因 |

---

## 4. 索引說明

### 4.1 主鍵索引

所有資料表都使用 `id` 欄位作為主鍵，採用 BIGINT UNSIGNED AUTO_INCREMENT。

### 4.2 外鍵索引

| 資料表 | 外鍵欄位 | 參照資料表 |
|--------|----------|------------|
| students | school_id | schools.id |
| sport_records | student_id | students.id |
| sport_records | sport_type_id | sport_types.id |
| sport_record_audits | sport_record_id | sport_records.id |

### 4.3 查詢優化索引

| 資料表 | 索引名稱 | 欄位 | 用途 |
|--------|----------|------|------|
| schools | idx_county_name | county_name | 按縣市篩選 |
| students | uk_school_student | (school_id, student_number) | 唯一約束 + 查詢 |
| students | idx_name | name | 姓名搜尋 |
| sport_records | idx_test_date | test_date | 日期範圍查詢 |
| sport_types | idx_category | category | 按分類篩選 |

### 4.4 軟刪除索引

所有支援軟刪除的資料表都有 `idx_deleted_at` 索引，用於過濾已刪除記錄。

---

## 5. 資料完整性

### 5.1 軟刪除機制

系統使用 GORM 的軟刪除功能：
- 刪除操作僅設定 `deleted_at` 時間戳
- 查詢預設排除已刪除記錄
- 資料可透過管理介面復原

### 5.2 外鍵約束行為

| 關係 | ON DELETE | ON UPDATE | 說明 |
|------|-----------|-----------|------|
| students → schools | RESTRICT | CASCADE | 有學生時禁止刪除學校 |
| sport_records → students | RESTRICT | CASCADE | 有記錄時禁止刪除學生 |
| sport_records → sport_types | RESTRICT | CASCADE | 有記錄時禁止刪除類型 |
| sport_record_audits → sport_records | CASCADE | CASCADE | 記錄刪除時一併刪除稽核 |

### 5.3 資料驗證規則

**學校 (schools):**
- name: 必填，最多 100 字
- county_name: 必填，需為有效的台灣縣市名稱

**學生 (students):**
- school_id: 必填，需存在於 schools
- student_number: 必填，最多 20 字，校內唯一
- name: 必填，最多 50 字
- grade: 必填，1-12 之間
- gender: 必填，male 或 female

**運動記錄 (sport_records):**
- student_id: 必填，需存在於 students
- sport_type_id: 必填，需存在於 sport_types
- value: 必填，數值型態
- test_date: 必填，有效日期

---

## 6. 種子資料

### 6.1 運動類型種子資料

系統啟動時自動建立 17 種預設運動類型：

```go
// backend/internal/database/seed/sport_types.go

var defaultSportTypes = []SportType{
    // 體適能類
    {Name: "身高", Category: "體適能", DefaultUnit: "cm", ValueType: "distance"},
    {Name: "體重", Category: "體適能", DefaultUnit: "kg", ValueType: "distance"},
    {Name: "坐姿體前彎", Category: "體適能", DefaultUnit: "cm", ValueType: "distance"},
    {Name: "立定跳遠", Category: "體適能", DefaultUnit: "cm", ValueType: "distance"},
    {Name: "仰臥起坐", Category: "體適能", DefaultUnit: "次/分鐘", ValueType: "count"},
    {Name: "心肺耐力", Category: "體適能", DefaultUnit: "秒", ValueType: "time"},
    // ... 其他類型
}
```

### 6.2 測試用種子資料

開發環境可執行種子資料工具：

```bash
cd backend
go run cmd/seed/main.go
```

---

## 7. 遷移說明

### 7.1 自動遷移

GORM AutoMigrate 在應用程式啟動時自動執行：

```go
// backend/internal/database/migrate.go
db.AutoMigrate(
    &models.School{},
    &models.Student{},
    &models.SportType{},
    &models.SportRecord{},
    &models.SportRecordAudit{},
)
```

### 7.2 遷移注意事項

1. **新增欄位:** AutoMigrate 會自動新增不存在的欄位
2. **修改欄位:** AutoMigrate 不會修改現有欄位類型
3. **刪除欄位:** AutoMigrate 不會刪除多餘的欄位
4. **索引變更:** 需手動執行 SQL 或使用遷移工具

### 7.3 手動遷移範例

若需手動修改資料庫結構：

```sql
-- 範例：新增欄位
ALTER TABLE students ADD COLUMN emergency_contact VARCHAR(50) AFTER phone;

-- 範例：修改欄位類型
ALTER TABLE sport_records MODIFY COLUMN notes TEXT;

-- 範例：新增索引
CREATE INDEX idx_students_grade ON students(grade);
```

---

## 附錄

### A. 台灣縣市列表

```sql
-- 22 個有效縣市名稱
'臺北市', '新北市', '桃園市', '臺中市', '臺南市', '高雄市',
'基隆市', '新竹市', '嘉義市', '新竹縣', '苗栗縣', '彰化縣',
'南投縣', '雲林縣', '嘉義縣', '屏東縣', '宜蘭縣', '花蓮縣',
'臺東縣', '澎湖縣', '金門縣', '連江縣'
```

### B. 常用查詢範例

```sql
-- 查詢各縣市學校數量
SELECT county_name, COUNT(*) as school_count
FROM schools
WHERE deleted_at IS NULL
GROUP BY county_name;

-- 查詢學生運動記錄趨勢
SELECT sr.test_date, sr.value, st.name as sport_type
FROM sport_records sr
JOIN sport_types st ON sr.sport_type_id = st.id
WHERE sr.student_id = ? AND sr.deleted_at IS NULL
ORDER BY sr.test_date ASC;

-- 查詢學校學生統計
SELECT s.id, s.name, COUNT(st.id) as student_count
FROM schools s
LEFT JOIN students st ON s.id = st.school_id AND st.deleted_at IS NULL
WHERE s.deleted_at IS NULL
GROUP BY s.id;
```
