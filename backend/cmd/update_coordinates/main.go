package main

import (
	"fmt"
	"log"
	"os"

	"github.com/joho/godotenv"
	"github.com/wei979/ICACP/backend/internal/models"
	"gorm.io/driver/mysql"
	"gorm.io/gorm"
)

// SchoolCoordinate holds the coordinate data for a school
type SchoolCoordinate struct {
	Name       string
	CountyName string
	Latitude   float64
	Longitude  float64
}

func main() {
	// Load .env file
	if err := godotenv.Load(); err != nil {
		log.Println("No .env file found, using environment variables")
	}

	// Get database URL
	dsn := os.Getenv("DATABASE_URL")
	if dsn == "" {
		log.Fatal("DATABASE_URL is not set")
	}

	// Connect to database
	db, err := gorm.Open(mysql.Open(dsn), &gorm.Config{})
	if err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}

	fmt.Println("Connected to database successfully")

	// School coordinates data - Corrected coordinates based on actual geographic locations
	// Data sources: Wikipedia, Google Maps, Taiwan government geographic data
	// Last updated: 2025-12
	// Coordinate format: WGS84 (decimal degrees)
	schoolCoordinates := []SchoolCoordinate{
		// ================================================
		// 高雄市學校 (Kaohsiung City)
		// ================================================
		// 那瑪夏區 (Namasia District)
		// Wikipedia: 那瑪夏國民中學 23°14′23″N 120°41′50″E → 23.2397, 120.6972
		{"那瑪夏國民中學", "高雄市", 23.2397, 120.6972},
		{"民權國民小學", "高雄市", 23.2344, 120.7022},   // 瑪雅里平和巷
		{"民生國民小學", "高雄市", 23.2728, 120.7106},   // 達卡努瓦里秀嶺巷
		// 桃源區 (Taoyuan District) - 荖濃溪上游
		{"桃源國民中學", "高雄市", 23.1566, 120.7739},
		{"桃源國民小學", "高雄市", 23.1569, 120.7742},
		{"寶山國民小學", "高雄市", 23.0897, 120.7508},   // 寶山里
		{"建山國民小學", "高雄市", 23.1281, 120.7339},   // 建山里
		{"興中國民小學", "高雄市", 23.0722, 120.7697},   // 高中里興中巷
		// 茂林區 (Maolin District) - 濁口溪流域
		{"茂林國民中學", "高雄市", 22.8831, 120.6631},
		{"茂林國民小學", "高雄市", 22.8844, 120.6639},
		{"多納國民小學", "高雄市", 22.9089, 120.6992},   // 多納里
		// 甲仙區 (Jiaxian District)
		{"甲仙國民中學", "高雄市", 23.0803, 120.5881},
		{"甲仙國民小學", "高雄市", 23.0806, 120.5889},
		{"小林國民小學", "高雄市", 23.1347, 120.6328},   // 小林里五里路

		// ================================================
		// 屏東縣學校 (Pingtung County)
		// ================================================
		// 三地門鄉 (Sandimen Township) - Wikipedia: 22°42′59″N 120°39′16″E
		{"三地國民中學", "屏東縣", 22.7247, 120.6361},   // 三地村中正路二段
		{"三地國民小學", "屏東縣", 22.7194, 120.6389},   // 三地村行政街
		{"賽嘉國民小學", "屏東縣", 22.7378, 120.6622},   // 賽嘉村
		{"德文國民小學", "屏東縣", 22.7617, 120.7031},   // 德文村
		{"青葉國民小學", "屏東縣", 22.7597, 120.6708},   // 青葉村
		// 霧臺鄉 (Wutai Township)
		{"霧臺國民小學", "屏東縣", 22.7444, 120.7342},   // 霧臺村中山巷
		// 瑪家鄉 (Majia Township)
		{"瑪家國民中學", "屏東縣", 22.7044, 120.6347},   // 北葉村風景104號
		{"北葉國民小學", "屏東縣", 22.7011, 120.6361},   // 北葉村
		{"長榮百合國民小學", "屏東縣", 22.6903, 120.6267}, // 瑪家村和平路
		// 泰武鄉 (Taiwu Township)
		{"泰武國民中學", "屏東縣", 22.6128, 120.6478},   // 佳平村
		{"泰武國民小學", "屏東縣", 22.6189, 120.6519},   // 泰武村
		{"萬安國民小學", "屏東縣", 22.5958, 120.6361},   // 萬安村
		// 來義鄉 (Laiyi Township)
		{"來義高級中學", "屏東縣", 22.5206, 120.6317},   // 古樓村中正路
		{"望嘉國民小學", "屏東縣", 22.5089, 120.6228},   // 望嘉村
		{"文樂國民小學", "屏東縣", 22.5011, 120.6297},   // 文樂村
		// 春日鄉 (Chunri Township)
		{"春日國民中學", "屏東縣", 22.3783, 120.6242},   // 春日村春日路322號
		{"春日國民小學", "屏東縣", 22.3764, 120.6228},   // 春日村春日路170號
		{"力里國民小學", "屏東縣", 22.3656, 120.6436},   // 七佳村自強路
		// 獅子鄉 (Shizi Township) - 恆春半島中央山脈西側
		{"獅子國民中學", "屏東縣", 22.2169, 120.7139},   // 獅子村15-1號
		{"丹路國民小學", "屏東縣", 22.2339, 120.7264},   // 丹路村
		{"楓林國民小學", "屏東縣", 22.2003, 120.6917},   // 楓林村楓林路
		// 牡丹鄉 (Mudan Township) - 恆春半島東側
		{"牡丹國民中學", "屏東縣", 22.1256, 120.7931},   // 石門村石門路
		{"牡丹國民小學", "屏東縣", 22.1028, 120.7764},   // 牡丹村牡丹路
		{"高士國民小學", "屏東縣", 22.0822, 120.8178},   // 高士村高士路
		// 滿州鄉 (Manzhou Township) - 恆春半島東南
		{"滿州國民中學", "屏東縣", 22.0264, 120.8369},   // 滿州村中山路43號
		{"滿州國民小學", "屏東縣", 22.0253, 120.8381},   // 滿州村中山路52號

		// ================================================
		// 臺南市學校 (Tainan City)
		// ================================================
		// 南化區
		{"南化國民中學", "臺南市", 23.0439, 120.4756},   // 南化里17號
		{"南化國民小學", "臺南市", 23.0408, 120.4728},   // 南化里230號
		{"瑞峰國民小學", "臺南市", 23.0289, 120.4989},   // 關山里
		{"玉山國民小學", "臺南市", 22.9997, 120.4519},   // 玉山里
		// 楠西區
		{"楠西國民中學", "臺南市", 23.1778, 120.4867},   // 楠西里中正路
		{"楠西國民小學", "臺南市", 23.1761, 120.4839},   // 楠西里民生路
		// 白河區
		{"白河國民中學", "臺南市", 23.3522, 120.4128},   // 昇安里三民路448號
		{"白河國民小學", "臺南市", 23.3508, 120.4106},   // 白河里三民路396號

		// ================================================
		// 嘉義縣學校 (Chiayi County)
		// ================================================
		// 阿里山鄉 (Alishan Township)
		// 阿里山國民中小學: 嘉義縣阿里山鄉樂野村1鄰31號
		{"阿里山國民中小學", "嘉義縣", 23.4736, 120.7017}, // 樂野村
		{"達邦國民小學", "嘉義縣", 23.4628, 120.7492},   // 達邦村
		{"十字國民小學", "嘉義縣", 23.4203, 120.7269},   // 十字村
		{"新美國民小學", "嘉義縣", 23.3803, 120.6947},   // 新美村
		{"山美國民小學", "嘉義縣", 23.4003, 120.7089},   // 山美村
		{"來吉國民小學", "嘉義縣", 23.5417, 120.7589},   // 來吉村
		{"豐山實驗教育學校", "嘉義縣", 23.5217, 120.7392}, // 豐山村
		{"茶山國民小學", "嘉義縣", 23.3439, 120.6728},   // 茶山村
		// 番路鄉 (Fanlu Township)
		{"民和國民中學", "嘉義縣", 23.4478, 120.5706},   // 民和村菜公店
		{"民和國民小學", "嘉義縣", 23.4461, 120.5692},   // 民和村菜公店117號
		// 竹崎鄉 (Zhuqi Township)
		{"竹崎高級中學", "嘉義縣", 23.5228, 120.5506},   // 竹崎村中山路
		{"竹崎國民小學", "嘉義縣", 23.5214, 120.5483},   // 竹崎村文化路

		// ================================================
		// 嘉義市學校 (Chiayi City)
		// ================================================
		{"北興國民中學", "嘉義市", 23.4978, 120.4519},   // 後湖里博東路
		{"北園國民小學", "嘉義市", 23.4858, 120.4389},   // 北湖里北社尾路
		{"興安國民小學", "嘉義市", 23.4917, 120.4608},   // 興安里重慶路
		{"嘉義國民小學", "嘉義市", 23.4803, 120.4489},   // 芳草里公明路
	}

	// Update coordinates
	var updated, notFound int
	for _, sc := range schoolCoordinates {
		result := db.Model(&models.School{}).
			Where("name = ? AND county_name = ?", sc.Name, sc.CountyName).
			Updates(map[string]interface{}{
				"latitude":  sc.Latitude,
				"longitude": sc.Longitude,
			})

		if result.Error != nil {
			log.Printf("Error updating %s: %v\n", sc.Name, result.Error)
			continue
		}

		if result.RowsAffected == 0 {
			fmt.Printf("Not found: %s (%s)\n", sc.Name, sc.CountyName)
			notFound++
		} else {
			fmt.Printf("Updated: %s (%s) -> [%.4f, %.4f]\n", sc.Name, sc.CountyName, sc.Latitude, sc.Longitude)
			updated++
		}
	}

	fmt.Printf("\n========================================\n")
	fmt.Printf("Update completed: %d updated, %d not found\n", updated, notFound)

	// Print summary of schools with coordinates
	var countWithCoords int64
	db.Model(&models.School{}).
		Where("latitude IS NOT NULL AND longitude IS NOT NULL").
		Count(&countWithCoords)
	fmt.Printf("Total schools with coordinates: %d\n", countWithCoords)
}
