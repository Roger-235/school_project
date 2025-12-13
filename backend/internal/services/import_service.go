package services

import (
	"fmt"
	"mime/multipart"
	"path/filepath"
	"strings"
	"time"

	"github.com/google/uuid"
	"github.com/xuri/excelize/v2"
	"gorm.io/gorm"

	"github.com/wei979/ICACP/backend/internal/models"
)

// ImportService handles Excel import operations
type ImportService struct {
	db    *gorm.DB
	store *PreviewStore
}

// NewImportService creates a new ImportService
func NewImportService(db *gorm.DB) *ImportService {
	return &ImportService{
		db:    db,
		store: NewPreviewStore(15 * time.Minute), // 15 minute TTL
	}
}

// ValidateFileFormat checks if the file is a valid .xlsx file
func (s *ImportService) ValidateFileFormat(filename string) error {
	ext := strings.ToLower(filepath.Ext(filename))
	if ext != ".xlsx" {
		return fmt.Errorf("僅支援 .xlsx 格式的 Excel 檔案")
	}
	return nil
}

// ValidateFileSize checks if file size is within limit (5MB)
func (s *ImportService) ValidateFileSize(size int64) error {
	maxSize := int64(5 * 1024 * 1024) // 5MB
	if size > maxSize {
		return fmt.Errorf("檔案大小不可超過 5MB")
	}
	return nil
}

// PreviewStudentImport parses and validates student Excel file
func (s *ImportService) PreviewStudentImport(file multipart.File, filename string, schoolID uint) (*models.ImportPreview, error) {
	// Verify school exists
	var school models.School
	if err := s.db.First(&school, schoolID).Error; err != nil {
		return nil, fmt.Errorf("找不到 ID 為 %d 的學校", schoolID)
	}

	// Open Excel file
	f, err := excelize.OpenReader(file)
	if err != nil {
		return nil, fmt.Errorf("無法解析 Excel 檔案: %w", err)
	}
	defer f.Close()

	// Get first sheet
	sheetName := f.GetSheetName(0)
	if sheetName == "" {
		return nil, fmt.Errorf("Excel 檔案沒有工作表")
	}

	// Read all rows
	rows, err := f.GetRows(sheetName)
	if err != nil {
		return nil, fmt.Errorf("無法讀取工作表: %w", err)
	}

	// Validate we have data
	if len(rows) < 2 {
		return nil, fmt.Errorf("Excel 檔案沒有資料列（僅有標題或為空）")
	}

	// Validate header row
	if err := s.validateStudentHeaders(rows[0]); err != nil {
		return nil, err
	}

	// Create preview
	preview := &models.ImportPreview{
		ID:       uuid.New().String(),
		Type:     models.ImportTypeStudents,
		SchoolID: schoolID,
		FileName: filename,
		Rows:     make([]models.ImportRow, 0),
	}

	// Track student numbers for duplicate detection
	studentNumbers := make(map[string]int) // value -> row number

	// Parse and validate each row
	for i, row := range rows[1:] {
		rowNum := i + 2 // Excel rows start at 1, skip header
		importRow := s.validateStudentRow(rowNum, row, studentNumbers)
		preview.Rows = append(preview.Rows, importRow)

		// Update counts
		switch importRow.Status {
		case models.RowStatusValid:
			preview.ValidRows++
		case models.RowStatusWarning:
			preview.WarningRows++
		case models.RowStatusError:
			preview.ErrorRows++
		}
	}

	preview.TotalRows = len(preview.Rows)

	// Store preview
	s.store.Set(preview.ID, preview)

	return preview, nil
}

// validateStudentHeaders checks if the header row matches expected format
func (s *ImportService) validateStudentHeaders(headers []string) error {
	expected := models.StudentTemplateHeaders
	if len(headers) < len(expected) {
		return fmt.Errorf("Excel 標題列格式不正確，請使用系統提供的模板")
	}

	// Check first few required columns
	for i := 0; i < 4; i++ { // Check 座號, 姓名, 性別, 年級
		if !strings.Contains(headers[i], strings.TrimSuffix(expected[i], "*")) {
			return fmt.Errorf("Excel 標題列格式不正確，請使用系統提供的模板")
		}
	}

	return nil
}

