package services

import (
	"fmt"
	"time"

	"github.com/wei979/ICACP/backend/internal/models"
	"gorm.io/gorm"
)

// SportRecordService handles business logic for sport record operations
type SportRecordService struct {
	db *gorm.DB
}

// NewSportRecordService creates a new SportRecordService instance
func NewSportRecordService(db *gorm.DB) *SportRecordService {
	return &SportRecordService{
		db: db,
	}
}

// List retrieves sport records for a student with pagination
func (s *SportRecordService) List(studentID uint, page, pageSize int) ([]models.SportRecord, *models.Pagination, error) {
	if page < 1 {
		page = 1
	}
	if pageSize < 1 || pageSize > 100 {
		pageSize = 20
	}

	var records []models.SportRecord
	var total int64

	// Count total records for the student
	if err := s.db.Model(&models.SportRecord{}).Where("student_id = ?", studentID).Count(&total).Error; err != nil {
		return nil, nil, fmt.Errorf("failed to count records: %w", err)
	}

	// Calculate pagination
	offset := (page - 1) * pageSize
	totalPages := int((total + int64(pageSize) - 1) / int64(pageSize))

	// Fetch records with sport type info
	err := s.db.Where("student_id = ?", studentID).
		Preload("SportType").
		Offset(offset).
		Limit(pageSize).
		Order("test_date DESC, created_at DESC").
		Find(&records).Error

	if err != nil {
		return nil, nil, fmt.Errorf("failed to list records: %w", err)
	}

	pagination := &models.Pagination{
		Page:       page,
		PageSize:   pageSize,
		Total:      int(total),
		TotalPages: totalPages,
	}

	return records, pagination, nil
}

// ListBySportType retrieves sport records for a student filtered by sport type
func (s *SportRecordService) ListBySportType(studentID, sportTypeID uint) ([]models.SportRecord, error) {
	var records []models.SportRecord
	err := s.db.Where("student_id = ? AND sport_type_id = ?", studentID, sportTypeID).
		Preload("SportType").
		Order("test_date DESC").
		Find(&records).Error

	if err != nil {
		return nil, fmt.Errorf("failed to list records by sport type: %w", err)
	}

	return records, nil
}

// StudentScoreResult represents a student with their score in a specific sport type
type StudentScoreResult struct {
	StudentID   uint    `json:"student_id"`
	StudentName string  `json:"student_name"`
	Grade       int     `json:"grade"`
	Class       *string `json:"class"`
	Gender      string  `json:"gender"`
	Value       *float64 `json:"value"` // nil if no record
	TestDate    *string `json:"test_date"`
	RecordID    *uint   `json:"record_id"`
}

// GetStudentScoresBySportType retrieves scores for multiple students in a specific sport type
// Returns the latest record for each student, including students with no records
func (s *SportRecordService) GetStudentScoresBySportType(studentIDs []uint, sportTypeID uint) ([]StudentScoreResult, error) {
	if len(studentIDs) == 0 {
		return []StudentScoreResult{}, nil
	}

	// First, get all students info
	var students []models.Student
	err := s.db.Where("id IN ?", studentIDs).Find(&students).Error
	if err != nil {
		return nil, fmt.Errorf("failed to fetch students: %w", err)
	}

	// Create a map of student ID to student info
	studentMap := make(map[uint]models.Student)
	for _, student := range students {
		studentMap[student.ID] = student
	}

	// Get the latest record for each student in this sport type
	var records []models.SportRecord
	err = s.db.Where("student_id IN ? AND sport_type_id = ?", studentIDs, sportTypeID).
		Order("test_date DESC, created_at DESC").
		Find(&records).Error
	if err != nil {
		return nil, fmt.Errorf("failed to fetch records: %w", err)
	}

	// Create a map to store the latest record for each student
	latestRecordMap := make(map[uint]models.SportRecord)
	for _, record := range records {
		if _, exists := latestRecordMap[record.StudentID]; !exists {
			latestRecordMap[record.StudentID] = record
		}
	}

	// Build results including students with no records
	results := make([]StudentScoreResult, 0, len(studentIDs))
	for _, studentID := range studentIDs {
		student, studentExists := studentMap[studentID]
		if !studentExists {
			continue // Skip if student not found
		}

		// Create a copy of class for pointer
		classValue := student.Class
		result := StudentScoreResult{
			StudentID:   student.ID,
			StudentName: student.Name,
			Grade:       student.Grade,
			Class:       &classValue,
			Gender:      student.Gender,
		}

		// Add record data if exists
		if record, hasRecord := latestRecordMap[studentID]; hasRecord {
			result.Value = &record.Value
			result.RecordID = &record.ID
			testDate := record.TestDate.Format("2006-01-02")
			result.TestDate = &testDate
		}

		results = append(results, result)
	}

	return results, nil
}

