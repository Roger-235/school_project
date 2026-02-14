package models

import (
	"time"
)

// SportRecordAudit tracks changes to sport records for audit purposes
type SportRecordAudit struct {
	ID            uint      `gorm:"primarykey" json:"id"`
	SportRecordID uint      `gorm:"not null;index" json:"sport_record_id"`
	OldValue      *float64  `gorm:"type:decimal(10,2)" json:"old_value"`
	NewValue      *float64  `gorm:"type:decimal(10,2)" json:"new_value"`
	ChangedBy     uint      `gorm:"not null" json:"changed_by"`
	ChangedAt     time.Time `json:"changed_at"`
	Reason        string    `gorm:"size:255" json:"reason"`
}

// TableName specifies the table name for SportRecordAudit
func (SportRecordAudit) TableName() string {
	return "sport_record_audits"
}

// SportRecordAuditListResponse is the API response wrapper for audit history
type SportRecordAuditListResponse struct {
	Data struct {
		Audits  []SportRecordAudit `json:"audits"`
		Message string             `json:"message,omitempty"`
	} `json:"data"`
}