// validateStudentRow validates a single student row
func (s *ImportService) validateStudentRow(rowNum int, row []string, studentNumbers map[string]int) models.ImportRow {
	importRow := models.ImportRow{
		RowNumber: rowNum,
		Status:    models.RowStatusValid,
		Data:      make(map[string]interface{}),
		Errors:    make([]models.RowError, 0),
	}

	// Extract values
	studentNumber := TrimString(GetCellValue(row, 0))
	name := TrimString(GetCellValue(row, 1))
	genderRaw := TrimString(GetCellValue(row, 2))
	gradeRaw := TrimString(GetCellValue(row, 3))
	class := TrimString(GetCellValue(row, 4))
	birthDateRaw := TrimString(GetCellValue(row, 5))

	// Store raw data
	importRow.Data["student_number"] = studentNumber
	importRow.Data["name"] = name
	importRow.Data["gender"] = genderRaw
	importRow.Data["grade"] = gradeRaw
	importRow.Data["class"] = class
	importRow.Data["birth_date"] = birthDateRaw

	// Validate student number (required)
	if err := ValidateStudentNumber(studentNumber); err != nil {
		importRow.Errors = append(importRow.Errors, models.RowError{
			Field:   "student_number",
			Code:    models.ErrorCodeRequired,
			Message: err.Error(),
			Level:   "error",
		})
		importRow.Status = models.RowStatusError
	} else {
		// Check for duplicates within file
		if prevRow, exists := studentNumbers[studentNumber]; exists {
			importRow.Errors = append(importRow.Errors, models.RowError{
				Field:   "student_number",
				Code:    models.ErrorCodeDuplicate,
				Message: fmt.Sprintf("座號 %s 重複（與第 %d 列）", studentNumber, prevRow),
				Level:   "error",
			})
			importRow.Status = models.RowStatusError
		} else {
			studentNumbers[studentNumber] = rowNum
		}
	}

	// Validate name (required)
	if err := ValidateName(name); err != nil {
		importRow.Errors = append(importRow.Errors, models.RowError{
			Field:   "name",
			Code:    models.ErrorCodeRequired,
			Message: err.Error(),
			Level:   "error",
		})
		importRow.Status = models.RowStatusError
	}

	// Validate gender (required)
	if IsEmpty(genderRaw) {
		importRow.Errors = append(importRow.Errors, models.RowError{
			Field:   "gender",
			Code:    models.ErrorCodeRequired,
			Message: "性別為必填欄位",
			Level:   "error",
		})
		importRow.Status = models.RowStatusError
	} else {
		gender, err := NormalizeGender(genderRaw)
		if err != nil {
			importRow.Errors = append(importRow.Errors, models.RowError{
				Field:   "gender",
				Code:    models.ErrorCodeInvalidValue,
				Message: err.Error(),
				Level:   "error",
			})
			importRow.Status = models.RowStatusError
		} else {
			importRow.Data["gender_normalized"] = gender
		}
	}

	// Validate grade (required)
	if IsEmpty(gradeRaw) {
		importRow.Errors = append(importRow.Errors, models.RowError{
			Field:   "grade",
			Code:    models.ErrorCodeRequired,
			Message: "年級為必填欄位",
			Level:   "error",
		})
		importRow.Status = models.RowStatusError
	} else {
		grade, err := ParseInt(gradeRaw)
		if err != nil {
			importRow.Errors = append(importRow.Errors, models.RowError{
				Field:   "grade",
				Code:    models.ErrorCodeInvalidType,
				Message: "年級必須是數字",
				Level:   "error",
			})
			importRow.Status = models.RowStatusError
		} else if err := ValidateGrade(grade); err != nil {
			importRow.Errors = append(importRow.Errors, models.RowError{
				Field:   "grade",
				Code:    models.ErrorCodeOutOfRange,
				Message: err.Error(),
				Level:   "error",
			})
			importRow.Status = models.RowStatusError
		} else {
			importRow.Data["grade_parsed"] = grade
		}
	}

	// Validate class (optional)
	if !IsEmpty(class) {
		if err := ValidateClass(class); err != nil {
			importRow.Errors = append(importRow.Errors, models.RowError{
				Field:   "class",
				Code:    models.ErrorCodeMaxLength,
				Message: err.Error(),
				Level:   "error",
			})
			importRow.Status = models.RowStatusError
		}
	}

	// Validate birth date (optional)
	if !IsEmpty(birthDateRaw) {
		birthDate, err := ParseDate(birthDateRaw)
		if err != nil {
			importRow.Errors = append(importRow.Errors, models.RowError{
				Field:   "birth_date",
				Code:    models.ErrorCodeInvalidFormat,
				Message: "生日格式無效",
				Level:   "error",
			})
			importRow.Status = models.RowStatusError
		} else {
			importRow.Data["birth_date_parsed"] = birthDate
		}
	}

	return importRow
}