// GetByID retrieves a sport record by ID
func (s *SportRecordService) GetByID(id uint) (*models.SportRecord, error) {
	var record models.SportRecord
	err := s.db.Preload("SportType").Preload("Student.School").First(&record, id).Error
	if err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, fmt.Errorf("sport record not found")
		}
		return nil, fmt.Errorf("failed to get sport record: %w", err)
	}
	return &record, nil
}

// Create creates a new sport record
func (s *SportRecordService) Create(req *models.CreateSportRecordRequest) (*models.SportRecord, error) {
	// Validate student exists
	var student models.Student
	if err := s.db.First(&student, req.StudentID).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, fmt.Errorf("學生不存在")
		}
		return nil, fmt.Errorf("failed to check student: %w", err)
	}

	// Validate sport type exists
	var sportType models.SportType
	if err := s.db.First(&sportType, req.SportTypeID).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, fmt.Errorf("運動項目不存在")
		}
		return nil, fmt.Errorf("failed to check sport type: %w", err)
	}

	// Parse and validate test date
	testDate, err := time.Parse("2006-01-02", req.TestDate)
	if err != nil {
		return nil, fmt.Errorf("日期格式錯誤，請使用 YYYY-MM-DD 格式")
	}

	// Validate no future dates
	if testDate.After(time.Now()) {
		return nil, fmt.Errorf("測驗日期不能是未來日期")
	}

	// Validate value is positive
	if req.Value <= 0 {
		return nil, fmt.Errorf("數值必須大於零")
	}

	record := &models.SportRecord{
		StudentID:   req.StudentID,
		SportTypeID: req.SportTypeID,
		Value:       req.Value,
		TestDate:    testDate,
		Notes:       req.Notes,
	}

	if err := s.db.Create(record).Error; err != nil {
		return nil, fmt.Errorf("failed to create sport record: %w", err)
	}

	// Reload with relations
	s.db.Preload("SportType").First(record, record.ID)

	return record, nil
}

// Update updates an existing sport record and creates audit trail
func (s *SportRecordService) Update(id uint, req *models.UpdateSportRecordRequest, changedByUserID uint) (*models.SportRecord, error) {
	var record models.SportRecord
	if err := s.db.First(&record, id).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, fmt.Errorf("sport record not found")
		}
		return nil, fmt.Errorf("failed to get sport record: %w", err)
	}

	// Parse and validate test date
	testDate, err := time.Parse("2006-01-02", req.TestDate)
	if err != nil {
		return nil, fmt.Errorf("日期格式錯誤，請使用 YYYY-MM-DD 格式")
	}

	// Validate no future dates
	if testDate.After(time.Now()) {
		return nil, fmt.Errorf("測驗日期不能是未來日期")
	}

	// Validate value is positive
	if req.Value <= 0 {
		return nil, fmt.Errorf("數值必須大於零")
	}

	// Start transaction
	tx := s.db.Begin()

	// Create audit trail if value changed
	if record.Value != req.Value {
		audit := &models.SportRecordAudit{
			SportRecordID: record.ID,
			OldValue:      &record.Value,
			NewValue:      &req.Value,
			ChangedBy:     changedByUserID,
			Reason:        req.Reason,
		}

		if err := tx.Create(audit).Error; err != nil {
			tx.Rollback()
			return nil, fmt.Errorf("failed to create audit trail: %w", err)
		}
	}

	// Update record
	record.Value = req.Value
	record.TestDate = testDate
	record.Notes = req.Notes

	if err := tx.Save(&record).Error; err != nil {
		tx.Rollback()
		return nil, fmt.Errorf("failed to update sport record: %w", err)
	}

	tx.Commit()

	// Reload with relations
	s.db.Preload("SportType").First(&record, id)

	return &record, nil
}

