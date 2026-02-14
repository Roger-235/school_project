package services

import (
	"fmt"
	"time"

	"github.com/wei979/ICACP/backend/internal/models"
	"gorm.io/gorm"
)

// StudentService handles business logic for student operations
type StudentService struct {
	db *gorm.DB
}

// NewStudentService creates a new StudentService instance
func NewStudentService(db *gorm.DB) *StudentService {
	return &StudentService{
		db: db,
	}
}

// List retrieves a paginated list of students
func (s *StudentService) List(params *models.StudentSearchParams) ([]models.Student, *models.Pagination, error) {
	page := params.Page
	pageSize := params.PageSize

	if page < 1 {
		page = 1
	}
	if pageSize < 1 || pageSize > 100 {
		pageSize = 20
	}

	var students []models.Student
	var total int64

	query := s.db.Model(&models.Student{})

	// Apply filters
	if params.Name != "" {
		query = query.Where("name LIKE ?", "%"+params.Name+"%")
	}
	if params.SchoolID > 0 {
		query = query.Where("school_id = ?", params.SchoolID)
	}
	if params.Grade > 0 {
		query = query.Where("grade = ?", params.Grade)
	}
	if params.Gender != "" {
		query = query.Where("gender = ?", params.Gender)
	}

	// Count total records
	if err := query.Count(&total).Error; err != nil {
		return nil, nil, fmt.Errorf("failed to count students: %w", err)
	}

	// Calculate pagination
	offset := (page - 1) * pageSize
	totalPages := int((total + int64(pageSize) - 1) / int64(pageSize))

	// Fetch students with school info
	err := query.
		Preload("School").
		Offset(offset).
		Limit(pageSize).
		Order("created_at DESC").
		Find(&students).Error

	if err != nil {
		return nil, nil, fmt.Errorf("failed to list students: %w", err)
	}

	pagination := &models.Pagination{
		Page:       page,
		PageSize:   pageSize,
		Total:      int(total),
		TotalPages: totalPages,
	}

	return students, pagination, nil
}

// GetByID retrieves a student by ID
func (s *StudentService) GetByID(id uint) (*models.Student, error) {
	var student models.Student
	err := s.db.Preload("School").First(&student, id).Error
	if err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, fmt.Errorf("student not found")
		}
		return nil, fmt.Errorf("failed to get student: %w", err)
	}
	return &student, nil
}

// GetByIDWithRecords retrieves a student by ID with sport records
func (s *StudentService) GetByIDWithRecords(id uint) (*models.Student, error) {
	var student models.Student
	err := s.db.Preload("School").
		Preload("SportRecords.SportType").
		First(&student, id).Error
	if err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, fmt.Errorf("student not found")
		}
		return nil, fmt.Errorf("failed to get student: %w", err)
	}
	return &student, nil
}

// Create creates a new student
func (s *StudentService) Create(req *models.CreateStudentRequest) (*models.Student, error) {
	// Check if school exists
	var school models.School
	if err := s.db.First(&school, req.SchoolID).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, fmt.Errorf("學校不存在")
		}
		return nil, fmt.Errorf("failed to check school: %w", err)
	}

	// Check for duplicate student number in the same school
	var existingStudent models.Student
	err := s.db.Where("school_id = ? AND student_number = ?", req.SchoolID, req.StudentNumber).
		First(&existingStudent).Error
	if err == nil {
		return nil, fmt.Errorf("此學號已存在於該學校")
	}
	if err != gorm.ErrRecordNotFound {
		return nil, fmt.Errorf("failed to check student number: %w", err)
	}

	student := &models.Student{
		SchoolID:      req.SchoolID,
		StudentNumber: req.StudentNumber,
		Name:          req.Name,
		Grade:         req.Grade,
		Class:         req.Class,
		Gender:        req.Gender,
	}

	// Parse birth date if provided
	if req.BirthDate != "" {
		birthDate, err := time.Parse("2006-01-02", req.BirthDate)
		if err != nil {
			return nil, fmt.Errorf("日期格式錯誤，請使用 YYYY-MM-DD 格式")
		}
		if birthDate.After(time.Now()) {
			return nil, fmt.Errorf("出生日期不能是未來日期")
		}
		student.BirthDate = &birthDate
	}

	if err := s.db.Create(student).Error; err != nil {
		return nil, fmt.Errorf("failed to create student: %w", err)
	}

	// Reload with school info
	s.db.Preload("School").First(student, student.ID)

	return student, nil
}

// Update updates an existing student
func (s *StudentService) Update(id uint, req *models.UpdateStudentRequest) (*models.Student, error) {
	var student models.Student
	if err := s.db.First(&student, id).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, fmt.Errorf("student not found")
		}
		return nil, fmt.Errorf("failed to get student: %w", err)
	}

	// Check for duplicate student number if changed
	if req.StudentNumber != student.StudentNumber {
		var existingStudent models.Student
		err := s.db.Where("school_id = ? AND student_number = ? AND id != ?",
			student.SchoolID, req.StudentNumber, id).
			First(&existingStudent).Error
		if err == nil {
			return nil, fmt.Errorf("此學號已存在於該學校")
		}
		if err != gorm.ErrRecordNotFound {
			return nil, fmt.Errorf("failed to check student number: %w", err)
		}
	}

	student.StudentNumber = req.StudentNumber
	student.Name = req.Name
	student.Grade = req.Grade
	student.Class = req.Class
	student.Gender = req.Gender

	// Parse birth date if provided
	if req.BirthDate != "" {
		birthDate, err := time.Parse("2006-01-02", req.BirthDate)
		if err != nil {
			return nil, fmt.Errorf("日期格式錯誤，請使用 YYYY-MM-DD 格式")
		}
		if birthDate.After(time.Now()) {
			return nil, fmt.Errorf("出生日期不能是未來日期")
		}
		student.BirthDate = &birthDate
	} else {
		student.BirthDate = nil
	}

	if err := s.db.Save(&student).Error; err != nil {
		return nil, fmt.Errorf("failed to update student: %w", err)
	}

	// Reload with school info
	s.db.Preload("School").First(&student, id)

	return &student, nil
}

// Delete soft deletes a student
func (s *StudentService) Delete(id uint) error {
	var student models.Student
	if err := s.db.First(&student, id).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return fmt.Errorf("student not found")
		}
		return fmt.Errorf("failed to get student: %w", err)
	}

	if err := s.db.Delete(&student).Error; err != nil {
		return fmt.Errorf("failed to delete student: %w", err)
	}

	return nil
}

// ListBySchool retrieves students by school ID
func (s *StudentService) ListBySchool(schoolID uint, page, pageSize int) ([]models.Student, *models.Pagination, error) {
	params := &models.StudentSearchParams{
		SchoolID: schoolID,
		Page:     page,
		PageSize: pageSize,
	}
	return s.List(params)
}

// Search searches students with various filters (fuzzy name search)
func (s *StudentService) Search(params *models.StudentSearchParams) ([]models.Student, *models.Pagination, error) {
	return s.List(params)
}