// ExecuteStudentImport creates students from a validated preview
func (s *ImportService) ExecuteStudentImport(previewID string, includeWarnings bool) (*models.ImportResult, error) {
	// Get preview
	preview := s.store.Get(previewID)
	if preview == nil {
		return nil, fmt.Errorf("預覽資料不存在或已過期，請重新上傳檔案")
	}

	// Check if already executed
	if s.store.IsExecuted(previewID) {
		return nil, fmt.Errorf("此預覽已被執行，請重新上傳檔案")
	}

	// Verify it's a student import
	if preview.Type != models.ImportTypeStudents {
		return nil, fmt.Errorf("預覽類型不正確")
	}

	result := &models.ImportResult{
		PreviewID:    previewID,
		Type:         models.ImportTypeStudents,
		SuccessCount: 0,
		SkipCount:    0,
		Errors:       make([]models.ImportedError, 0),
		ExecutedAt:   time.Now(),
	}

	// Execute in transaction
	err := s.db.Transaction(func(tx *gorm.DB) error {
		for _, row := range preview.Rows {
			// Skip error rows
			if row.Status == models.RowStatusError {
				result.SkipCount++
				if len(row.Errors) > 0 {
					result.Errors = append(result.Errors, models.ImportedError{
						RowNumber: row.RowNumber,
						Field:     row.Errors[0].Field,
						Message:   row.Errors[0].Message,
					})
				}
				continue
			}

			// Skip warning rows if not included
			if row.Status == models.RowStatusWarning && !includeWarnings {
				result.SkipCount++
				if len(row.Errors) > 0 {
					result.Errors = append(result.Errors, models.ImportedError{
						RowNumber: row.RowNumber,
						Field:     row.Errors[0].Field,
						Message:   row.Errors[0].Message + " (警告被跳過)",
					})
				}
				continue
			}

			// Create student
			student := models.Student{
				SchoolID:      preview.SchoolID,
				StudentNumber: row.Data["student_number"].(string),
				Name:          row.Data["name"].(string),
				Gender:        row.Data["gender_normalized"].(string),
				Grade:         row.Data["grade_parsed"].(int),
				Class:         row.Data["class"].(string),
			}

			// Set birth date if parsed
			if birthDate, ok := row.Data["birth_date_parsed"].(time.Time); ok {
				student.BirthDate = &birthDate
			}

			if err := tx.Create(&student).Error; err != nil {
				return fmt.Errorf("建立學生失敗（第 %d 列）: %w", row.RowNumber, err)
			}

			result.SuccessCount++
		}

		return nil
	})

	if err != nil {
		return nil, err
	}

	// Mark preview as executed
	s.store.MarkExecuted(previewID)

	return result, nil
}

// GetPreview retrieves a preview by ID
func (s *ImportService) GetPreview(previewID string) *models.ImportPreview {
	return s.store.Get(previewID)
}

