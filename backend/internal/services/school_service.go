package services

import (
	"fmt"

	"github.com/wei979/ICACP/backend/internal/models"
	"gorm.io/gorm"
)

// SchoolService handles business logic for school operations
type SchoolService struct {
	db *gorm.DB
}

// NewSchoolService creates a new SchoolService instance
func NewSchoolService(db *gorm.DB) *SchoolService {
	return &SchoolService{
		db: db,
	}
}

// List retrieves a paginated list of schools
func (s *SchoolService) List(page, pageSize int) ([]models.School, *models.Pagination, error) {
	if page < 1 {
		page = 1
	}
	if pageSize < 1 || pageSize > 100 {
		pageSize = 20
	}

	var schools []models.School
	var total int64

	// Count total records
	if err := s.db.Model(&models.School{}).Count(&total).Error; err != nil {
		return nil, nil, fmt.Errorf("failed to count schools: %w", err)
	}

	// Calculate pagination
	offset := (page - 1) * pageSize
	totalPages := int((total + int64(pageSize) - 1) / int64(pageSize))

	// Fetch schools with student count using Raw SQL for proper mapping
	err := s.db.Raw(`
		SELECT
			schools.*,
			(SELECT COUNT(*) FROM students WHERE students.school_id = schools.id AND students.deleted_at IS NULL) as student_count
		FROM schools
		WHERE schools.deleted_at IS NULL
		ORDER BY created_at DESC
		LIMIT ? OFFSET ?
	`, pageSize, offset).Scan(&schools).Error

	if err != nil {
		return nil, nil, fmt.Errorf("failed to list schools: %w", err)
	}

	pagination := &models.Pagination{
		Page:       page,
		PageSize:   pageSize,
		Total:      int(total),
		TotalPages: totalPages,
	}

	return schools, pagination, nil
}

// GetByID retrieves a school by ID
func (s *SchoolService) GetByID(id uint) (*models.School, error) {
	var school models.School
	err := s.db.First(&school, id).Error
	if err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, fmt.Errorf("school not found")
		}
		return nil, fmt.Errorf("failed to get school: %w", err)
	}
	return &school, nil
}

// GetByIDWithStudents retrieves a school by ID with its students
func (s *SchoolService) GetByIDWithStudents(id uint) (*models.School, error) {
	var school models.School
	err := s.db.Preload("Students").First(&school, id).Error
	if err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, fmt.Errorf("school not found")
		}
		return nil, fmt.Errorf("failed to get school: %w", err)
	}
	return &school, nil
}

// Create creates a new school
func (s *SchoolService) Create(req *models.CreateSchoolRequest) (*models.School, error) {
	// Validate county name
	if !models.IsValidCountyName(req.CountyName) {
		return nil, fmt.Errorf("無效的縣市名稱")
	}

	school := &models.School{
		Name:       req.Name,
		CountyName: req.CountyName,
		Address:    req.Address,
		Phone:      req.Phone,
		Latitude:   req.Latitude,
		Longitude:  req.Longitude,
	}

	if err := s.db.Create(school).Error; err != nil {
		return nil, fmt.Errorf("failed to create school: %w", err)
	}

	return school, nil
}

// Update updates an existing school
func (s *SchoolService) Update(id uint, req *models.UpdateSchoolRequest) (*models.School, error) {
	// Validate county name
	if !models.IsValidCountyName(req.CountyName) {
		return nil, fmt.Errorf("無效的縣市名稱")
	}

	var school models.School
	if err := s.db.First(&school, id).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, fmt.Errorf("school not found")
		}
		return nil, fmt.Errorf("failed to get school: %w", err)
	}

	school.Name = req.Name
	school.CountyName = req.CountyName
	school.Address = req.Address
	school.Phone = req.Phone
	school.Latitude = req.Latitude
	school.Longitude = req.Longitude

	if err := s.db.Save(&school).Error; err != nil {
		return nil, fmt.Errorf("failed to update school: %w", err)
	}

	return &school, nil
}

// Delete soft deletes a school and its students
func (s *SchoolService) Delete(id uint) error {
	// Check if school exists
	var school models.School
	if err := s.db.First(&school, id).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return fmt.Errorf("school not found")
		}
		return fmt.Errorf("failed to get school: %w", err)
	}

	// Start transaction for cascade delete
	tx := s.db.Begin()

	// Soft delete all students belonging to this school
	if err := tx.Where("school_id = ?", id).Delete(&models.Student{}).Error; err != nil {
		tx.Rollback()
		return fmt.Errorf("failed to delete students: %w", err)
	}

	// Soft delete the school
	if err := tx.Delete(&school).Error; err != nil {
		tx.Rollback()
		return fmt.Errorf("failed to delete school: %w", err)
	}

	tx.Commit()
	return nil
}

// ListForMap retrieves all schools with coordinates for map display
func (s *SchoolService) ListForMap() ([]models.SchoolMapData, int, error) {
	var schools []models.SchoolMapData

	err := s.db.Raw(`
		SELECT
			schools.id,
			schools.name,
			schools.latitude,
			schools.longitude,
			schools.county_name,
			(SELECT COUNT(*) FROM students WHERE students.school_id = schools.id AND students.deleted_at IS NULL) as student_count
		FROM schools
		WHERE schools.deleted_at IS NULL
			AND schools.latitude IS NOT NULL
			AND schools.longitude IS NOT NULL
		ORDER BY schools.county_name, schools.name
	`).Scan(&schools).Error

	if err != nil {
		return nil, 0, fmt.Errorf("failed to list schools for map: %w", err)
	}

	return schools, len(schools), nil
}

// ListByCounty retrieves schools by county name
func (s *SchoolService) ListByCounty(countyName string, page, pageSize int) ([]models.School, *models.Pagination, error) {
	if page < 1 {
		page = 1
	}
	if pageSize < 1 || pageSize > 100 {
		pageSize = 20
	}

	var schools []models.School
	var total int64

	// Count total records for the county
	if err := s.db.Model(&models.School{}).Where("county_name = ?", countyName).Count(&total).Error; err != nil {
		return nil, nil, fmt.Errorf("failed to count schools: %w", err)
	}

	// Calculate pagination
	offset := (page - 1) * pageSize
	totalPages := int((total + int64(pageSize) - 1) / int64(pageSize))

	// Fetch schools
	err := s.db.Where("county_name = ?", countyName).
		Offset(offset).
		Limit(pageSize).
		Order("created_at DESC").
		Find(&schools).Error

	if err != nil {
		return nil, nil, fmt.Errorf("failed to list schools: %w", err)
	}

	pagination := &models.Pagination{
		Page:       page,
		PageSize:   pageSize,
		Total:      int(total),
		TotalPages: totalPages,
	}

	return schools, pagination, nil
}
