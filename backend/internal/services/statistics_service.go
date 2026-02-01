package services

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"math"
	"sort"
	"time"

	"github.com/wei979/ICACP/backend/internal/models"

	"github.com/go-redis/redis/v8"
	"gorm.io/gorm"
)

type StatisticsService struct {
	db    *gorm.DB
	redis *redis.Client
}

func NewStatisticsService(db *gorm.DB, redisClient *redis.Client) *StatisticsService {
	return &StatisticsService{
		db:    db,
		redis: redisClient,
	}
}

// ComparisonResult 比較結果
type ComparisonResult struct {
	Student     StudentInfo  `json:"student"`
	Comparisons []Comparison `json:"comparisons"`
	Summary     Summary      `json:"summary"`
}

type StudentInfo struct {
	ID         uint   `json:"id"`
	Name       string `json:"name"`
	Grade      int    `json:"grade"`
	Gender     string `json:"gender"`
	SchoolName string `json:"school_name"`
}

type Comparison struct {
	SportTypeID       uint          `json:"sport_type_id"`
	SportTypeName     string        `json:"sport_type_name"`
	Category          string        `json:"category"`
	Unit              string        `json:"unit"`
	StudentValue      float64       `json:"student_value"`
	StudentTestDate   string        `json:"student_test_date"`
	NationalAvg       float64       `json:"national_avg"`
	Difference        float64       `json:"difference"`
	DifferencePercent float64       `json:"difference_percent"`
	PercentileRank    int           `json:"percentile_rank"`
	PerformanceLevel  string        `json:"performance_level"`
	NationalStats     NationalStats `json:"national_stats"`
}

type NationalStats struct {
	SampleCount  int     `json:"sample_count"`
	Percentile25 float64 `json:"percentile_25"`
	Percentile50 float64 `json:"percentile_50"`
	Percentile75 float64 `json:"percentile_75"`
	Percentile90 float64 `json:"percentile_90"`
}

type Summary struct {
	TotalSports       int `json:"total_sports"`
	AboveAverageCount int `json:"above_average_count"`
	AverageCount      int `json:"average_count"`
	BelowAverageCount int `json:"below_average_count"`
	OverallPercentile int `json:"overall_percentile"`
}

// SchoolChampion 學校冠軍資訊
type SchoolChampion struct {
	SportTypeID   uint    `json:"sport_type_id"`
	SportTypeName string  `json:"sport_type_name"`
	Category      string  `json:"category"`
	Unit          string  `json:"unit"`
	SchoolID      uint    `json:"school_id"`
	SchoolName    string  `json:"school_name"`
	CountyName    string  `json:"county_name"`
	Latitude      float64 `json:"latitude"`
	Longitude     float64 `json:"longitude"`
	AverageValue  float64 `json:"average_value"`
	StudentCount  int     `json:"student_count"`
}

// GetSchoolChampions 取得各運動項目的冠軍學校
func (s *StatisticsService) GetSchoolChampions(ctx context.Context) ([]SchoolChampion, error) {
	var champions []SchoolChampion

	// 先取得所有運動類型
	var sportTypes []models.SportType
	if err := s.db.Find(&sportTypes).Error; err != nil {
		return nil, err
	}

	// 對每個運動類型找出冠軍學校
	for _, sportType := range sportTypes {
		var champion SchoolChampion

		query := `
			SELECT 
				? as sport_type_id,
				? as sport_type_name,
				? as category,
				? as unit,
				sch.id as school_id,
				sch.name as school_name,
				sch.county_name,
				sch.latitude,
				sch.longitude,
				AVG(sr.value) as average_value,
				COUNT(DISTINCT sr.student_id) as student_count
			FROM sport_records sr
			INNER JOIN students s ON sr.student_id = s.id
			INNER JOIN schools sch ON s.school_id = sch.id
			WHERE sr.sport_type_id = ?
			  AND sr.deleted_at IS NULL 
			  AND s.deleted_at IS NULL
			  AND sch.deleted_at IS NULL
			GROUP BY sch.id, sch.name, sch.county_name, sch.latitude, sch.longitude
			HAVING COUNT(DISTINCT sr.student_id) >= 3
			ORDER BY average_value DESC
			LIMIT 1
		`

		err := s.db.Raw(query,
			sportType.ID,
			sportType.Name,
			sportType.Category,
			sportType.DefaultUnit,
			sportType.ID,
		).Scan(&champion).Error

		if err != nil {
			log.Printf("查詢 %s 冠軍失敗: %v", sportType.Name, err)
			continue
		}

		// 如果找到冠軍，加入列表
		if champion.SchoolID > 0 {
			champions = append(champions, champion)
		}
	}

	return champions, nil
}