// CancelPreview removes a preview
func (s *ImportService) CancelPreview(previewID string) bool {
	return s.store.Delete(previewID)
}

// PreviewRecordsImport parses and validates sport records Excel file
func (s *ImportService) PreviewRecordsImport(file multipart.File, filename string, schoolID uint, grade int, class string) (*models.ImportPreview, error) {
	// Verify school exists
	var school models.School
	if err := s.db.First(&school, schoolID).Error; err != nil {
		return nil, fmt.Errorf("找不到 ID 為 %d 的學校", schoolID)
	}

	// Open Excel file
	f, err := excelize.OpenReader(file)
	if err != nil {
		return nil, fmt.Errorf("無法解析 Excel 檔案: %w", err)
	}
	defer f.Close()

	// Get first sheet
	sheetName := f.GetSheetName(0)
	if sheetName == "" {
		return nil, fmt.Errorf("Excel 檔案沒有工作表")
	}

	// Read all rows
	rows, err := f.GetRows(sheetName)
	if err != nil {
		return nil, fmt.Errorf("無法讀取工作表: %w", err)
	}

	// Validate we have data
	if len(rows) < 2 {
		return nil, fmt.Errorf("Excel 檔案沒有資料列（僅有標題或為空）")
	}

	// Validate header row
	if err := s.validateRecordsHeaders(rows[0]); err != nil {
		return nil, err
	}

	// Load students for the specified school/grade/class for validation
	var students []models.Student
	query := s.db.Where("school_id = ? AND grade = ?", schoolID, grade)
	if class != "" {
		query = query.Where("class = ?", class)
	}
	if err := query.Find(&students).Error; err != nil {
		return nil, fmt.Errorf("無法載入學生資料: %w", err)
	}

	// Build student lookup map (student_number + name -> student)
	studentMap := make(map[string]*models.Student)
	for i := range students {
		key := fmt.Sprintf("%s|%s", students[i].StudentNumber, students[i].Name)
		studentMap[key] = &students[i]
	}

	// Create preview
	preview := &models.ImportPreview{
		ID:       uuid.New().String(),
		Type:     models.ImportTypeRecords,
		SchoolID: schoolID,
		Grade:    grade,
		Class:    class,
		FileName: filename,
		Rows:     make([]models.ImportRow, 0),
	}

	// Parse and validate each row
	for i, row := range rows[1:] {
		rowNum := i + 2
		importRow := s.validateRecordRow(rowNum, row, studentMap)
		preview.Rows = append(preview.Rows, importRow)

		switch importRow.Status {
		case models.RowStatusValid:
			preview.ValidRows++
		case models.RowStatusWarning:
			preview.WarningRows++
		case models.RowStatusError:
			preview.ErrorRows++
		}
	}

	preview.TotalRows = len(preview.Rows)

	// Store preview
	s.store.Set(preview.ID, preview)

	return preview, nil
}

// validateRecordsHeaders checks if the header row matches expected format
func (s *ImportService) validateRecordsHeaders(headers []string) error {
	expected := models.RecordsTemplateHeaders
	if len(headers) < len(expected) {
		return fmt.Errorf("Excel 標題列格式不正確，請使用系統提供的模板")
	}

	// Check first two required columns (座號, 姓名)
	for i := 0; i < 2; i++ {
		if !strings.Contains(headers[i], strings.TrimSuffix(expected[i], "*")) {
			return fmt.Errorf("Excel 標題列格式不正確，請使用系統提供的模板")
		}
	}

	return nil
}

