package main

import (
	"fmt"
	"log"
	"os"

	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
	"github.com/wei979/ICACP/backend/config"
	"github.com/wei979/ICACP/backend/internal/database"
	"github.com/wei979/ICACP/backend/internal/handlers"
	"github.com/wei979/ICACP/backend/internal/middleware"
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

	// Run migrations and seed data
	if err := database.MigrateAndSeed(db); err != nil {
		log.Fatal("Failed to run migrations:", err)
	}

	// Initialize Redis
	if err := config.InitRedis(); err != nil {
		log.Fatal("Failed to initialize Redis:", err)
	}
	defer config.CloseRedis()

	// Initialize auth service
	authSvc := services.NewAuthService(db)

	// Initialize Gin router
	router := gin.Default()

	// Global middleware
	router.Use(corsMiddleware())
	router.Use(middleware.SecurityHeaders())

	// Health check
	router.GET("/health", func(c *gin.Context) {
		c.JSON(200, gin.H{"status": "ok"})
	})

	// API v1 routes
	v1 := router.Group("/api/v1")

	// Auth routes (public)
	authHandler := handlers.NewAuthHandler(authSvc)
	authRoutes := v1.Group("/auth")
	{
		authRoutes.POST("/login", authHandler.Login)
		authRoutes.GET("/me", middleware.RequireAuth(authSvc), authHandler.Me)
	}

	// County statistics routes (read-only, public)
	countyService := services.NewCountyService(db, config.GetRedisClient())
	countyHandler := handlers.NewCountyHandler(countyService)

	countyRoutes := v1.Group("/counties")
	{
		countyRoutes.GET("/statistics", countyHandler.GetAllCountyStatistics)
		countyRoutes.GET("/:countyName/statistics", countyHandler.GetCountyStatistics)
	}

	// School routes
	schoolService := services.NewSchoolService(db)
	schoolHandler := handlers.NewSchoolHandler(schoolService)

	schoolRoutes := v1.Group("/schools")
	{
		schoolRoutes.GET("/map", schoolHandler.GetForMap) // Must be before /:id
		schoolRoutes.GET("", schoolHandler.List)
		schoolRoutes.GET("/:id", schoolHandler.Get)
		schoolRoutes.POST("", middleware.RequireAuth(authSvc), schoolHandler.Create)
		schoolRoutes.PUT("/:id", middleware.RequireAuth(authSvc), schoolHandler.Update)
		schoolRoutes.DELETE("/:id", middleware.RequireAuth(authSvc), schoolHandler.Delete)
	}

	// Student routes
	studentService := services.NewStudentService(db)
	studentHandler := handlers.NewStudentHandler(studentService)

	studentRoutes := v1.Group("/students")
	studentRoutes.Use(middleware.RequireAuth(authSvc))
	{
		studentRoutes.GET("", studentHandler.List)
		studentRoutes.GET("/:id", studentHandler.Get)
		studentRoutes.GET("/:id/records", studentHandler.GetWithRecords)
		studentRoutes.POST("", studentHandler.Create)
		studentRoutes.PUT("/:id", studentHandler.Update)
		studentRoutes.DELETE("/:id", studentHandler.Delete)
	}

	// Sport type routes (read-only, public)
	sportTypeService := services.NewSportTypeService(db)
	sportTypeHandler := handlers.NewSportTypeHandler(sportTypeService)

	sportTypeRoutes := v1.Group("/sport-types")
	{
		sportTypeRoutes.GET("", sportTypeHandler.List)
		sportTypeRoutes.GET("/categories", sportTypeHandler.GetCategories)
		sportTypeRoutes.GET("/:id", sportTypeHandler.Get)
	}

	// ========== Statistics routes ==========
	statisticsService := services.NewStatisticsService(db, config.GetRedisClient())
	statisticsHandler := handlers.NewStatisticsHandler(statisticsService)

	statisticsRoutes := v1.Group("/statistics")
	{
		statisticsRoutes.GET("/student-comparison/:studentId", statisticsHandler.GetStudentComparison)
		statisticsRoutes.GET("/grade-comparison/:studentId", statisticsHandler.GetGradeComparison)
		statisticsRoutes.GET("/county-comparison/:studentId", statisticsHandler.GetCountyComparison)
		statisticsRoutes.GET("/county-sport-averages/:countyName", statisticsHandler.GetCountySportAverages)
		statisticsRoutes.GET("/national-averages", statisticsHandler.GetNationalAverages)
		statisticsRoutes.GET("/school-champions", statisticsHandler.GetSchoolChampions)
		statisticsRoutes.GET("/top-schools", statisticsHandler.GetAllTopSchools)
		statisticsRoutes.GET("/top-schools/:sportTypeId", statisticsHandler.GetTopSchoolsBySport)
	}
	// ========== 統計路由結束 ==========

	// Sport record routes
	sportRecordService := services.NewSportRecordService(db)
	sportRecordService.SetStatisticsService(statisticsService)
	sportRecordHandler := handlers.NewSportRecordHandler(sportRecordService)

	sportRecordRoutes := v1.Group("/sport-records")
	{
		sportRecordRoutes.GET("", sportRecordHandler.List)
		sportRecordRoutes.GET("/trend", sportRecordHandler.GetTrend)
		sportRecordRoutes.GET("/progress", sportRecordHandler.GetProgress)
		sportRecordRoutes.GET("/ranking", sportRecordHandler.GetSchoolRanking)
		sportRecordRoutes.GET("/bulk-scores", sportRecordHandler.GetBulkScores)
		sportRecordRoutes.GET("/:id", sportRecordHandler.Get)
		sportRecordRoutes.GET("/:id/history", sportRecordHandler.GetHistory)
		sportRecordRoutes.POST("", middleware.RequireAuth(authSvc), sportRecordHandler.Create)
		sportRecordRoutes.PUT("/:id", middleware.RequireAuth(authSvc), sportRecordHandler.Update)
		sportRecordRoutes.DELETE("/:id", middleware.RequireAuth(authSvc), sportRecordHandler.Delete)
	}

	// ★★★ 已移除 Analysis 相關程式碼 ★★★

	// Import routes (Excel batch import) — auth required
	importService := services.NewImportService(db)
	importService.SetStatisticsService(statisticsService)
	templateService := services.NewTemplateService(db)
	importHandler := handlers.NewImportHandler(importService, templateService)

	importRoutes := v1.Group("/import")
	importRoutes.Use(middleware.RequireAuth(authSvc))
	{
		// Template downloads
		importRoutes.GET("/templates/students", importHandler.DownloadStudentTemplate)
		importRoutes.GET("/templates/records", importHandler.DownloadRecordsTemplate)

		// Student import
		importRoutes.POST("/students/preview", importHandler.PreviewStudentImport)
		importRoutes.POST("/students/execute", importHandler.ExecuteStudentImport)

		// Records import
		importRoutes.POST("/records/preview", importHandler.PreviewRecordsImport)
		importRoutes.POST("/records/execute", importHandler.ExecuteRecordsImport)

		// Cancel preview
		importRoutes.DELETE("/preview/:preview_id", importHandler.CancelPreview)
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
		origin := c.Request.Header.Get("Origin")

		// Allow localhost with various ports (3000-3009) for development
		allowedOrigins := []string{
			"http://localhost:3000",
			"http://localhost:3001",
			"http://localhost:3002",
			"http://localhost:3003",
			"http://localhost:3004",
			"http://localhost:3005",
		}

		// Check if origin is in allowed list
		allowOrigin := ""
		for _, allowed := range allowedOrigins {
			if origin == allowed {
				allowOrigin = origin
				break
			}
		}

		// Fallback to FRONTEND_URL environment variable
		if allowOrigin == "" {
			frontendURL := os.Getenv("FRONTEND_URL")
			if frontendURL != "" && origin == frontendURL {
				allowOrigin = frontendURL
			}
		}

		// If origin is allowed, set CORS headers
		if allowOrigin != "" {
			c.Writer.Header().Set("Access-Control-Allow-Origin", allowOrigin)
			c.Writer.Header().Set("Access-Control-Allow-Credentials", "true")
			c.Writer.Header().Set("Access-Control-Allow-Headers", "Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization, accept, origin, Cache-Control, X-Requested-With")
			c.Writer.Header().Set("Access-Control-Allow-Methods", "POST, OPTIONS, GET, PUT, DELETE, PATCH")
		}

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
