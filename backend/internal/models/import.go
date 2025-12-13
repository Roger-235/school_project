package models

import "time"

// ImportType represents the type of import operation
type ImportType string

const (
	ImportTypeStudents ImportType = "students"
	ImportTypeRecords  ImportType = "records"
)

// RowStatus represents the validation status of an import row
type RowStatus string

const (
	RowStatusValid   RowStatus = "valid"
	RowStatusWarning RowStatus = "warning"
	RowStatusError   RowStatus = "error"
)

// ImportPreview represents a preview session for batch import
type ImportPreview struct {
	ID          string                   `json:"preview_id"`
	Type        ImportType               `json:"type"`
	SchoolID    uint                     `json:"school_id"`
	Grade       int                      `json:"grade,omitempty"`
	Class       string                   `json:"class,omitempty"`
	FileName    string                   `json:"file_name"`
	TotalRows   int                      `json:"total_rows"`
	ValidRows   int                      `json:"valid_rows"`
	WarningRows int                      `json:"warning_rows"`
	ErrorRows   int                      `json:"error_rows"`
	Rows        []ImportRow              `json:"rows"`
	CreatedAt   time.Time                `json:"created_at"`
	ExpiresAt   time.Time                `json:"expires_at"`
	Executed    bool                     `json:"-"` // Internal flag to track if preview was executed
}

// ImportRow represents a single row in the import preview
type ImportRow struct {
	RowNumber int                    `json:"row_number"`
	Status    RowStatus              `json:"status"`
	Data      map[string]interface{} `json:"data"`
	Errors    []RowError             `json:"errors"`
}

// RowError represents a validation error for a specific field
type RowError struct {
	Field   string `json:"field"`
	Code    string `json:"code"`
	Message string `json:"message"`
	Level   string `json:"level"` // "error" or "warning"
}

// ImportResult represents the outcome of an import execution
type ImportResult struct {
	PreviewID    string          `json:"preview_id"`
	Type         ImportType      `json:"type"`
	SuccessCount int             `json:"success_count"`
	SkipCount    int             `json:"skip_count"`
	Errors       []ImportedError `json:"errors"`
	ExecutedAt   time.Time       `json:"executed_at"`
}

// ImportedError represents an error for a skipped row during import
type ImportedError struct {
	RowNumber int    `json:"row_number"`
	Field     string `json:"field,omitempty"`
	Message   string `json:"message"`
}

// ExecuteImportRequest represents the request body for executing an import
type ExecuteImportRequest struct {
	PreviewID       string `json:"preview_id" binding:"required"`
	IncludeWarnings bool   `json:"include_warnings"`
}

// Error codes for import validation
const (
	ErrorCodeRequired      = "REQUIRED"
	ErrorCodeInvalidType   = "INVALID_TYPE"
	ErrorCodeInvalidValue  = "INVALID_VALUE"
	ErrorCodeInvalidFormat = "INVALID_FORMAT"
	ErrorCodeMaxLength     = "MAX_LENGTH"
	ErrorCodeOutOfRange    = "OUT_OF_RANGE"
	ErrorCodeDuplicate     = "DUPLICATE"
	ErrorCodeNotFound      = "NOT_FOUND"
	ErrorCodeNoData        = "NO_DATA"
)

// Student template column headers (Traditional Chinese)
var StudentTemplateHeaders = []string{
	"座號*",
	"姓名*",
	"性別*",
	"年級*",
	"班級",
	"生日",
}

// Sport records template column headers (Traditional Chinese)
var RecordsTemplateHeaders = []string{
	"座號*",
	"姓名*",
	"身高(cm)",
	"體重(kg)",
	"坐姿體前彎(cm)",
	"立定跳遠(cm)",
	"仰臥起坐(次/分鐘)",
	"心肺耐力(秒)",
	"測驗日期*",
}

// SportTypeMapping maps Chinese sport names to SportType IDs
var SportTypeMapping = map[string]uint{
	"身高":     1,
	"體重":     2,
	"坐姿體前彎": 3,
	"立定跳遠":  4,
	"仰臥起坐":  5,
	"心肺耐力":  6,
}

// SportValueRanges defines reasonable value ranges for warnings
type SportValueRange struct {
	Min float64
	Max float64
}

var SportValueRanges = map[string]SportValueRange{
	"身高":     {Min: 80, Max: 250},
	"體重":     {Min: 10, Max: 200},
	"坐姿體前彎": {Min: -30, Max: 60},
	"立定跳遠":  {Min: 20, Max: 350},
	"仰臥起坐":  {Min: 0, Max: 100},
	"心肺耐力":  {Min: 60, Max: 1800},
}
