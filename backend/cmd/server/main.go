package main

import (
	"fmt"
	"log"
	"os"

	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
	"github.com/wei979/ICACP/backend/config"
	"github.com/wei979/ICACP/backend/internal/handlers"
	"github.com/wei979/ICACP/backend/internal/services"
	"gorm.io/driver/mysql"
	"gorm.io/gorm"
)

func main() {
	// Load environment variables
	if err := godotenv.Load(); err != nil {
		log.Println("Warning: .env file not found, using environment variables")
	}

	// Initialize database
	db, err := initDatabase()
	if err != nil {
		log.Fatal("Failed to initialize database:", err)
	}

	// Initialize Redis
	if err := config.InitRedis(); err != nil {
		log.Fatal("Failed to initialize Redis:", err)
	}
	defer config.CloseRedis()

	// Initialize Gin router
	router := gin.Default()

	// CORS middleware
	router.Use(corsMiddleware())

	// Health check
	router.GET("/health", func(c *gin.Context) {
		c.JSON(200, gin.H{"status": "ok"})
	})

	// API v1 routes
	v1 := router.Group("/api/v1")

	// County statistics routes (protected)
	countyService := services.NewCountyService(db, config.GetRedisClient())
	countyHandler := handlers.NewCountyHandler(countyService)

	countyRoutes := v1.Group("/counties")
	// TODO: Add auth middleware when available from 001-user-auth
	// countyRoutes.Use(authMiddleware())
	{
		countyRoutes.GET("/statistics", countyHandler.GetAllCountyStatistics)
		countyRoutes.GET("/:countyName/statistics", countyHandler.GetCountyStatistics)
	}

	// Start server
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	fmt.Printf("🚀 Server starting on port %s\n", port)
	if err := router.Run(":" + port); err != nil {
		log.Fatal("Failed to start server:", err)
	}
}

func initDatabase() (*gorm.DB, error) {
	dsn := os.Getenv("DATABASE_URL")
	if dsn == "" {
		return nil, fmt.Errorf("DATABASE_URL environment variable not set")
	}

	db, err := gorm.Open(mysql.Open(dsn), &gorm.Config{})
	if err != nil {
		return nil, fmt.Errorf("failed to connect to database: %w", err)
	}

	fmt.Println("✓ Connected to MySQL database successfully")
	return db, nil
}

func corsMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		frontendURL := os.Getenv("FRONTEND_URL")
		if frontendURL == "" {
			frontendURL = "http://localhost:3000"
		}

		c.Writer.Header().Set("Access-Control-Allow-Origin", frontendURL)
		c.Writer.Header().Set("Access-Control-Allow-Credentials", "true")
		c.Writer.Header().Set("Access-Control-Allow-Headers", "Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization, accept, origin, Cache-Control, X-Requested-With")
		c.Writer.Header().Set("Access-Control-Allow-Methods", "POST, OPTIONS, GET, PUT, DELETE, PATCH")

		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(204)
			return
		}

		c.Next()
	}
}

// Placeholder for auth middleware (to be imported from 001-user-auth)
// func authMiddleware() gin.HandlerFunc {
// 	return func(c *gin.Context) {
// 		// TODO: Import from 001-user-auth feature
// 		c.Next()
// 	}
// }
