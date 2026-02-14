package database

import (
	"fmt"

	"github.com/wei979/ICACP/backend/internal/database/seed"
	"github.com/wei979/ICACP/backend/internal/models"
	"gorm.io/gorm"
)

// Migrate runs all database migrations
func Migrate(db *gorm.DB) error {
	fmt.Println("Running database migrations...")

	// AutoMigrate all models in correct order (dependencies first)
	err := db.AutoMigrate(
		&models.School{},
		&models.SportType{},
		&models.Student{},
		&models.SportRecord{},
		&models.SportRecordAudit{},
		&models.NationalAverage{},
	)
	if err != nil {
		return fmt.Errorf("failed to run migrations: %w", err)
	}

	// Add composite unique index for student_number per school
	if !db.Migrator().HasIndex(&models.Student{}, "idx_school_student_number") {
		err = db.Exec("CREATE UNIQUE INDEX idx_school_student_number ON students (school_id, student_number) WHERE deleted_at IS NULL").Error
		if err != nil {
			// MySQL doesn't support partial indexes, use a different approach
			// Create a unique index that includes deleted_at handling via application logic
			fmt.Println("Note: Partial unique index not supported, using application-level validation for student number uniqueness")
		}
	}

	fmt.Println("✓ Database migrations completed successfully")
	return nil
}

// MigrateAndSeed runs migrations and seeds initial data
func MigrateAndSeed(db *gorm.DB) error {
	// Run migrations first
	if err := Migrate(db); err != nil {
		return err
	}

	// Seed sport types
	if err := seed.SeedSportTypes(db); err != nil {
		return fmt.Errorf("failed to seed sport types: %w", err)
	}

	return nil
}
