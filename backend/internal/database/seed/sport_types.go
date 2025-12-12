package seed

import (
	"fmt"

	"github.com/wei979/ICACP/backend/internal/models"
	"gorm.io/gorm"
)

// SeedSportTypes seeds the 17 predefined sport types into the database
func SeedSportTypes(db *gorm.DB) error {
	fmt.Println("Seeding sport types...")

	sportTypes := []models.SportType{
		// 體適能 (Fitness)
		{Name: "800公尺", Category: models.CategoryFitness, DefaultUnit: "秒", ValueType: models.ValueTypeTime},
		{Name: "1600公尺", Category: models.CategoryFitness, DefaultUnit: "秒", ValueType: models.ValueTypeTime},
		{Name: "坐姿體前彎", Category: models.CategoryFitness, DefaultUnit: "公分", ValueType: models.ValueTypeDistance},
		{Name: "1分鐘仰臥起坐", Category: models.CategoryFitness, DefaultUnit: "次", ValueType: models.ValueTypeCount},
		{Name: "立定跳遠", Category: models.CategoryFitness, DefaultUnit: "公分", ValueType: models.ValueTypeDistance},
		{Name: "1分鐘屈膝仰臥起坐", Category: models.CategoryFitness, DefaultUnit: "次", ValueType: models.ValueTypeCount},

		// 田徑 (Track & Field)
		{Name: "100公尺", Category: models.CategoryTrackField, DefaultUnit: "秒", ValueType: models.ValueTypeTime},
		{Name: "200公尺", Category: models.CategoryTrackField, DefaultUnit: "秒", ValueType: models.ValueTypeTime},
		{Name: "400公尺", Category: models.CategoryTrackField, DefaultUnit: "秒", ValueType: models.ValueTypeTime},
		{Name: "跳遠", Category: models.CategoryTrackField, DefaultUnit: "公分", ValueType: models.ValueTypeDistance},
		{Name: "跳高", Category: models.CategoryTrackField, DefaultUnit: "公分", ValueType: models.ValueTypeDistance},
		{Name: "鉛球", Category: models.CategoryTrackField, DefaultUnit: "公尺", ValueType: models.ValueTypeDistance},
		{Name: "壘球擲遠", Category: models.CategoryTrackField, DefaultUnit: "公尺", ValueType: models.ValueTypeDistance},

		// 球類 (Ball Sports)
		{Name: "籃球運球", Category: models.CategoryBallSports, DefaultUnit: "秒", ValueType: models.ValueTypeTime},
		{Name: "足球運球", Category: models.CategoryBallSports, DefaultUnit: "秒", ValueType: models.ValueTypeTime},
		{Name: "排球墊球", Category: models.CategoryBallSports, DefaultUnit: "次", ValueType: models.ValueTypeCount},
		{Name: "桌球正手擊球", Category: models.CategoryBallSports, DefaultUnit: "次", ValueType: models.ValueTypeCount},
	}

	for _, st := range sportTypes {
		// Use FirstOrCreate to avoid duplicates
		result := db.Where("name = ?", st.Name).FirstOrCreate(&st)
		if result.Error != nil {
			return fmt.Errorf("failed to seed sport type %s: %w", st.Name, result.Error)
		}
	}

	fmt.Printf("✓ Seeded %d sport types successfully\n", len(sportTypes))
	return nil
}
