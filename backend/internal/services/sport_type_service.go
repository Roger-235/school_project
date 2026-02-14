package services

import (
	"fmt"

	"github.com/wei979/ICACP/backend/internal/models"
	"gorm.io/gorm"
)

// SportTypeService handles business logic for sport type operations
type SportTypeService struct {
	db *gorm.DB
}

// NewSportTypeService creates a new SportTypeService instance
func NewSportTypeService(db *gorm.DB) *SportTypeService {
	return &SportTypeService{
		db: db,
	}
}

// List retrieves all sport types
func (s *SportTypeService) List() ([]models.SportType, error) {
	var sportTypes []models.SportType
	err := s.db.Order("category, name").Find(&sportTypes).Error
	if err != nil {
		return nil, fmt.Errorf("failed to list sport types: %w", err)
	}
	return sportTypes, nil
}

// ListByCategory retrieves sport types by category
func (s *SportTypeService) ListByCategory(category string) ([]models.SportType, error) {
	var sportTypes []models.SportType
	err := s.db.Where("category = ?", category).Order("name").Find(&sportTypes).Error
	if err != nil {
		return nil, fmt.Errorf("failed to list sport types by category: %w", err)
	}
	return sportTypes, nil
}

// GetByID retrieves a sport type by ID
func (s *SportTypeService) GetByID(id uint) (*models.SportType, error) {
	var sportType models.SportType
	err := s.db.First(&sportType, id).Error
	if err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, fmt.Errorf("sport type not found")
		}
		return nil, fmt.Errorf("failed to get sport type: %w", err)
	}
	return &sportType, nil
}

// GetCategories returns all available sport categories
func (s *SportTypeService) GetCategories() []string {
	return []string{
		models.CategoryFitness,
		models.CategoryTrackField,
		models.CategoryBallSports,
	}
}
