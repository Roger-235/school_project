package models

// GradeComparisonDTO 定義了同年級比較的 API 回傳格式
type GradeComparisonDTO struct {
	SportName    string  `json:"sport_name"`    // 項目名稱 (如: 100m)
	StudentScore float64 `json:"student_score"` // 該學生的成績
	GradeAvg     float64 `json:"grade_avg"`     // 年級平均成績
	Unit         string  `json:"unit"`          // 單位 (如: 秒, cm)
	FullMark     float64 `json:"full_mark"`     // 滿分基準 (固定 100，供前端雷達圖使用)
}
