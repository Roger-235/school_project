# Feature Specification: Excel Batch Import

**Feature Branch**: `007-excel-batch-import`
**Created**: 2025-12-11
**Status**: Draft
**Input**: User description: "Excel 批次匯入功能，讓老師可以透過 Excel 檔案批次匯入學生名單和運動記錄，大幅減少手動逐一輸入的負擔。"

## Overview

本功能旨在解決老師逐一輸入學生資料和運動記錄的繁瑣問題。透過提供標準化的 Excel 模板，老師可以在熟悉的 Excel 環境中準備資料，然後一次性批次匯入系統。

### Design Decisions

1. **運動項目範圍**：固定為體適能標準 6 項（身高、體重、坐姿體前彎、立定跳遠、仰臥起坐、心肺耐力）
2. **學生識別方式**：使用「座號 + 姓名」雙重驗證確保資料對應正確
3. **範圍指定**：匯入前需選擇「學校 + 年級 + 班級」以確定資料歸屬
4. **資料策略**：新增記錄（不覆蓋既有資料），用於計算學生個人進步曲線

---

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Download and Use Student List Template (Priority: P1)

老師需要為新班級建立學生名單。老師下載標準化的 Excel 模板，在 Excel 中填寫整班 30 位學生的基本資料（座號、姓名、性別、年級、班級、生日），然後上傳到系統批次建立學生。

**Why this priority**: 這是最基礎的功能。沒有學生名單，就無法進行後續的運動記錄匯入。學期初老師的首要任務就是建立班級名單。

**Independent Test**: 可透過下載模板、填寫 5 位學生資料、上傳並確認學生成功建立來獨立測試。

**Acceptance Scenarios**:

1. **Given** 老師已登入系統且有權限管理學生，**When** 老師點擊「下載學生名單模板」，**Then** 系統下載一個包含正確欄位標題和範例資料的 .xlsx 檔案
2. **Given** 老師已填寫完整的學生名單 Excel，**When** 老師選擇學校並上傳檔案，**Then** 系統顯示預覽畫面，列出所有學生及其驗證狀態
3. **Given** 預覽畫面顯示所有資料正確，**When** 老師點擊「確認匯入」，**Then** 系統建立所有學生並顯示成功訊息

---

### User Story 2 - Download and Use Sport Records Template (Priority: P1)

老師完成體適能測驗後，需要登錄整班學生的測驗成績。老師下載運動記錄模板，在 Excel 中填寫學生的各項體適能測驗成績，然後上傳到系統批次建立運動記錄。

**Why this priority**: 這是本功能的核心價值。老師每次測驗後都需要登錄數十筆資料，批次匯入可節省大量時間。

**Independent Test**: 可透過下載模板、為 3 位已存在的學生填寫 2 項運動成績、上傳並確認記錄成功建立來獨立測試。

**Acceptance Scenarios**:

1. **Given** 老師已登入系統且班級已有學生資料，**When** 老師點擊「下載運動記錄模板」，**Then** 系統下載一個包含體適能 6 項測驗欄位的 .xlsx 模板
2. **Given** 老師已填寫運動記錄 Excel（含座號、姓名、測驗成績、測驗日期），**When** 老師選擇學校、年級、班級並上傳檔案，**Then** 系統驗證座號+姓名是否對應已存在的學生，並顯示預覽
3. **Given** 預覽顯示 25 筆正確、5 筆錯誤（學生不存在），**When** 老師點擊「確認匯入」，**Then** 系統匯入 25 筆正確記錄，並報告 5 筆跳過的錯誤

---

### User Story 3 - Preview and Validate Before Import (Priority: P2)

老師上傳 Excel 後，需要在正式匯入前檢視資料是否正確，包括格式錯誤、資料缺漏、學生不存在等問題。

**Why this priority**: 預覽驗證機制可避免錯誤資料進入系統，但即使沒有此功能，基本的匯入仍可運作（只是錯誤處理較差）。

**Independent Test**: 可透過上傳一個包含正確和錯誤資料的 Excel，確認預覽正確標示各列狀態來獨立測試。

**Acceptance Scenarios**:

1. **Given** 老師上傳的 Excel 中第 5 列座號為空白，**When** 系統解析檔案，**Then** 預覽畫面將第 5 列標示為「錯誤」並顯示「座號為必填欄位」
2. **Given** 老師上傳的運動記錄中座號 15 在該班級不存在，**When** 系統驗證，**Then** 預覽將該列標示為「錯誤」並顯示「找不到座號 15 的學生」
3. **Given** 老師上傳的成績中立定跳遠為 500cm（超出合理範圍），**When** 系統驗證，**Then** 預覽將該列標示為「警告」並顯示「數值偏離常理，請確認」

---

### User Story 4 - View Import Result Summary (Priority: P2)

老師完成匯入後，需要看到匯入結果摘要，了解成功匯入多少筆、跳過多少筆、錯誤原因為何。

**Why this priority**: 結果報告提升使用體驗和信任度，但基本匯入功能可先不依賴此功能。

**Independent Test**: 可透過執行一次包含成功和失敗列的匯入，確認結果報告正確顯示統計數據。

**Acceptance Scenarios**:

1. **Given** 匯入操作完成（30 筆中 28 筆成功、2 筆失敗），**When** 系統顯示結果，**Then** 頁面顯示「成功匯入 28 筆，跳過 2 筆」
2. **Given** 結果報告顯示有失敗的列，**When** 老師查看詳情，**Then** 可看到每筆失敗的列號和具體錯誤原因

---