// Delete soft deletes a sport record
func (s *SportRecordService) Delete(id uint) error {
	var record models.SportRecord
	if err := s.db.First(&record, id).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return fmt.Errorf("sport record not found")
		}
		return fmt.Errorf("failed to get sport record: %w", err)
	}

	if err := s.db.Delete(&record).Error; err != nil {
		return fmt.Errorf("failed to delete sport record: %w", err)
	}

	return nil
}

// GetHistory retrieves audit history for a sport record
func (s *SportRecordService) GetHistory(recordID uint) ([]models.SportRecordAudit, error) {
	var audits []models.SportRecordAudit
	err := s.db.Where("sport_record_id = ?", recordID).
		Order("changed_at DESC").
		Find(&audits).Error

	if err != nil {
		return nil, fmt.Errorf("failed to get record history: %w", err)
	}

	return audits, nil
}

// GetTrendData retrieves sport records for trend analysis (for a specific sport type)
func (s *SportRecordService) GetTrendData(studentID, sportTypeID uint) ([]models.SportRecord, error) {
	var records []models.SportRecord
	err := s.db.Where("student_id = ? AND sport_type_id = ?", studentID, sportTypeID).
		Preload("SportType").
		Order("test_date ASC").
		Find(&records).Error

	if err != nil {
		return nil, fmt.Errorf("failed to get trend data: %w", err)
	}

	return records, nil
}

// GetStudentSummary retrieves a summary of sport records by sport type for a student
func (s *SportRecordService) GetStudentSummary(studentID uint) (map[uint]int, error) {
	type Result struct {
		SportTypeID uint
		Count       int
	}

	var results []Result
	err := s.db.Model(&models.SportRecord{}).
		Select("sport_type_id, COUNT(*) as count").
		Where("student_id = ?", studentID).
		Group("sport_type_id").
		Scan(&results).Error

	if err != nil {
		return nil, fmt.Errorf("failed to get student summary: %w", err)
	}

	summary := make(map[uint]int)
	for _, r := range results {
		summary[r.SportTypeID] = r.Count
	}

	return summary, nil
}

// ProgressAnalysis represents the progress/regress analysis result
type ProgressAnalysis struct {
	StudentID      uint    `json:"student_id"`
	SportTypeID    uint    `json:"sport_type_id"`
	SportTypeName  string  `json:"sport_type_name"`
	FirstValue     float64 `json:"first_value"`
	LastValue      float64 `json:"last_value"`
	Change         float64 `json:"change"`
	ChangePercent  float64 `json:"change_percent"`
	IsImprovement  bool    `json:"is_improvement"`
	RecordCount    int     `json:"record_count"`
	ValueType      string  `json:"value_type"`
	Unit           string  `json:"unit"`
}

// CalculateProgress calculates progress/regress for a student's sport type records (T074)
func (s *SportRecordService) CalculateProgress(studentID, sportTypeID uint) (*ProgressAnalysis, error) {
	records, err := s.GetTrendData(studentID, sportTypeID)
	if err != nil {
		return nil, err
	}

	if len(records) < 2 {
		return nil, fmt.Errorf("需要至少 2 筆記錄才能進行分析")
	}

	firstRecord := records[0]
	lastRecord := records[len(records)-1]
	change := lastRecord.Value - firstRecord.Value
	changePercent := (change / firstRecord.Value) * 100

	// Determine if this is an improvement based on value type
	// For time-based records (lower is better), negative change = improvement
	// For distance/count (higher is better), positive change = improvement
	var isImprovement bool
	if firstRecord.SportType.ValueType == "time" {
		isImprovement = change < 0 // Lower time = better
	} else {
		isImprovement = change > 0 // Higher distance/count = better
	}

	return &ProgressAnalysis{
		StudentID:      studentID,
		SportTypeID:    sportTypeID,
		SportTypeName:  firstRecord.SportType.Name,
		FirstValue:     firstRecord.Value,
		LastValue:      lastRecord.Value,
		Change:         change,
		ChangePercent:  changePercent,
		IsImprovement:  isImprovement,
		RecordCount:    len(records),
		ValueType:      firstRecord.SportType.ValueType,
		Unit:           firstRecord.SportType.DefaultUnit,
	}, nil
}

