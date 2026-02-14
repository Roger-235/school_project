package models

import (
	"time"
)

// NationalAverage 全國平均值統計
type NationalAverage struct {
	ID           uint      `gorm:"primarykey" json:"id"`
	SportTypeID  uint      `gorm:"not null;index:idx_sport_grade_gender,priority:1" json:"sport_type_id"`
	Grade        int       `gorm:"not null;index:idx_sport_grade_gender,priority:2" json:"grade"`
	Gender       string    `gorm:"size:10;not null;index:idx_sport_grade_gender,priority:3" json:"gender"`
	AvgValue     float64   `gorm:"type:decimal(10,2);not null" json:"avg_value"`
	SampleCount  int       `gorm:"not null" json:"sample_count"`
	Percentile25 float64   `gorm:"type:decimal(10,2)" json:"percentile_25"`
	Percentile50 float64   `gorm:"type:decimal(10,2)" json:"percentile_50"`
	Percentile75 float64   `gorm:"type:decimal(10,2)" json:"percentile_75"`
	Percentile90 float64   `gorm:"type:decimal(10,2)" json:"percentile_90"`
	UpdatedAt    time.Time `json:"updated_at"`
	CreatedAt    time.Time `json:"created_at"`

	// 關聯
	SportType SportType `gorm:"foreignKey:SportTypeID" json:"sport_type,omitempty"`
}

// TableName 指定資料表名稱
func (NationalAverage) TableName() string {
	return "national_averages"
}
