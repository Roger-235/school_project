package models

import (
	"time"

	"gorm.io/gorm"
)

// SportRecord represents a sport test record for a student
type SportRecord struct {
	ID          uint           `gorm:"primarykey" json:"id"`
	StudentID   uint           `gorm:"not null;index" json:"student_id" binding:"required"`
	SportTypeID uint           `gorm:"not null;index" json:"sport_type_id" binding:"required"`
	Value       float64        `gorm:"type:decimal(10,2);not null" json:"value" binding:"required,gt=0"`
	TestDate    time.Time      `gorm:"type:date;not null;index" json:"test_date" binding:"required"`
	Notes       string         `gorm:"size:500" json:"notes" binding:"max=500"`
	CreatedAt   time.Time      `json:"created_at"`
	UpdatedAt   time.Time      `json:"updated_at"`
	DeletedAt   gorm.DeletedAt `gorm:"index" json:"-"`
	Student     Student        `gorm:"foreignKey:StudentID" json:"student,omitempty"`
	SportType   SportType      `gorm:"foreignKey:SportTypeID" json:"sport_type,omitempty"`
}

// TableName specifies the table name for SportRecord
func (SportRecord) TableName() string {
	return "sport_records"
}

// CreateSportRecordRequest represents the request body for creating a sport record
type CreateSportRecordRequest struct {
	StudentID   uint    `json:"student_id" binding:"required"`
	SportTypeID uint    `json:"sport_type_id" binding:"required"`
	Value       float64 `json:"value" binding:"required,gt=0"`
	TestDate    string  `json:"test_date" binding:"required"`
	Notes       string  `json:"notes" binding:"max=500"`
}

// UpdateSportRecordRequest represents the request body for updating a sport record
type UpdateSportRecordRequest struct {
	Value    float64 `json:"value" binding:"required,gt=0"`
	TestDate string  `json:"test_date" binding:"required"`
	Notes    string  `json:"notes" binding:"max=500"`
	Reason   string  `json:"reason" binding:"max=255"`
}

// SportRecordResponse is the API response wrapper for a single sport record
type SportRecordResponse struct {
	Data struct {
		Record SportRecord `json:"record"`
	} `json:"data"`
}

// SportRecordListResponse is the API response wrapper for sport record list
type SportRecordListResponse struct {
	Data struct {
		Records    []SportRecord `json:"records"`
		Pagination Pagination    `json:"pagination"`
	} `json:"data"`
}
