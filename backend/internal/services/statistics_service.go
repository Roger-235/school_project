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

type StudentRecord struct {
	Value    float64 `json:"value"`
	TestDate string  `json:"test_date"`
}

type Comparison struct {
	SportTypeID       uint            `json:"sport_type_id"`
	SportTypeName     string          `json:"sport_type_name"`
	Category          string          `json:"category"`
	Unit              string          `json:"unit"`
	StudentRecords    []StudentRecord `json:"student_records"`    // 最多2筆記錄
	StudentValue      float64         `json:"student_value"`      // 保留向後兼容：最新記錄
	StudentTestDate   string          `json:"student_test_date"`  // 保留向後兼容：最新記錄日期
	NationalAvg       float64         `json:"national_avg"`
	Difference        float64         `json:"difference"`
	DifferencePercent float64         `json:"difference_percent"`
	PercentileRank    int             `json:"percentile_rank"`
	PerformanceLevel  string          `json:"performance_level"`
	NationalStats     NationalStats   `json:"national_stats"`
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

		// 根据 ValueType 决定排序方向：time 类型越小越好，其他越大越好
		orderDirection := "DESC"
		if sportType.ValueType == "time" {
			orderDirection = "ASC"
		}

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
			HAVING COUNT(DISTINCT sr.student_id) >= 1
			ORDER BY average_value ` + orderDirection + `
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

// SportTypeSchoolRanking 學校在運動項目中的排名資訊
type SportTypeSchoolRanking struct {
	Rank          int     `json:"rank"`
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

// GetTopSchoolsBySport 取得指定運動項目的前N名學校（支援縣市過濾）
func (s *StatisticsService) GetTopSchoolsBySport(ctx context.Context, sportTypeID uint, limit int, county ...string) ([]SportTypeSchoolRanking, error) {
	var rankings []SportTypeSchoolRanking

	// 取得運動類型資訊
	var sportType models.SportType
	if err := s.db.First(&sportType, sportTypeID).Error; err != nil {
		return nil, fmt.Errorf("運動類型不存在: %w", err)
	}

	// 根据 ValueType 决定排序方向：time 类型越小越好，其他越大越好
	orderDirection := "DESC"
	if sportType.ValueType == "time" {
		orderDirection = "ASC"
	}

	// 构建 WHERE 子句用于县市过滤
	whereClause := ""
	queryArgs := []interface{}{
		sportType.ID,
		sportType.Name,
		sportType.Category,
		sportType.DefaultUnit,
		sportType.ID,
	}
	
	if len(county) > 0 && county[0] != "" {
		whereClause = "AND sch.county_name = ?"
		queryArgs = append(queryArgs, county[0])
	}

	query := `
		SELECT
			ROW_NUMBER() OVER (ORDER BY avg_val ` + orderDirection + `) as ` + "`rank`" + `,
			? as sport_type_id,
			? as sport_type_name,
			? as category,
			? as unit,
			school_id,
			school_name,
			county_name,
			latitude,
			longitude,
			avg_val as average_value,
			student_count
		FROM (
			SELECT
				sch.id as school_id,
				sch.name as school_name,
				sch.county_name,
				sch.latitude,
				sch.longitude,
				AVG(sr.value) as avg_val,
				COUNT(DISTINCT sr.student_id) as student_count
			FROM sport_records sr
			INNER JOIN students s ON sr.student_id = s.id
			INNER JOIN schools sch ON s.school_id = sch.id
			WHERE sr.sport_type_id = ?
			  AND sr.deleted_at IS NULL
			  AND s.deleted_at IS NULL
			  AND sch.deleted_at IS NULL
			  ` + whereClause + `
			GROUP BY sch.id, sch.name, sch.county_name, sch.latitude, sch.longitude
			HAVING COUNT(DISTINCT sr.student_id) >= 1
		) ranked
		ORDER BY ` + "`rank`" + `
		LIMIT ?
	`

	// 添加 limit 到查询参数
	queryArgs = append(queryArgs, limit)

	err := s.db.Raw(query, queryArgs...).Scan(&rankings).Error

	if err != nil {
		return nil, fmt.Errorf("查詢排名失敗: %w", err)
	}

	return rankings, nil
}

// GetAllTopSchools 取得所有運動項目的前N名學校
func (s *StatisticsService) GetAllTopSchools(ctx context.Context, limit int) (map[uint][]SportTypeSchoolRanking, error) {
	// 取得所有運動類型
	var sportTypes []models.SportType
	if err := s.db.Find(&sportTypes).Error; err != nil {
		return nil, err
	}

	result := make(map[uint][]SportTypeSchoolRanking)

	// 對每個運動類型查詢排名
	for _, sportType := range sportTypes {
		rankings, err := s.GetTopSchoolsBySport(ctx, sportType.ID, limit)
		if err != nil {
			log.Printf("查詢 %s 排名失敗: %v", sportType.Name, err)
			continue
		}

		if len(rankings) > 0 {
			result[sportType.ID] = rankings
		}
	}

	return result, nil
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

	// 2. 取得學生的所有最新運動記錄（每個項目最多2筆）
	var records []models.SportRecord
	query := `
        SELECT sr.*
        FROM (
            SELECT sr.*,
                   ROW_NUMBER() OVER (PARTITION BY sr.sport_type_id ORDER BY sr.test_date DESC) as rn
            FROM sport_records sr
            WHERE sr.student_id = ? AND sr.deleted_at IS NULL
        ) sr
        WHERE sr.rn <= 2
        ORDER BY sr.sport_type_id, sr.test_date DESC
    `

	if err := s.db.Raw(query, studentID).Scan(&records).Error; err != nil {
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

	// 3. 按運動項目分組記錄（每組最多2筆）
	recordsBySportType := make(map[uint][]models.SportRecord)
	for _, record := range records {
		recordsBySportType[record.SportTypeID] = append(recordsBySportType[record.SportTypeID], record)
	}

	// 4. 取得對應的全國平均值並計算比較
	var comparisons []Comparison
	percentileSum := 0

	for sportTypeID, sportRecords := range recordsBySportType {
		if len(sportRecords) == 0 {
			continue
		}

		// 使用第一筆（最新）記錄進行比較計算
		latestRecord := sportRecords[0]

		var natAvg models.NationalAverage
		err := s.db.Preload("SportType").
			Where("sport_type_id = ? AND grade = ? AND gender = ?",
				sportTypeID, student.Grade, student.Gender).
			First(&natAvg).Error

		if err != nil {
			log.Printf("無全國平均數據: sport_type_id=%d, grade=%d, gender=%s",
				sportTypeID, student.Grade, student.Gender)
			continue
		}

		// 計算差異和百分位（使用最新記錄）
		diff := latestRecord.Value - natAvg.AvgValue
		diffPercent := 0.0
		if natAvg.AvgValue != 0 {
			diffPercent = (diff / natAvg.AvgValue) * 100
		}

		percentileRank := calculatePercentileRank(latestRecord.Value, natAvg)
		performanceLevel := getPerformanceLevel(percentileRank)
		percentileSum += percentileRank

		// 構建學生記錄數組（最多2筆）
		var studentRecords []StudentRecord
		for _, rec := range sportRecords {
			studentRecords = append(studentRecords, StudentRecord{
				Value:    rec.Value,
				TestDate: rec.TestDate.Format("2006-01-02"),
			})
		}

		comparisons = append(comparisons, Comparison{
			SportTypeID:       sportTypeID,
			SportTypeName:     latestRecord.SportType.Name,
			Category:          latestRecord.SportType.Category,
			Unit:              latestRecord.SportType.DefaultUnit,
			StudentRecords:    studentRecords,                          // 新增：多筆記錄
			StudentValue:      latestRecord.Value,                      // 保留向後兼容
			StudentTestDate:   latestRecord.TestDate.Format("2006-01-02"), // 保留向後兼容
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

	// 5. 計算總結
	summary := calculateSummary(comparisons, percentileSum)

	return &ComparisonResult{
		Student:     studentInfo,
		Comparisons: comparisons,
		Summary:     summary,
	}, nil
}

// GradeComparison 同年級比較項目
type GradeComparison struct {
	SportTypeID   uint    `json:"sport_type_id"`
	SportTypeName string  `json:"sport_type_name"`
	Category      string  `json:"category"`
	Unit          string  `json:"unit"`
	StudentValue  float64 `json:"student_value"`
	GradeAvg      float64 `json:"grade_avg"`
	GradeRank     int     `json:"grade_rank"`
	TotalStudents int     `json:"total_students"`
	GradeBest     float64 `json:"grade_best"`
}

// GradeComparisonResult 同年級比較結果
type GradeComparisonResult struct {
	Student     StudentInfo       `json:"student"`
	Comparisons []GradeComparison `json:"comparisons"`
}

// GetGradeComparison 取得學生同年級比較資料
func (s *StatisticsService) GetGradeComparison(ctx context.Context, studentID uint) (*GradeComparisonResult, error) {
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

	// 2. 取得所有運動類型
	var sportTypes []models.SportType
	if err := s.db.Find(&sportTypes).Error; err != nil {
		return nil, err
	}

	var comparisons []GradeComparison

	for _, sportType := range sportTypes {
		// 取得該學生此項目的最新成績
		var studentValue float64
		err := s.db.Raw(`
			SELECT sr.value FROM sport_records sr
			WHERE sr.student_id = ? AND sr.sport_type_id = ? AND sr.deleted_at IS NULL
			ORDER BY sr.test_date DESC LIMIT 1
		`, studentID, sportType.ID).Scan(&studentValue).Error

		if err != nil || studentValue == 0 {
			continue
		}

		// 取得同年級所有學生此項目的最新成績
		type peerRecord struct {
			StudentID uint
			Value     float64
		}
		var peers []peerRecord
		s.db.Raw(`
			SELECT sr.student_id, sr.value
			FROM sport_records sr
			INNER JOIN (
				SELECT student_id, MAX(test_date) as latest
				FROM sport_records
				WHERE sport_type_id = ? AND deleted_at IS NULL
				GROUP BY student_id
			) latest ON sr.student_id = latest.student_id AND sr.test_date = latest.latest
			INNER JOIN students s ON sr.student_id = s.id
			WHERE sr.sport_type_id = ? AND s.grade = ? AND sr.deleted_at IS NULL AND s.deleted_at IS NULL
		`, sportType.ID, sportType.ID, student.Grade).Scan(&peers)

		if len(peers) < 2 {
			continue
		}

		// 計算年級平均
		sum := 0.0
		for _, p := range peers {
			sum += p.Value
		}
		gradeAvg := sum / float64(len(peers))

		// 根據 ValueType 決定排序方向並計算排名
		if sportType.ValueType == "time" {
			sort.Slice(peers, func(i, j int) bool { return peers[i].Value < peers[j].Value })
		} else {
			sort.Slice(peers, func(i, j int) bool { return peers[i].Value > peers[j].Value })
		}

		rank := 1
		for _, p := range peers {
			if p.StudentID == studentID {
				break
			}
			rank++
		}

		comparisons = append(comparisons, GradeComparison{
			SportTypeID:   sportType.ID,
			SportTypeName: sportType.Name,
			Category:      sportType.Category,
			Unit:          sportType.DefaultUnit,
			StudentValue:  studentValue,
			GradeAvg:      math.Round(gradeAvg*100) / 100,
			GradeRank:     rank,
			TotalStudents: len(peers),
			GradeBest:     peers[0].Value,
		})
	}

	return &GradeComparisonResult{
		Student:     studentInfo,
		Comparisons: comparisons,
	}, nil
}

// CountyComparison 縣市內比較項目
type CountyComparison struct {
	SportTypeID   uint    `json:"sport_type_id"`
	SportTypeName string  `json:"sport_type_name"`
	Category      string  `json:"category"`
	Unit          string  `json:"unit"`
	StudentValue  float64 `json:"student_value"`
	CountyAvg     float64 `json:"county_avg"`
	CountyRank    int     `json:"county_rank"`
	TotalStudents int     `json:"total_students"`
	CountyBest    float64 `json:"county_best"`
	CountyName    string  `json:"county_name"`
}

// CountyComparisonResult 縣市內比較結果
type CountyComparisonResult struct {
	Student     StudentInfo       `json:"student"`
	Comparisons []CountyComparison `json:"comparisons"`
}

// GetCountyComparison 取得學生縣市內比較資料（同縣市 + 同年級 + 同性別）
func (s *StatisticsService) GetCountyComparison(ctx context.Context, studentID uint) (*CountyComparisonResult, error) {
	var student models.Student
	if err := s.db.Preload("School").First(&student, studentID).Error; err != nil {
		return nil, fmt.Errorf("學生不存在: %w", err)
	}

	countyName := student.School.CountyName
	studentInfo := StudentInfo{
		ID:         student.ID,
		Name:       student.Name,
		Grade:      student.Grade,
		Gender:     student.Gender,
		SchoolName: student.School.Name,
	}

	var sportTypes []models.SportType
	if err := s.db.Find(&sportTypes).Error; err != nil {
		return nil, err
	}

	var comparisons []CountyComparison

	for _, sportType := range sportTypes {
		// 取得該學生此項目的最新成績
		var studentValue float64
		err := s.db.Raw(`
			SELECT sr.value FROM sport_records sr
			WHERE sr.student_id = ? AND sr.sport_type_id = ? AND sr.deleted_at IS NULL
			ORDER BY sr.test_date DESC LIMIT 1
		`, studentID, sportType.ID).Scan(&studentValue).Error

		if err != nil || studentValue == 0 {
			continue
		}

		// 取得同縣市 + 同年級 + 同性別的所有學生最新成績
		type peerRecord struct {
			StudentID uint
			Value     float64
		}
		var peers []peerRecord
		s.db.Raw(`
			SELECT sr.student_id, sr.value
			FROM sport_records sr
			INNER JOIN (
				SELECT student_id, MAX(test_date) as latest
				FROM sport_records
				WHERE sport_type_id = ? AND deleted_at IS NULL
				GROUP BY student_id
			) latest ON sr.student_id = latest.student_id AND sr.test_date = latest.latest
			INNER JOIN students st ON sr.student_id = st.id
			INNER JOIN schools sch ON st.school_id = sch.id
			WHERE sr.sport_type_id = ?
			  AND sch.county_name = ?
			  AND st.grade = ?
			  AND st.gender = ?
			  AND sr.deleted_at IS NULL
			  AND st.deleted_at IS NULL
		`, sportType.ID, sportType.ID, countyName, student.Grade, student.Gender).Scan(&peers)

		if len(peers) < 2 {
			continue
		}

		// 計算縣市平均
		sum := 0.0
		for _, p := range peers {
			sum += p.Value
		}
		countyAvg := sum / float64(len(peers))

		// 根據 ValueType 決定排序方向並計算排名
		if sportType.ValueType == "time" {
			sort.Slice(peers, func(i, j int) bool { return peers[i].Value < peers[j].Value })
		} else {
			sort.Slice(peers, func(i, j int) bool { return peers[i].Value > peers[j].Value })
		}

		rank := 1
		for _, p := range peers {
			if p.StudentID == studentID {
				break
			}
			rank++
		}

		comparisons = append(comparisons, CountyComparison{
			SportTypeID:   sportType.ID,
			SportTypeName: sportType.Name,
			Category:      sportType.Category,
			Unit:          sportType.DefaultUnit,
			StudentValue:  studentValue,
			CountyAvg:     math.Round(countyAvg*100) / 100,
			CountyRank:    rank,
			TotalStudents: len(peers),
			CountyBest:    peers[0].Value,
			CountyName:    countyName,
		})
	}

	return &CountyComparisonResult{
		Student:     studentInfo,
		Comparisons: comparisons,
	}, nil
}

// CountySportAverage 縣市各運動項目平均成績
type CountySportAverage struct {
	SportTypeID   uint    `json:"sport_type_id"`
	SportTypeName string  `json:"sport_type_name"`
	Category      string  `json:"category"`
	Unit          string  `json:"unit"`
	ValueType     string  `json:"value_type"`
	AvgValue      float64 `json:"avg_value"`
	SchoolCount   int     `json:"school_count"`
	StudentCount  int     `json:"student_count"`
}

// GetCountySportAverages 取得縣市各運動項目平均成績（用於縣市比較）
func (s *StatisticsService) GetCountySportAverages(ctx context.Context, countyName string) ([]CountySportAverage, error) {
	var sportTypes []models.SportType
	if err := s.db.Find(&sportTypes).Error; err != nil {
		return nil, err
	}

	var result []CountySportAverage

	for _, sportType := range sportTypes {
		type row struct {
			AvgValue     float64
			SchoolCount  int
			StudentCount int
		}
		var r row
		s.db.Raw(`
			SELECT
				AVG(sr.value) as avg_value,
				COUNT(DISTINCT sch.id) as school_count,
				COUNT(DISTINCT sr.student_id) as student_count
			FROM sport_records sr
			INNER JOIN (
				SELECT student_id, MAX(test_date) as latest
				FROM sport_records
				WHERE sport_type_id = ? AND deleted_at IS NULL
				GROUP BY student_id
			) latest ON sr.student_id = latest.student_id AND sr.test_date = latest.latest
			INNER JOIN students st ON sr.student_id = st.id
			INNER JOIN schools sch ON st.school_id = sch.id
			WHERE sr.sport_type_id = ?
			  AND sch.county_name = ?
			  AND sr.deleted_at IS NULL
			  AND st.deleted_at IS NULL
		`, sportType.ID, sportType.ID, countyName).Scan(&r)

		if r.StudentCount == 0 {
			continue
		}

		result = append(result, CountySportAverage{
			SportTypeID:   sportType.ID,
			SportTypeName: sportType.Name,
			Category:      sportType.Category,
			Unit:          sportType.DefaultUnit,
			ValueType:     sportType.ValueType,
			AvgValue:      math.Round(r.AvgValue*100) / 100,
			SchoolCount:   r.SchoolCount,
			StudentCount:  r.StudentCount,
		})
	}

	return result, nil
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
