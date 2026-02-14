package services

import (
	"context"
	"encoding/json"
	"fmt"
	"time"

	"github.com/go-redis/redis/v8"
	"github.com/wei979/ICACP/backend/internal/models"
	"gorm.io/gorm"
)

// CountyService handles business logic for county statistics
type CountyService struct {
	db          *gorm.DB
	redisClient *redis.Client
	ctx         context.Context
}

// NewCountyService creates a new CountyService instance
func NewCountyService(db *gorm.DB, redisClient *redis.Client) *CountyService {
	return &CountyService{
		db:          db,
		redisClient: redisClient,
		ctx:         context.Background(),
	}
}

// GetAllCountyStatistics retrieves statistics for all counties with Redis caching
// Cache key: "county:stats:all"
// TTL: 900 seconds (15 minutes)
func (s *CountyService) GetAllCountyStatistics() (*models.AllCountyStatistics, error) {
	// Try cache first
	cached, err := s.getCachedAllStats()
	if err != nil {
		// Log warning but continue to database query
		fmt.Printf("Warning: Redis cache error (will query database): %v\n", err)
	}
	if cached != nil {
		fmt.Println("Cache hit for all county statistics")
		return cached, nil
	}

	// Cache miss: query database
	fmt.Println("Cache miss for all county statistics - querying database")

	// Initialize as empty slice (not nil) to ensure JSON serializes to [] instead of null
	stats := make([]models.CountyStatistics, 0)

	// Aggregation query: GROUP BY county_name, COUNT schools, COUNT students, COUNT sport_records
	err = s.db.Table("schools").
		Select(`
			schools.county_name,
			COUNT(DISTINCT schools.id) as school_count,
			COUNT(DISTINCT students.id) as student_count,
			COUNT(sport_records.id) as record_count,
			(COUNT(DISTINCT schools.id) > 0) as has_data
		`).
		Joins("LEFT JOIN students ON students.school_id = schools.id AND students.deleted_at IS NULL").
		Joins("LEFT JOIN sport_records ON sport_records.student_id = students.id AND sport_records.deleted_at IS NULL").
		Where("schools.deleted_at IS NULL").
		Group("schools.county_name").
		Scan(&stats).Error

	if err != nil {
		return nil, fmt.Errorf("database query error: %w", err)
	}

	// Build response
	result := &models.AllCountyStatistics{
		Counties: stats,
		Total:    len(stats),
	}

	// Cache the result
	if err := s.cacheAllStats(result); err != nil {
		// Log warning but return successful result
		fmt.Printf("Warning: Failed to cache all county statistics: %v\n", err)
	}

	return result, nil
}

// GetCountyStatistics retrieves statistics for a specific county with Redis caching
// Cache key: "county:stats:{countyName}"
// TTL: 900 seconds (15 minutes)
func (s *CountyService) GetCountyStatistics(countyName string) (*models.CountyStatistics, error) {
	// T033: Validate county name against 22-county whitelist
	if !models.IsValidCountyName(countyName) {
		return nil, fmt.Errorf("invalid county name: %s", countyName)
	}

	// Try cache first
	cached, err := s.getCachedCountyStats(countyName)
	if err != nil {
		// Log warning but continue to database query
		fmt.Printf("Warning: Redis cache error for county %s (will query database): %v\n", countyName, err)
	}
	if cached != nil {
		fmt.Printf("Cache hit for county statistics: %s\n", countyName)
		return cached, nil
	}

	// Cache miss: query database
	fmt.Printf("Cache miss for county statistics: %s - querying database\n", countyName)

	// T032: Aggregation query for single county using GORM
	var stats models.CountyStatistics
	err = s.db.Table("schools").
		Select(`
			schools.county_name,
			COUNT(DISTINCT schools.id) as school_count,
			COUNT(DISTINCT students.id) as student_count,
			COUNT(sport_records.id) as record_count,
			(COUNT(DISTINCT schools.id) > 0) as has_data
		`).
		Joins("LEFT JOIN students ON students.school_id = schools.id AND students.deleted_at IS NULL").
		Joins("LEFT JOIN sport_records ON sport_records.student_id = students.id AND sport_records.deleted_at IS NULL").
		Where("schools.county_name = ? AND schools.deleted_at IS NULL", countyName).
		Group("schools.county_name").
		Scan(&stats).Error

	if err != nil {
		return nil, fmt.Errorf("database query error: %w", err)
	}

	// If no data found for the county, return empty stats with has_data = false
	if stats.CountyName == "" {
		stats = models.CountyStatistics{
			CountyName:   countyName,
			SchoolCount:  0,
			StudentCount: 0,
			RecordCount:  0,
			HasData:      false,
		}
	}

	// Cache the result
	if err := s.cacheCountyStats(&stats); err != nil {
		// Log warning but return successful result
		fmt.Printf("Warning: Failed to cache county statistics for %s: %v\n", countyName, err)
	}

	return &stats, nil
}

// Helper methods for caching (to be implemented in user story tasks)

func (s *CountyService) getCachedAllStats() (*models.AllCountyStatistics, error) {
	if s.redisClient == nil {
		return nil, nil // Redis not available, skip caching
	}
	cacheKey := "county:stats:all"
	cached, err := s.redisClient.Get(s.ctx, cacheKey).Result()
	if err == redis.Nil {
		return nil, nil // Cache miss
	}
	if err != nil {
		return nil, fmt.Errorf("redis get error: %w", err)
	}

	var stats models.AllCountyStatistics
	if err := json.Unmarshal([]byte(cached), &stats); err != nil {
		return nil, fmt.Errorf("json unmarshal error: %w", err)
	}

	return &stats, nil
}

func (s *CountyService) cacheAllStats(stats *models.AllCountyStatistics) error {
	if s.redisClient == nil {
		return nil // Redis not available, skip caching
	}
	cacheKey := "county:stats:all"
	jsonData, err := json.Marshal(stats)
	if err != nil {
		return fmt.Errorf("json marshal error: %w", err)
	}

	// Set cache with 15-minute TTL (900 seconds)
	if err := s.redisClient.Set(s.ctx, cacheKey, jsonData, 900*time.Second).Err(); err != nil {
		return fmt.Errorf("redis set error: %w", err)
	}

	return nil
}

func (s *CountyService) getCachedCountyStats(countyName string) (*models.CountyStatistics, error) {
	if s.redisClient == nil {
		return nil, nil // Redis not available, skip caching
	}
	cacheKey := fmt.Sprintf("county:stats:%s", countyName)
	cached, err := s.redisClient.Get(s.ctx, cacheKey).Result()
	if err == redis.Nil {
		return nil, nil // Cache miss
	}
	if err != nil {
		return nil, fmt.Errorf("redis get error: %w", err)
	}

	var stats models.CountyStatistics
	if err := json.Unmarshal([]byte(cached), &stats); err != nil {
		return nil, fmt.Errorf("json unmarshal error: %w", err)
	}

	return &stats, nil
}

func (s *CountyService) cacheCountyStats(stats *models.CountyStatistics) error {
	if s.redisClient == nil {
		return nil // Redis not available, skip caching
	}
	cacheKey := fmt.Sprintf("county:stats:%s", stats.CountyName)
	jsonData, err := json.Marshal(stats)
	if err != nil {
		return fmt.Errorf("json marshal error: %w", err)
	}

	// Set cache with 15-minute TTL (900 seconds)
	if err := s.redisClient.Set(s.ctx, cacheKey, jsonData, 900*time.Second).Err(); err != nil {
		return fmt.Errorf("redis set error: %w", err)
	}

	return nil
}