// SchoolRanking represents a student's ranking in school for a sport type
type SchoolRanking struct {
	Rank        int     `json:"rank"`
	StudentID   uint    `json:"student_id"`
	StudentName string  `json:"student_name"`
	Grade       int     `json:"grade"`
	Class       string  `json:"class"`
	BestValue   float64 `json:"best_value"`
	TestDate    string  `json:"test_date"`
}

// SchoolRankingResult represents the full ranking result
type SchoolRankingResult struct {
	SchoolID      uint            `json:"school_id"`
	SchoolName    string          `json:"school_name"`
	SportTypeID   uint            `json:"sport_type_id"`
	SportTypeName string          `json:"sport_type_name"`
	ValueType     string          `json:"value_type"`
	Unit          string          `json:"unit"`
	TotalStudents int             `json:"total_students"`
	Rankings      []SchoolRanking `json:"rankings"`
}

// GetSchoolRanking retrieves ranking of students in a school for a specific sport type (T075)
func (s *SportRecordService) GetSchoolRanking(schoolID, sportTypeID uint, limit int) (*SchoolRankingResult, error) {
	if limit <= 0 {
		limit = 10
	}

	// Get school info
	var school models.School
	if err := s.db.First(&school, schoolID).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, fmt.Errorf("學校不存在")
		}
		return nil, fmt.Errorf("failed to get school: %w", err)
	}

	// Get sport type info
	var sportType models.SportType
	if err := s.db.First(&sportType, sportTypeID).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, fmt.Errorf("運動項目不存在")
		}
		return nil, fmt.Errorf("failed to get sport type: %w", err)
	}

	// Determine order direction based on value type
	orderDir := "DESC" // Higher is better for distance/count
	if sportType.ValueType == "time" {
		orderDir = "ASC" // Lower is better for time
	}

	// Query for best records per student in the school
	type RankResult struct {
		StudentID   uint
		StudentName string
		Grade       int
		Class       string
		BestValue   float64
		TestDate    time.Time
	}

	var results []RankResult
	subQuery := s.db.Model(&models.SportRecord{}).
		Select("student_id, MIN(value) as best_value").
		Where("sport_type_id = ?", sportTypeID).
		Group("student_id")

	if sportType.ValueType != "time" {
		subQuery = s.db.Model(&models.SportRecord{}).
			Select("student_id, MAX(value) as best_value").
			Where("sport_type_id = ?", sportTypeID).
			Group("student_id")
	}

	err := s.db.Table("students").
		Select("students.id as student_id, students.name as student_name, students.grade, students.class, sr.value as best_value, sr.test_date").
		Joins("JOIN (?) as best ON students.id = best.student_id", subQuery).
		Joins("JOIN sport_records sr ON sr.student_id = students.id AND sr.sport_type_id = ? AND sr.value = best.best_value", sportTypeID).
		Where("students.school_id = ? AND students.deleted_at IS NULL", schoolID).
		Order("best_value " + orderDir).
		Limit(limit).
		Scan(&results).Error

	if err != nil {
		return nil, fmt.Errorf("failed to get school ranking: %w", err)
	}

	rankings := make([]SchoolRanking, len(results))
	for i, r := range results {
		rankings[i] = SchoolRanking{
			Rank:        i + 1,
			StudentID:   r.StudentID,
			StudentName: r.StudentName,
			Grade:       r.Grade,
			Class:       r.Class,
			BestValue:   r.BestValue,
			TestDate:    r.TestDate.Format("2006-01-02"),
		}
	}

	return &SchoolRankingResult{
		SchoolID:      schoolID,
		SchoolName:    school.Name,
		SportTypeID:   sportTypeID,
		SportTypeName: sportType.Name,
		ValueType:     sportType.ValueType,
		Unit:          sportType.DefaultUnit,
		TotalStudents: len(rankings),
		Rankings:      rankings,
	}, nil
}