// validateRecordRow validates a single sport record row
func (s *ImportService) validateRecordRow(rowNum int, row []string, studentMap map[string]*models.Student) models.ImportRow {
	importRow := models.ImportRow{
		RowNumber: rowNum,
		Status:    models.RowStatusValid,
		Data:      make(map[string]interface{}),
		Errors:    make([]models.RowError, 0),
	}

	// Extract values
	studentNumber := TrimString(GetCellValue(row, 0))
	name := TrimString(GetCellValue(row, 1))
	heightRaw := TrimString(GetCellValue(row, 2))
	weightRaw := TrimString(GetCellValue(row, 3))
	sitReachRaw := TrimString(GetCellValue(row, 4))
	standingJumpRaw := TrimString(GetCellValue(row, 5))
	sitUpsRaw := TrimString(GetCellValue(row, 6))
	cardioRaw := TrimString(GetCellValue(row, 7))
	testDateRaw := TrimString(GetCellValue(row, 8))

	// Store raw data
	importRow.Data["student_number"] = studentNumber
	importRow.Data["name"] = name
	importRow.Data["height"] = heightRaw
	importRow.Data["weight"] = weightRaw
	importRow.Data["sit_reach"] = sitReachRaw
	importRow.Data["standing_jump"] = standingJumpRaw
	importRow.Data["sit_ups"] = sitUpsRaw
	importRow.Data["cardio"] = cardioRaw
	importRow.Data["test_date"] = testDateRaw

	// Validate student number (required)
	if IsEmpty(studentNumber) {
		importRow.Errors = append(importRow.Errors, models.RowError{
			Field:   "student_number",
			Code:    models.ErrorCodeRequired,
			Message: "座號為必填欄位",
			Level:   "error",
		})
		importRow.Status = models.RowStatusError
	}

	// Validate name (required)
	if IsEmpty(name) {
		importRow.Errors = append(importRow.Errors, models.RowError{
			Field:   "name",
			Code:    models.ErrorCodeRequired,
			Message: "姓名為必填欄位",
			Level:   "error",
		})
		importRow.Status = models.RowStatusError
	}

	// Validate student exists
	if !IsEmpty(studentNumber) && !IsEmpty(name) {
		key := fmt.Sprintf("%s|%s", studentNumber, name)
		if student, exists := studentMap[key]; exists {
			importRow.Data["student_id"] = student.ID
		} else {
			importRow.Errors = append(importRow.Errors, models.RowError{
				Field:   "student",
				Code:    models.ErrorCodeNotFound,
				Message: fmt.Sprintf("找不到座號 %s 姓名 %s 的學生", studentNumber, name),
				Level:   "error",
			})
			importRow.Status = models.RowStatusError
		}
	}

	// Validate test date (required)
	if IsEmpty(testDateRaw) {
		importRow.Errors = append(importRow.Errors, models.RowError{
			Field:   "test_date",
			Code:    models.ErrorCodeRequired,
			Message: "測驗日期為必填欄位",
			Level:   "error",
		})
		importRow.Status = models.RowStatusError
	} else {
		testDate, err := ParseDate(testDateRaw)
		if err != nil {
			importRow.Errors = append(importRow.Errors, models.RowError{
				Field:   "test_date",
				Code:    models.ErrorCodeInvalidFormat,
				Message: "測驗日期格式無效",
				Level:   "error",
			})
			importRow.Status = models.RowStatusError
		} else {
			importRow.Data["test_date_parsed"] = testDate
		}
	}

	// Parse and validate sport values
	sportValues := map[string]string{
		"身高":     heightRaw,
		"體重":     weightRaw,
		"坐姿體前彎": sitReachRaw,
		"立定跳遠":  standingJumpRaw,
		"仰臥起坐":  sitUpsRaw,
		"心肺耐力":  cardioRaw,
	}

	hasAnyValue := false
	parsedValues := make(map[string]float64)

	for sportName, rawValue := range sportValues {
		if IsEmpty(rawValue) {
			continue
		}
		hasAnyValue = true

		value, err := ParseFloat(rawValue)
		if err != nil {
			importRow.Errors = append(importRow.Errors, models.RowError{
				Field:   sportName,
				Code:    models.ErrorCodeInvalidType,
				Message: fmt.Sprintf("%s必須是數字", sportName),
				Level:   "error",
			})
			importRow.Status = models.RowStatusError
			continue
		}

		// Check reasonable range (warning only)
		if rangeCheck, exists := models.SportValueRanges[sportName]; exists {
			if value < rangeCheck.Min || value > rangeCheck.Max {
				importRow.Errors = append(importRow.Errors, models.RowError{
					Field:   sportName,
					Code:    models.ErrorCodeOutOfRange,
					Message: fmt.Sprintf("%s %.1f 超出合理範圍，請確認", sportName, value),
					Level:   "warning",
				})
				if importRow.Status == models.RowStatusValid {
					importRow.Status = models.RowStatusWarning
				}
			}
		}

		parsedValues[sportName] = value
	}

	importRow.Data["sport_values"] = parsedValues

	// Check if any sport values exist
	if !hasAnyValue && importRow.Status != models.RowStatusError {
		importRow.Errors = append(importRow.Errors, models.RowError{
			Field:   "sports",
			Code:    models.ErrorCodeNoData,
			Message: "無運動成績可匯入",
			Level:   "warning",
		})
		if importRow.Status == models.RowStatusValid {
			importRow.Status = models.RowStatusWarning
		}
	}

	return importRow
}

