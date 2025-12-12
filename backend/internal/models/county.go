package models

// CountyStatistics represents aggregated statistics for a Taiwan county/city
// This is a non-persisted model calculated on-demand from schools, students, and sport_records tables
type CountyStatistics struct {
	CountyName   string `json:"county_name" gorm:"column:county_name"`
	SchoolCount  int    `json:"school_count" gorm:"column:school_count"`
	StudentCount int    `json:"student_count" gorm:"column:student_count"`
	RecordCount  int    `json:"record_count" gorm:"column:record_count"`
	HasData      bool   `json:"has_data" gorm:"column:has_data"`
}

// AllCountyStatistics represents statistics for all counties
type AllCountyStatistics struct {
	Counties []CountyStatistics `json:"counties"`
	Total    int                `json:"total"`
}

// CountyStatisticsResponse is the API response wrapper for single county
type CountyStatisticsResponse struct {
	Data CountyStatistics `json:"data"`
}

// AllCountyStatisticsResponse is the API response wrapper for all counties
type AllCountyStatisticsResponse struct {
	Data AllCountyStatistics `json:"data"`
}

// ValidTaiwanCounties is the whitelist of 22 valid Taiwan county/city names
var ValidTaiwanCounties = []string{
	"臺北市",
	"新北市",
	"桃園市",
	"臺中市",
	"臺南市",
	"高雄市",
	"基隆市",
	"新竹市",
	"嘉義市",
	"新竹縣",
	"苗栗縣",
	"彰化縣",
	"南投縣",
	"雲林縣",
	"嘉義縣",
	"屏東縣",
	"宜蘭縣",
	"花蓮縣",
	"臺東縣",
	"澎湖縣",
	"金門縣",
	"連江縣",
}

// IsValidCountyName checks if a county name is valid
func IsValidCountyName(name string) bool {
	for _, validName := range ValidTaiwanCounties {
		if validName == name {
			return true
		}
	}
	return false
}