// CalculateNationalAverages 計算全國平均值
func (s *StatisticsService) CalculateNationalAverages(ctx context.Context) error {
	log.Println("開始計算全國平均值...")

	// 取得所有運動類型
	var sportTypes []models.SportType
	if err := s.db.Find(&sportTypes).Error; err != nil {
		return fmt.Errorf("查詢運動類型失敗: %w", err)
	}

	calculated := 0

	// 對每個運動類型 × 年級 × 性別計算平均值
	for _, sportType := range sportTypes {
		for grade := 1; grade <= 12; grade++ {
			for _, gender := range []string{"male", "female"} {
				if err := s.calculateAverage(ctx, sportType.ID, grade, gender); err != nil {
					log.Printf("計算失敗 (sport_type_id=%d, grade=%d, gender=%s): %v",
						sportType.ID, grade, gender, err)
					continue
				}
				calculated++
			}
		}
	}

	log.Printf("全國平均值計算完成，共計算 %d 組數據", calculated)

	// 清除 Redis 快取
	if s.redis != nil {
		s.redis.Del(ctx, "national_averages:all")
	}

	return nil
}

// calculateAverage 計算特定運動類型/年級/性別的平均值
func (s *StatisticsService) calculateAverage(ctx context.Context, sportTypeID uint, grade int, gender string) error {
	var records []float64

	// 查詢該年級/性別的所有記錄 (取每個學生的最新記錄)
	query := `
        SELECT sr.value
        FROM sport_records sr
        INNER JOIN (
            SELECT student_id, MAX(test_date) as latest_date
            FROM sport_records
            WHERE sport_type_id = ? AND deleted_at IS NULL
            GROUP BY student_id
        ) latest ON sr.student_id = latest.student_id AND sr.test_date = latest.latest_date
        INNER JOIN students s ON sr.student_id = s.id
        WHERE sr.sport_type_id = ? 
          AND s.grade = ? 
          AND s.gender = ?
          AND sr.deleted_at IS NULL
          AND s.deleted_at IS NULL
    `

	if err := s.db.Raw(query, sportTypeID, sportTypeID, grade, gender).Scan(&records).Error; err != nil {
		return err
	}

	if len(records) < 10 {
		// 樣本數太少，不計算
		return nil
	}

	// 計算統計值
	avg := calculateMean(records)
	p25 := calculatePercentile(records, 0.25)
	p50 := calculatePercentile(records, 0.50)
	p75 := calculatePercentile(records, 0.75)
	p90 := calculatePercentile(records, 0.90)

	// 儲存或更新到資料庫
	nationalAvg := models.NationalAverage{
		SportTypeID:  sportTypeID,
		Grade:        grade,
		Gender:       gender,
		AvgValue:     avg,
		SampleCount:  len(records),
		Percentile25: p25,
		Percentile50: p50,
		Percentile75: p75,
		Percentile90: p90,
	}

	// 使用 GORM 的 Upsert
	result := s.db.Where("sport_type_id = ? AND grade = ? AND gender = ?",
		sportTypeID, grade, gender).FirstOrCreate(&nationalAvg)

	if result.Error != nil {
		return result.Error
	}

	// 如果記錄已存在，更新它
	if result.RowsAffected == 0 {
		return s.db.Model(&nationalAvg).Updates(nationalAvg).Error
	}

	return nil
}

