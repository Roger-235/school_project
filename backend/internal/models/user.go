package models

import (
	"time"

	"gorm.io/gorm"
)

// UserRole 定義使用者角色
type UserRole string

const (
	RoleAdmin UserRole = "admin"
	RoleUser  UserRole = "user"
)

// User 使用者模型
type User struct {
	ID           uint           `gorm:"primarykey" json:"id"`
	Email        string         `gorm:"uniqueIndex;size:255;not null" json:"email"`
	Name         string         `gorm:"size:100;not null" json:"name"`
	PasswordHash string         `gorm:"size:255" json:"-"`
	Role         UserRole       `gorm:"size:20;not null;default:user" json:"role"`
	CreatedAt    time.Time      `json:"created_at"`
	UpdatedAt    time.Time      `json:"updated_at"`
	DeletedAt    gorm.DeletedAt `gorm:"index" json:"-"`
}

func (User) TableName() string {
	return "users"
}

func (u *User) IsAdmin() bool {
	return u.Role == RoleAdmin
}
