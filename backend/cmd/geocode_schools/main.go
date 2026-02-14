package main

import (
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"net/url"
	"os"
	"strings"
	"time"

	"github.com/joho/godotenv"
	"github.com/wei979/ICACP/backend/internal/models"
	"gorm.io/driver/mysql"
	"gorm.io/gorm"
)

// NominatimResponse represents the response from Nominatim API
type NominatimResponse struct {
	PlaceID     int     `json:"place_id"`
	Lat         string  `json:"lat"`
	Lon         string  `json:"lon"`
	DisplayName string  `json:"display_name"`
	Class       string  `json:"class"`
	Type        string  `json:"type"`
	Importance  float64 `json:"importance"`
}

// School represents a school record for geocoding
type School struct {
	ID         uint
	Name       string
	CountyName string
	Address    string
	Latitude   *float64
	Longitude  *float64
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
	fmt.Println("========================================")
	fmt.Println("Geocoding Schools using Nominatim API")
	fmt.Println("========================================")

	// Get all schools
	var schools []School
	result := db.Model(&models.School{}).
		Select("id, name, county_name, address, latitude, longitude").
		Find(&schools)

	if result.Error != nil {
		log.Fatalf("Failed to fetch schools: %v", result.Error)
	}

	fmt.Printf("Found %d schools to process\n\n", len(schools))

	// Process each school
	var updated, failed, skipped int
	for i, school := range schools {
		// Skip if no address
		if school.Address == "" {
			fmt.Printf("[%d/%d] SKIP: %s - No address\n", i+1, len(schools), school.Name)
			skipped++
			continue
		}

		fmt.Printf("[%d/%d] Processing: %s\n", i+1, len(schools), school.Name)

		// Try multiple search strategies
		var lat, lon float64
		var searchErr error
		var searchMethod string

		// Strategy 1: Search by school name in Taiwan
		searchQuery := fmt.Sprintf("%s %s Taiwan", school.Name, school.CountyName)
		lat, lon, searchErr = geocodeAddress(searchQuery)
		searchMethod = "school name"

		// Strategy 2: Try with address if Strategy 1 failed
		if searchErr != nil {
			time.Sleep(1100 * time.Millisecond)
			fullAddress := buildFullAddress(school.Address, school.CountyName)
			lat, lon, searchErr = geocodeAddress(fullAddress)
			searchMethod = "address"
		}

		// Strategy 3: Try simplified search
		if searchErr != nil {
			time.Sleep(1100 * time.Millisecond)
			// Extract district from address (e.g., 那瑪夏區, 三地門鄉)
			district := extractDistrict(school.Address)
			if district != "" {
				searchQuery = fmt.Sprintf("%s %s Taiwan", school.Name, district)
				lat, lon, searchErr = geocodeAddress(searchQuery)
				searchMethod = "district"
			}
		}

		// Strategy 4: Search school name only
		if searchErr != nil {
			time.Sleep(1100 * time.Millisecond)
			lat, lon, searchErr = geocodeAddress(school.Name + " Taiwan school")
			searchMethod = "name only"
		}

		if searchErr != nil {
			fmt.Printf("         ERROR: %v\n", searchErr)
			failed++
			time.Sleep(1100 * time.Millisecond)
			continue
		}

		// Validate coordinates are within Taiwan bounds
		if !isInTaiwan(lat, lon) {
			fmt.Printf("         ERROR: Coordinates [%.6f, %.6f] outside Taiwan\n", lat, lon)
			failed++
			time.Sleep(1100 * time.Millisecond)
			continue
		}

		// Update database
		updateResult := db.Model(&models.School{}).
			Where("id = ?", school.ID).
			Updates(map[string]interface{}{
				"latitude":  lat,
				"longitude": lon,
			})

		if updateResult.Error != nil {
			fmt.Printf("         DB ERROR: %v\n", updateResult.Error)
			failed++
			continue
		}

		fmt.Printf("         SUCCESS (%s): [%.6f, %.6f]\n", searchMethod, lat, lon)
		updated++

		// Rate limiting: Nominatim requires max 1 request per second
		time.Sleep(1100 * time.Millisecond)
	}

	fmt.Println("\n========================================")
	fmt.Printf("Geocoding completed:\n")
	fmt.Printf("  Updated: %d\n", updated)
	fmt.Printf("  Failed:  %d\n", failed)
	fmt.Printf("  Skipped: %d\n", skipped)
	fmt.Printf("  Total:   %d\n", len(schools))
	fmt.Println("========================================")

	// Print schools that still have issues
	if failed > 0 {
		fmt.Println("\nSchools that failed geocoding:")
		for _, school := range schools {
			if school.Address == "" {
				continue
			}
			// Re-check database for updated coordinates
			var updated School
			db.Model(&models.School{}).
				Select("id, name, latitude, longitude").
				Where("id = ?", school.ID).
				First(&updated)

			if updated.Latitude == nil || updated.Longitude == nil {
				fmt.Printf("  - %s (%s)\n", school.Name, school.CountyName)
			}
		}
	}
}

