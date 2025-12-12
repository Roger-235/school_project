package models

import (
	"time"

	"gorm.io/gorm"
)

// School represents a school entity
type School struct {
	ID           uint           `gorm:"primarykey" json:"id"`
	Name         string         `gorm:"size:100;not null" json:"name" binding:"required,max=100"`
	CountyName   string         `gorm:"size:50;not null;index" json:"county_name" binding:"required"`
	Address      string         `gorm:"size:255" json:"address" binding:"max=255"`
	Phone        string         `gorm:"size:20" json:"phone" binding:"max=20"`
	Latitude     *float64       `gorm:"type:decimal(10,8)" json:"latitude"`
	Longitude    *float64       `gorm:"type:decimal(11,8)" json:"longitude"`
	CreatedAt    time.Time      `json:"created_at"`
	UpdatedAt    time.Time      `json:"updated_at"`
	DeletedAt    gorm.DeletedAt `gorm:"index" json:"-"`
	Students     []Student      `gorm:"foreignKey:SchoolID" json:"students,omitempty"`
	StudentCount int            `gorm:"->" json:"student_count"`
}

// SchoolMapData represents lightweight school data for map display
type SchoolMapData struct {
	ID           uint    `json:"id"`
	Name         string  `json:"name"`
	Latitude     float64 `json:"latitude"`
	Longitude    float64 `json:"longitude"`
	StudentCount int     `json:"student_count"`
	CountyName   string  `json:"county_name"`
}

// SchoolMapResponse is the API response for school map data
type SchoolMapResponse struct {
	Data struct {
		Schools []SchoolMapData `json:"schools"`
		Total   int             `json:"total"`
	} `json:"data"`
}

// TableName specifies the table name for School
func (School) TableName() string {
	return "schools"
}

// CreateSchoolRequest represents the request body for creating a school
type CreateSchoolRequest struct {
	Name       string   `json:"name" binding:"required,max=100"`
	CountyName string   `json:"county_name" binding:"required"`
	Address    string   `json:"address" binding:"max=255"`
	Phone      string   `json:"phone" binding:"max=20"`
	Latitude   *float64 `json:"latitude"`
	Longitude  *float64 `json:"longitude"`
}

// UpdateSchoolRequest represents the request body for updating a school
type UpdateSchoolRequest struct {
	Name       string   `json:"name" binding:"required,max=100"`
	CountyName string   `json:"county_name" binding:"required"`
	Address    string   `json:"address" binding:"max=255"`
	Phone      string   `json:"phone" binding:"max=20"`
	Latitude   *float64 `json:"latitude"`
	Longitude  *float64 `json:"longitude"`
}

// SchoolResponse is the API response wrapper for a single school
type SchoolResponse struct {
	Data struct {
		School School `json:"school"`
	} `json:"data"`
}

// SchoolListResponse is the API response wrapper for school list
type SchoolListResponse struct {
	Data struct {
		Schools    []School   `json:"schools"`
		Pagination Pagination `json:"pagination"`
	} `json:"data"`
}

// Pagination represents pagination info in list responses
type Pagination struct {
	Page       int `json:"page"`
	PageSize   int `json:"page_size"`
	Total      int `json:"total"`
	TotalPages int `json:"total_pages"`
}
