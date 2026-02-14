package seed

import (
	"fmt"
	"math/rand"
	"time"

	"github.com/wei979/ICACP/backend/internal/models"
	"gorm.io/gorm"
)

// SeedPerformanceTestData generates test data for performance testing
// Creates 1000 students across multiple schools with 500 sport records each
func SeedPerformanceTestData(db *gorm.DB) error {
	fmt.Println("Generating performance test data...")
	startTime := time.Now()

	// Create 10 test schools
	schools := createTestSchools(db)
	if len(schools) == 0 {
		return fmt.Errorf("failed to create test schools")
	}

	// Get sport types
	var sportTypes []models.SportType
	if err := db.Find(&sportTypes).Error; err != nil {
		return fmt.Errorf("failed to get sport types: %w", err)
	}
	if len(sportTypes) == 0 {
		return fmt.Errorf("no sport types found, please seed sport types first")
	}

	// Create 1000 students (100 per school)
	totalStudents := 1000
	studentsPerSchool := totalStudents / len(schools)
	recordsPerStudent := 500

	studentCount := 0
	recordCount := 0

	for _, school := range schools {
		fmt.Printf("Creating students for school: %s\n", school.Name)

		for i := 0; i < studentsPerSchool; i++ {
			student := createStudent(db, school.ID, i+1)
			if student == nil {
				continue
			}
			studentCount++

			// Create 500 sport records for each student
			records := createSportRecords(student.ID, sportTypes, recordsPerStudent)
			if len(records) > 0 {
				if err := db.CreateInBatches(records, 100).Error; err != nil {
					fmt.Printf("Warning: Failed to create some records for student %d: %v\n", student.ID, err)
				} else {
					recordCount += len(records)
				}
			}

			// Progress update every 100 students
			if studentCount%100 == 0 {
				fmt.Printf("  Progress: %d/%d students created, %d records total\n",
					studentCount, totalStudents, recordCount)
			}
		}
	}

	elapsed := time.Since(startTime)
	fmt.Printf("✓ Performance test data generated successfully!\n")
	fmt.Printf("  - Schools: %d\n", len(schools))
	fmt.Printf("  - Students: %d\n", studentCount)
	fmt.Printf("  - Sport Records: %d\n", recordCount)
	fmt.Printf("  - Time elapsed: %v\n", elapsed)

	return nil
}

func createTestSchools(db *gorm.DB) []models.School {
	counties := []string{
		"臺北市", "新北市", "桃園市", "臺中市", "臺南市",
		"高雄市", "新竹市", "基隆市", "嘉義市", "新竹縣",
	}

	var schools []models.School
	for i, county := range counties {
		school := models.School{
			Name:       fmt.Sprintf("效能測試國小%d", i+1),
			CountyName: county,
			Address:    fmt.Sprintf("%s測試路%d號", county, i+1),
			Phone:      fmt.Sprintf("02-%04d-%04d", rand.Intn(10000), rand.Intn(10000)),
		}

		// Check if school already exists
		var existing models.School
		if err := db.Where("name = ?", school.Name).First(&existing).Error; err == nil {
			schools = append(schools, existing)
			continue
		}

		if err := db.Create(&school).Error; err != nil {
			fmt.Printf("Warning: Failed to create school %s: %v\n", school.Name, err)
			continue
		}
		schools = append(schools, school)
	}

	return schools
}

func createStudent(db *gorm.DB, schoolID uint, index int) *models.Student {
	firstNames := []string{"小明", "小華", "小美", "小強", "小玲", "小偉", "小芳", "小龍", "小雲", "小傑"}
	lastNames := []string{"王", "李", "張", "陳", "林", "黃", "吳", "劉", "蔡", "楊"}
	genders := []string{"male", "female"}

	student := models.Student{
		SchoolID:      schoolID,
		StudentNumber: fmt.Sprintf("PT%05d", index),
		Name:          lastNames[rand.Intn(len(lastNames))] + firstNames[rand.Intn(len(firstNames))],
		Grade:         rand.Intn(6) + 1,
		Class:         fmt.Sprintf("%d班", rand.Intn(5)+1),
		Gender:        genders[rand.Intn(2)],
		BirthDate:     generateRandomBirthDate(),
	}

	// Check if student number already exists in this school
	var existing models.Student
	if err := db.Where("school_id = ? AND student_number = ?", schoolID, student.StudentNumber).First(&existing).Error; err == nil {
		return &existing
	}

	if err := db.Create(&student).Error; err != nil {
		fmt.Printf("Warning: Failed to create student %s: %v\n", student.StudentNumber, err)
		return nil
	}

	return &student
}