// GetStudentComparison 取得學生比較資料
func (s *StatisticsService) GetStudentComparison(ctx context.Context, studentID uint) (*ComparisonResult, error) {
	// 1. 取得學生資訊
	var student models.Student
	if err := s.db.Preload("School").First(&student, studentID).Error; err != nil {
		return nil, fmt.Errorf("學生不存在: %w", err)
	}

	studentInfo := StudentInfo{
		ID:         student.ID,
		Name:       student.Name,
		Grade:      student.Grade,
		Gender:     student.Gender,
		SchoolName: student.School.Name,
	}

	// 2. 取得學生的所有最新運動記錄
	var records []models.SportRecord
	query := `
        SELECT sr.*
        FROM sport_records sr
        INNER JOIN (
            SELECT sport_type_id, MAX(test_date) as latest_date
            FROM sport_records
            WHERE student_id = ? AND deleted_at IS NULL
            GROUP BY sport_type_id
        ) latest ON sr.sport_type_id = latest.sport_type_id 
                 AND sr.test_date = latest.latest_date
        WHERE sr.student_id = ? AND sr.deleted_at IS NULL
    `

	if err := s.db.Raw(query, studentID, studentID).Scan(&records).Error; err != nil {
		return nil, err
	}

	// 預載入 SportType
	var recordIDs []uint
	for _, r := range records {
		recordIDs = append(recordIDs, r.ID)
	}

	if len(recordIDs) > 0 {
		s.db.Preload("SportType").Where("id IN ?", recordIDs).Find(&records)
	}

	// 3. 取得對應的全國平均值並計算比較
	var comparisons []Comparison
	percentileSum := 0

	for _, record := range records {
		var natAvg models.NationalAverage
		err := s.db.Preload("SportType").
			Where("sport_type_id = ? AND grade = ? AND gender = ?",
				record.SportTypeID, student.Grade, student.Gender).
			First(&natAvg).Error

		if err != nil {
			log.Printf("無全國平均數據: sport_type_id=%d, grade=%d, gender=%s",
				record.SportTypeID, student.Grade, student.Gender)
			continue
		}

		// 計算差異和百分位
		diff := record.Value - natAvg.AvgValue
		diffPercent := 0.0
		if natAvg.AvgValue != 0 {
			diffPercent = (diff / natAvg.AvgValue) * 100
		}

		percentileRank := calculatePercentileRank(record.Value, natAvg)
		performanceLevel := getPerformanceLevel(percentileRank)
		percentileSum += percentileRank

		comparisons = append(comparisons, Comparison{
			SportTypeID:       record.SportTypeID,
			SportTypeName:     record.SportType.Name,
			Category:          record.SportType.Category,
			Unit:              record.SportType.DefaultUnit,
			StudentValue:      record.Value,
			StudentTestDate:   record.TestDate.Format("2006-01-02"),
			NationalAvg:       natAvg.AvgValue,
			Difference:        diff,
			DifferencePercent: diffPercent,
			PercentileRank:    percentileRank,
			PerformanceLevel:  performanceLevel,
			NationalStats: NationalStats{
				SampleCount:  natAvg.SampleCount,
				Percentile25: natAvg.Percentile25,
				Percentile50: natAvg.Percentile50,
				Percentile75: natAvg.Percentile75,
				Percentile90: natAvg.Percentile90,
			},
		})
	}

	// 4. 計算總結
	summary := calculateSummary(comparisons, percentileSum)

	return &ComparisonResult{
		Student:     studentInfo,
		Comparisons: comparisons,
		Summary:     summary,
	}, nil
}

