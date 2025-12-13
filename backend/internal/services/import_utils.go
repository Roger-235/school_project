package services

import (
	"fmt"
	"strconv"
	"strings"
	"time"
)

// Supported date formats for parsing
var dateFormats = []string{
	"2006/01/02",   // 2025/03/15
	"2006-01-02",   // 2025-03-15
	"2006/1/2",     // 2025/3/15
	"2006-1-2",     // 2025-3-15
	"01/02/2006",   // 03/15/2025
	"1/2/2006",     // 3/15/2025
	"2006年01月02日", // 2025年03月15日
	"2006年1月2日",   // 2025年3月15日
}

// ParseDate attempts to parse a date string using multiple formats
func ParseDate(value string) (time.Time, error) {
	if value == "" {
		return time.Time{}, fmt.Errorf("日期為空")
	}

	// Trim whitespace
	value = strings.TrimSpace(value)

	// Try each format
	for _, format := range dateFormats {
		if t, err := time.Parse(format, value); err == nil {
			return t, nil
		}
	}

	return time.Time{}, fmt.Errorf("無法解析日期格式: %s", value)
}

// ParseFloat attempts to parse a string as float64
func ParseFloat(value string) (float64, error) {
	if value == "" {
		return 0, fmt.Errorf("數值為空")
	}

	// Trim whitespace
	value = strings.TrimSpace(value)

	// Try to parse
	f, err := strconv.ParseFloat(value, 64)
	if err != nil {
		return 0, fmt.Errorf("無法解析數值: %s", value)
	}

	return f, nil
}

// ParseInt attempts to parse a string as int
func ParseInt(value string) (int, error) {
	if value == "" {
		return 0, fmt.Errorf("數值為空")
	}

	// Trim whitespace
	value = strings.TrimSpace(value)

	// Try to parse as float first (Excel might format as "3.0")
	f, err := strconv.ParseFloat(value, 64)
	if err != nil {
		return 0, fmt.Errorf("無法解析數值: %s", value)
	}

	return int(f), nil
}

// NormalizeGender converts gender input to standardized format
func NormalizeGender(value string) (string, error) {
	value = strings.TrimSpace(value)
	value = strings.ToLower(value)

	switch value {
	case "男", "male", "m", "1":
		return "male", nil
	case "女", "female", "f", "2":
		return "female", nil
	default:
		return "", fmt.Errorf("性別必須是「男」或「女」")
	}
}

// TrimString trims whitespace and returns empty string if nil-like
func TrimString(value string) string {
	return strings.TrimSpace(value)
}

// IsEmpty checks if a string is empty or whitespace only
func IsEmpty(value string) bool {
	return strings.TrimSpace(value) == ""
}

// GetCellValue safely gets a cell value from a row slice
func GetCellValue(row []string, index int) string {
	if index < 0 || index >= len(row) {
		return ""
	}
	return row[index]
}

// ValidateStudentNumber checks if student number is valid
func ValidateStudentNumber(value string) error {
	value = strings.TrimSpace(value)
	if value == "" {
		return fmt.Errorf("座號為必填欄位")
	}
	if len(value) > 20 {
		return fmt.Errorf("座號不可超過 20 字元")
	}
	return nil
}

// ValidateName checks if name is valid
func ValidateName(value string) error {
	value = strings.TrimSpace(value)
	if value == "" {
		return fmt.Errorf("姓名為必填欄位")
	}
	if len(value) > 50 {
		return fmt.Errorf("姓名不可超過 50 字元")
	}
	return nil
}

// ValidateGrade checks if grade is valid (1-12)
func ValidateGrade(value int) error {
	if value < 1 || value > 12 {
		return fmt.Errorf("年級必須介於 1-12")
	}
	return nil
}

// ValidateClass checks if class is valid
func ValidateClass(value string) error {
	value = strings.TrimSpace(value)
	if len(value) > 20 {
		return fmt.Errorf("班級不可超過 20 字元")
	}
	return nil
}
