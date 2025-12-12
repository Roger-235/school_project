package models

import (
	"time"

	"gorm.io/gorm"
)

// Student represents a student entity belonging to a school
type Student struct {
	ID            uint           `gorm:"primarykey" json:"id"`
	SchoolID      uint           `gorm:"not null;index" json:"school_id" binding:"required"`
	StudentNumber string         `gorm:"size:20;not null" json:"student_number" binding:"required,max=20"`
	Name          string         `gorm:"size:50;not null;index" json:"name" binding:"required,max=50"`
	Grade         int            `gorm:"not null" json:"grade" binding:"required,min=1,max=12"`
	Class         string         `gorm:"size:20" json:"class" binding:"max=20"`
	Gender        string         `gorm:"size:10;not null" json:"gender" binding:"required,oneof=male female"`
	BirthDate     *time.Time     `gorm:"type:date" json:"birth_date"`
	CreatedAt     time.Time      `json:"created_at"`
	UpdatedAt     time.Time      `json:"updated_at"`
	DeletedAt     gorm.DeletedAt `gorm:"index" json:"-"`
	School        School         `gorm:"foreignKey:SchoolID" json:"school,omitempty"`
	SportRecords  []SportRecord  `gorm:"foreignKey:StudentID" json:"sport_records,omitempty"`
}

// TableName specifies the table name for Student
func (Student) TableName() string {
	return "students"
}

// CreateStudentRequest represents the request body for creating a student
type CreateStudentRequest struct {
	SchoolID      uint   `json:"school_id" binding:"required"`
	StudentNumber string `json:"student_number" binding:"required,max=20"`
	Name          string `json:"name" binding:"required,max=50"`
	Grade         int    `json:"grade" binding:"required,min=1,max=12"`
	Class         string `json:"class" binding:"max=20"`
	Gender        string `json:"gender" binding:"required,oneof=male female"`
	BirthDate     string `json:"birth_date"`
}

// UpdateStudentRequest represents the request body for updating a student
type UpdateStudentRequest struct {
	StudentNumber string `json:"student_number" binding:"required,max=20"`
	Name          string `json:"name" binding:"required,max=50"`
	Grade         int    `json:"grade" binding:"required,min=1,max=12"`
	Class         string `json:"class" binding:"max=20"`
	Gender        string `json:"gender" binding:"required,oneof=male female"`
	BirthDate     string `json:"birth_date"`
}

// StudentSearchParams represents query parameters for student search
type StudentSearchParams struct {
	Page     int    `form:"page"`
	PageSize int    `form:"page_size"`
	Name     string `form:"name"`
	SchoolID uint   `form:"school_id"`
	Grade    int    `form:"grade"`
	Gender   string `form:"gender"`
}

// StudentResponse is the API response wrapper for a single student
type StudentResponse struct {
	Data struct {
		Student Student `json:"student"`
	} `json:"data"`
}

// StudentListResponse is the API response wrapper for student list
type StudentListResponse struct {
	Data struct {
		Students   []Student  `json:"students"`
		Pagination Pagination `json:"pagination"`
		Message    string     `json:"message,omitempty"`
	} `json:"data"`
}