// ExecuteRecordsImport creates sport records from a validated preview
func (s *ImportService) ExecuteRecordsImport(previewID string, includeWarnings bool) (*models.ImportResult, error) {
	// Get preview
	preview := s.store.Get(previewID)
	if preview == nil {
		return nil, fmt.Errorf("預覽資料不存在或已過期，請重新上傳檔案")
	}

	// Check if already executed
	if s.store.IsExecuted(previewID) {
		return nil, fmt.Errorf("此預覽已被執行，請重新上傳檔案")
	}

	// Verify it's a records import
	if preview.Type != models.ImportTypeRecords {
		return nil, fmt.Errorf("預覽類型不正確")
	}

	result := &models.ImportResult{
		PreviewID:    previewID,
		Type:         models.ImportTypeRecords,
		SuccessCount: 0,
		SkipCount:    0,
		Errors:       make([]models.ImportedError, 0),
		ExecutedAt:   time.Now(),
	}

	// Execute in transaction
	err := s.db.Transaction(func(tx *gorm.DB) error {
		for _, row := range preview.Rows {
			// Skip error rows
			if row.Status == models.RowStatusError {
				result.SkipCount++
				if len(row.Errors) > 0 {
					result.Errors = append(result.Errors, models.ImportedError{
						RowNumber: row.RowNumber,
						Field:     row.Errors[0].Field,
						Message:   row.Errors[0].Message,
					})
				}
				continue
			}

			// Skip warning rows if not included
			if row.Status == models.RowStatusWarning && !includeWarnings {
				result.SkipCount++
				if len(row.Errors) > 0 {
					result.Errors = append(result.Errors, models.ImportedError{
						RowNumber: row.RowNumber,
						Field:     row.Errors[0].Field,
						Message:   row.Errors[0].Message + " (警告被跳過)",
					})
				}
				continue
			}

			// Get student ID and test date
			studentID, ok := row.Data["student_id"].(uint)
			if !ok {
				continue
			}

			testDate, ok := row.Data["test_date_parsed"].(time.Time)
			if !ok {
				continue
			}

			// Get parsed sport values
			sportValues, ok := row.Data["sport_values"].(map[string]float64)
			if !ok {
				continue
			}

			// Create a sport record for each non-empty value
			for sportName, value := range sportValues {
				sportTypeID, exists := models.SportTypeMapping[sportName]
				if !exists {
					continue
				}

				record := models.SportRecord{
					StudentID:   studentID,
					SportTypeID: sportTypeID,
					Value:       value,
					TestDate:    testDate,
					Notes:       fmt.Sprintf("批次匯入 - %s", preview.FileName),
				}

				if err := tx.Create(&record).Error; err != nil {
					return fmt.Errorf("建立運動記錄失敗（第 %d 列）: %w", row.RowNumber, err)
				}

				result.SuccessCount++
			}
		}

		return nil
	})

	if err != nil {
		return nil, err
	}

	// Mark preview as executed
	s.store.MarkExecuted(previewID)

	return result, nil
}