func createSportRecords(studentID uint, sportTypes []models.SportType, count int) []models.SportRecord {
	records := make([]models.SportRecord, 0, count)

	// Distribute records across sport types
	recordsPerType := count / len(sportTypes)
	if recordsPerType == 0 {
		recordsPerType = 1
	}

	baseDate := time.Now().AddDate(-2, 0, 0) // Start from 2 years ago

	for _, sportType := range sportTypes {
		for i := 0; i < recordsPerType; i++ {
			testDate := baseDate.Add(time.Duration(rand.Intn(730)) * 24 * time.Hour) // Random day within 2 years

			record := models.SportRecord{
				StudentID:   studentID,
				SportTypeID: sportType.ID,
				Value:       generateValueForSportType(sportType),
				TestDate:    testDate,
				Notes:       "",
			}
			records = append(records, record)

			if len(records) >= count {
				return records
			}
		}
	}

	return records
}

func generateRandomBirthDate() string {
	// Generate birth date for elementary school students (ages 6-12)
	currentYear := time.Now().Year()
	birthYear := currentYear - rand.Intn(7) - 6 // 6-12 years old
	birthMonth := rand.Intn(12) + 1
	birthDay := rand.Intn(28) + 1

	return fmt.Sprintf("%04d-%02d-%02d", birthYear, birthMonth, birthDay)
}

func generateValueForSportType(sportType models.SportType) float64 {
	// Generate realistic values based on sport type
	switch sportType.ValueType {
	case "time":
		// Time-based events (seconds)
		switch sportType.Name {
		case "50公尺":
			return 7.5 + rand.Float64()*4 // 7.5-11.5 seconds
		case "800公尺":
			return 180 + rand.Float64()*120 // 180-300 seconds (3-5 min)
		case "1600公尺":
			return 420 + rand.Float64()*300 // 420-720 seconds (7-12 min)
		default:
			return 30 + rand.Float64()*60
		}
	case "distance":
		// Distance events
		switch sportType.Name {
		case "立定跳遠":
			return 100 + rand.Float64()*100 // 100-200 cm
		case "壘球擲遠":
			return 15 + rand.Float64()*25 // 15-40 meters
		case "鉛球":
			return 4 + rand.Float64()*6 // 4-10 meters
		case "跳高":
			return 80 + rand.Float64()*50 // 80-130 cm
		case "跳遠":
			return 200 + rand.Float64()*200 // 200-400 cm
		default:
			return 50 + rand.Float64()*100
		}
	case "count":
		// Count-based events
		switch sportType.Name {
		case "1分鐘仰臥起坐":
			return float64(20 + rand.Intn(30)) // 20-50 reps
		case "1分鐘屈膝仰臥起坐":
			return float64(20 + rand.Intn(30)) // 20-50 reps
		default:
			return float64(10 + rand.Intn(40))
		}
	case "measurement":
		// Measurement events (like BMI, flexibility)
		return 15 + rand.Float64()*20 // Generic measurement
	default:
		return 50 + rand.Float64()*50
	}
}

// CleanPerformanceTestData removes all performance test data
func CleanPerformanceTestData(db *gorm.DB) error {
	fmt.Println("Cleaning performance test data...")

	// Find and delete test schools (with cascade delete)
	var schools []models.School
	if err := db.Where("name LIKE ?", "效能測試國小%").Find(&schools).Error; err != nil {
		return fmt.Errorf("failed to find test schools: %w", err)
	}

	for _, school := range schools {
		// Delete all students and their records for this school
		var students []models.Student
		db.Where("school_id = ?", school.ID).Find(&students)

		for _, student := range students {
			db.Unscoped().Where("student_id = ?", student.ID).Delete(&models.SportRecord{})
		}

		db.Unscoped().Where("school_id = ?", school.ID).Delete(&models.Student{})
		db.Unscoped().Delete(&school)
	}

	fmt.Printf("✓ Cleaned %d test schools and their data\n", len(schools))
	return nil
}