// GetNationalAverages 取得全國平均值列表 (帶快取)
func (s *StatisticsService) GetNationalAverages(ctx context.Context, sportTypeID uint, grade int, gender string) ([]models.NationalAverage, error) {
	cacheKey := fmt.Sprintf("national_averages:%d:%d:%s", sportTypeID, grade, gender)

	// 嘗試從 Redis 取得
	if s.redis != nil {
		cached, err := s.redis.Get(ctx, cacheKey).Result()
		if err == nil {
			var averages []models.NationalAverage
			if json.Unmarshal([]byte(cached), &averages) == nil {
				return averages, nil
			}
		}
	}

	// 從資料庫查詢
	var averages []models.NationalAverage
	query := s.db.Preload("SportType")

	if sportTypeID > 0 {
		query = query.Where("sport_type_id = ?", sportTypeID)
	}
	if grade > 0 {
		query = query.Where("grade = ?", grade)
	}
	if gender != "" {
		query = query.Where("gender = ?", gender)
	}

	if err := query.Find(&averages).Error; err != nil {
		return nil, err
	}

	// 存入 Redis (TTL: 24小時)
	if s.redis != nil && len(averages) > 0 {
		data, _ := json.Marshal(averages)
		s.redis.Set(ctx, cacheKey, data, 24*time.Hour)
	}

	return averages, nil
}

// 工具函數

func calculateMean(values []float64) float64 {
	if len(values) == 0 {
		return 0
	}
	sum := 0.0
	for _, v := range values {
		sum += v
	}
	return sum / float64(len(values))
}

func calculatePercentile(values []float64, percentile float64) float64 {
	if len(values) == 0 {
		return 0
	}

	sorted := make([]float64, len(values))
	copy(sorted, values)
	sort.Float64s(sorted)

	index := percentile * float64(len(sorted)-1)
	lower := int(math.Floor(index))
	upper := int(math.Ceil(index))

	if lower == upper {
		return sorted[lower]
	}

	weight := index - float64(lower)
	return sorted[lower]*(1-weight) + sorted[upper]*weight
}

func calculatePercentileRank(value float64, avg models.NationalAverage) int {
	if value >= avg.Percentile90 {
		if avg.Percentile90 == 0 {
			return 90
		}
		extra := (value - avg.Percentile90) / (avg.Percentile90 * 0.2) * 10
		return int(math.Min(90+extra, 99))
	} else if value >= avg.Percentile75 {
		span := avg.Percentile90 - avg.Percentile75
		if span == 0 {
			return 75
		}
		return 75 + int((value-avg.Percentile75)/span*15)
	} else if value >= avg.Percentile50 {
		span := avg.Percentile75 - avg.Percentile50
		if span == 0 {
			return 50
		}
		return 50 + int((value-avg.Percentile50)/span*25)
	} else if value >= avg.Percentile25 {
		span := avg.Percentile50 - avg.Percentile25
		if span == 0 {
			return 25
		}
		return 25 + int((value-avg.Percentile25)/span*25)
	} else {
		if avg.Percentile25 == 0 {
			return 0
		}
		return int((value / avg.Percentile25) * 25)
	}
}

func getPerformanceLevel(percentile int) string {
	if percentile >= 75 {
		return "excellent"
	} else if percentile >= 50 {
		return "above_average"
	} else if percentile >= 25 {
		return "average"
	}
	return "below_average"
}

func calculateSummary(comparisons []Comparison, percentileSum int) Summary {
	total := len(comparisons)
	above := 0
	average := 0
	below := 0

	for _, c := range comparisons {
		switch c.PerformanceLevel {
		case "excellent", "above_average":
			above++
		case "average":
			average++
		case "below_average":
			below++
		}
	}

	overallPercentile := 50
	if total > 0 {
		overallPercentile = percentileSum / total
	}

	return Summary{
		TotalSports:       total,
		AboveAverageCount: above,
		AverageCount:      average,
		BelowAverageCount: below,
		OverallPercentile: overallPercentile,
	}
}