// isInTaiwan checks if coordinates are within Taiwan's approximate bounds
func isInTaiwan(lat, lon float64) bool {
	// Taiwan bounds: roughly 21.5-26.5°N, 119.5-122.5°E
	return lat >= 21.5 && lat <= 26.5 && lon >= 119.5 && lon <= 122.5
}

// extractDistrict extracts district/township name from address
func extractDistrict(address string) string {
	// Common patterns for Taiwan districts
	// e.g., "高雄市那瑪夏區..." -> "那瑪夏區"
	// e.g., "屏東縣三地門鄉..." -> "三地門鄉"
	suffixes := []string{"區", "鄉", "鎮", "市"}

	for _, suffix := range suffixes {
		idx := strings.Index(address, suffix)
		if idx > 0 {
			// Find start of district name (after 縣 or 市)
			start := 0
			if countyIdx := strings.Index(address, "縣"); countyIdx >= 0 && countyIdx < idx {
				start = countyIdx + len("縣")
			} else if cityIdx := strings.Index(address, "市"); cityIdx >= 0 && cityIdx < idx {
				start = cityIdx + len("市")
			}
			return address[start : idx+len(suffix)]
		}
	}
	return ""
}

// buildFullAddress creates a full address string for geocoding
func buildFullAddress(address, countyName string) string {
	// Clean up address
	address = strings.TrimSpace(address)

	// Add county if not already in address
	if !strings.Contains(address, countyName) {
		address = countyName + address
	}

	// Add Taiwan suffix for better geocoding
	if !strings.Contains(address, "台灣") && !strings.Contains(address, "Taiwan") {
		address = address + ", Taiwan"
	}

	return address
}

// geocodeAddress calls Nominatim API to get coordinates for an address
func geocodeAddress(address string) (float64, float64, error) {
	// Build API URL
	baseURL := "https://nominatim.openstreetmap.org/search"
	params := url.Values{}
	params.Add("q", address)
	params.Add("format", "json")
	params.Add("countrycodes", "tw")
	params.Add("limit", "1")

	fullURL := fmt.Sprintf("%s?%s", baseURL, params.Encode())

	// Create HTTP client with timeout
	client := &http.Client{
		Timeout: 10 * time.Second,
	}

	// Create request with required User-Agent header
	req, err := http.NewRequest("GET", fullURL, nil)
	if err != nil {
		return 0, 0, fmt.Errorf("failed to create request: %v", err)
	}

	// Nominatim requires a valid User-Agent
	req.Header.Set("User-Agent", "ICACP-School-Geocoder/1.0 (Taiwan Educational Data)")

	// Make request
	resp, err := client.Do(req)
	if err != nil {
		return 0, 0, fmt.Errorf("API request failed: %v", err)
	}
	defer resp.Body.Close()

	// Check status code
	if resp.StatusCode != http.StatusOK {
		return 0, 0, fmt.Errorf("API returned status %d", resp.StatusCode)
	}

	// Read response body
	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return 0, 0, fmt.Errorf("failed to read response: %v", err)
	}

	// Parse JSON response
	var results []NominatimResponse
	if err := json.Unmarshal(body, &results); err != nil {
		return 0, 0, fmt.Errorf("failed to parse JSON: %v", err)
	}

	// Check if we got results
	if len(results) == 0 {
		return 0, 0, fmt.Errorf("no results found")
	}

	// Parse coordinates
	var lat, lon float64
	if _, err := fmt.Sscanf(results[0].Lat, "%f", &lat); err != nil {
		return 0, 0, fmt.Errorf("failed to parse latitude: %v", err)
	}
	if _, err := fmt.Sscanf(results[0].Lon, "%f", &lon); err != nil {
		return 0, 0, fmt.Errorf("failed to parse longitude: %v", err)
	}

	return lat, lon, nil
}
