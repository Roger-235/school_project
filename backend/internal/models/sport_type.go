package models

// SportType represents a sport/test type with predefined categories and units
type SportType struct {
	ID          uint   `gorm:"primarykey" json:"id"`
	Name        string `gorm:"size:50;not null;uniqueIndex" json:"name"`
	Category    string `gorm:"size:20;not null" json:"category"`
	DefaultUnit string `gorm:"size:20;not null" json:"default_unit"`
	ValueType   string `gorm:"size:20;not null" json:"value_type"`
}

// TableName specifies the table name for SportType
func (SportType) TableName() string {
	return "sport_types"
}

// SportTypeResponse is the API response wrapper for a single sport type
type SportTypeResponse struct {
	Data struct {
		SportType SportType `json:"sport_type"`
	} `json:"data"`
}

// SportTypeListResponse is the API response wrapper for sport type list
type SportTypeListResponse struct {
	Data struct {
		SportTypes []SportType `json:"sport_types"`
	} `json:"data"`
}

// SportCategory constants
const (
	CategoryFitness    = "體適能"
	CategoryTrackField = "田徑"
	CategoryBallSports = "球類"
)

// ValueType constants
const (
	ValueTypeTime     = "time"
	ValueTypeDistance = "distance"
	ValueTypeCount    = "count"
	ValueTypeScore    = "score"
)