### User Story 5 - Partial Fill for Sport Records (Priority: P3)

老師可能只完成部分測驗項目（如只測了身高和體重），需要能夠只填寫部分欄位就匯入，空白欄位自動跳過。

**Why this priority**: 彈性填寫提升使用便利性，但初期可要求完整填寫。

**Independent Test**: 可透過上傳只填寫 2 項運動成績（其餘空白）的 Excel，確認系統只建立已填寫的項目記錄。

**Acceptance Scenarios**:

1. **Given** 老師只填寫了身高和體重欄位（其他運動項目空白），**When** 上傳並匯入，**Then** 系統只建立身高和體重的運動記錄
2. **Given** 某列所有運動項目都空白（只有座號和姓名），**When** 系統驗證，**Then** 預覽將該列標示為「警告」並顯示「無運動成績可匯入」

---

### Edge Cases

- **重複座號**：同一份 Excel 中座號重複時，系統應標示錯誤
- **檔案格式錯誤**：上傳非 .xlsx 檔案時，系統應拒絕並提示正確格式
- **空白檔案**：上傳只有標題列沒有資料的檔案時，系統應提示「無資料可匯入」
- **日期格式不一致**：系統應支援常見日期格式（YYYY/MM/DD、YYYY-MM-DD）
- **超大檔案**：單次匯入超過 500 列時，系統應正常處理或提示分批上傳
- **網路中斷**：匯入過程中網路中斷，系統應確保資料一致性（全部成功或全部回滾）

---

## Requirements *(mandatory)*

### Functional Requirements

#### Template Management

- **FR-001**: System MUST provide downloadable Excel template for student list with columns: 座號*, 姓名*, 性別*, 年級*, 班級, 生日 (* = required)
- **FR-002**: System MUST provide downloadable Excel template for sport records with columns: 座號*, 姓名*, 身高(cm), 體重(kg), 坐姿體前彎(cm), 立定跳遠(cm), 仰臥起坐(次/分鐘), 心肺耐力(秒), 測驗日期*
- **FR-003**: Templates MUST include example data rows to guide users
- **FR-004**: Templates MUST use Excel data validation for gender field (dropdown: 男/女)

#### File Upload

- **FR-005**: System MUST accept only .xlsx file format
- **FR-006**: System MUST reject files larger than 5MB
- **FR-007**: System MUST require school selection before student list import
- **FR-008**: System MUST require school, grade, and class selection before sport record import

#### Data Validation

- **FR-009**: System MUST validate required fields are not empty
- **FR-010**: System MUST validate data types (numbers for measurements, dates for test date)
- **FR-011**: System MUST validate grade is between 1-12
- **FR-012**: System MUST validate gender is either "男" or "女" (or "male"/"female")
- **FR-013**: System MUST validate student existence using student_number + name combination for sport records
- **FR-014**: System MUST flag values outside reasonable ranges as warnings (e.g., height > 250cm, weight > 200kg)
- **FR-015**: System MUST detect duplicate student numbers within the same upload file

#### Preview & Confirmation

- **FR-016**: System MUST display preview of all rows before import
- **FR-017**: Preview MUST show validation status for each row (valid/warning/error)
- **FR-018**: Preview MUST show specific error messages for each validation failure
- **FR-019**: System MUST require user confirmation before executing import
- **FR-020**: Users MUST be able to cancel import at preview stage

#### Import Execution

- **FR-021**: System MUST create new records (not overwrite existing) for sport records
- **FR-022**: System MUST skip rows marked as "error" during import
- **FR-023**: System MUST process rows marked as "warning" if user confirms
- **FR-024**: System MUST display import result summary after completion

#### Result Reporting

- **FR-025**: Result summary MUST show count of successfully imported records
- **FR-026**: Result summary MUST show count of skipped records
- **FR-027**: Result summary MUST list each skipped row with its error reason

### Key Entities

- **ImportTemplate**: Represents a downloadable Excel template (type: student_list | sport_record, columns definition, example data)
- **ImportSession**: Represents an import operation (user, timestamp, file name, school/grade/class context, status, row count)
- **ImportRow**: Represents a single row in import preview (row number, raw data, validation status, error messages, final status)
- **ImportResult**: Represents the outcome of an import (session reference, success count, skip count, error details)

---

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Teachers can import a full class roster (30 students) in under 5 minutes (compared to 30+ minutes for manual entry)
- **SC-002**: Teachers can import sport records for a full class (30 students x 6 tests = 180 records) in under 10 minutes
- **SC-003**: 95% of import attempts complete successfully on first try (no system errors)
- **SC-004**: 100% of data validation errors are caught and displayed before import execution
- **SC-005**: Teachers report the feature as "easy to use" or "very easy to use" in at least 80% of feedback
- **SC-006**: Reduce data entry time by at least 80% compared to individual record creation
- **SC-007**: Zero data corruption incidents from batch import operations

---

## Assumptions

1. Teachers have access to Microsoft Excel or compatible spreadsheet software
2. Teachers are familiar with basic Excel operations (filling cells, saving files)
3. Schools have already been created in the system before student import
4. Students have already been created before sport record import
5. Internet connection is stable enough for file upload (under 5MB)
6. One import session handles one class at a time (not cross-class imports)

---

## Out of Scope

- CSV file format support (MVP supports .xlsx only)
- Dynamic/custom sport types (fixed to 6 fitness test items)
- Real-time collaborative editing
- Import history rollback/undo
- Automated scheduling of imports
- Integration with external school management systems
- Mobile-optimized import interface
