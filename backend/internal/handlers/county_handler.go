package handlers

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/wei979/ICACP/backend/internal/models"
	"github.com/wei979/ICACP/backend/internal/services"
)

// CountyHandler handles HTTP requests for county statistics endpoints
type CountyHandler struct {
	service *services.CountyService
}

// NewCountyHandler creates a new CountyHandler instance
func NewCountyHandler(service *services.CountyService) *CountyHandler {
	return &CountyHandler{
		service: service,
	}
}

// GetAllCountyStatistics handles GET /api/v1/counties/statistics
// Returns aggregated statistics for all 22 Taiwan counties/cities
func (h *CountyHandler) GetAllCountyStatistics(c *gin.Context) {
	stats, err := h.service.GetAllCountyStatistics()
	if err != nil {
		h.sendErrorResponse(
			c,
			http.StatusInternalServerError,
			"INTERNAL_ERROR",
			"Unable to retrieve county statistics",
		)
		return
	}

	c.JSON(http.StatusOK, models.AllCountyStatisticsResponse{
		Data: *stats,
	})
}

// GetCountyStatistics handles GET /api/v1/counties/:name/statistics
// Returns statistics for a specific county/city by name
func (h *CountyHandler) GetCountyStatistics(c *gin.Context) {
	// T034: Get county name from URL parameter
	countyName := c.Param("countyName")
	if countyName == "" {
		h.sendErrorResponse(
			c,
			http.StatusBadRequest,
			"INVALID_REQUEST",
			"County name is required",
		)
		return
	}

	// T036: Validate county name against whitelist (404 for invalid)
	if !h.validateCountyName(countyName) {
		h.sendErrorResponse(
			c,
			http.StatusNotFound,
			"COUNTY_NOT_FOUND",
			"Invalid county name: "+countyName,
		)
		return
	}

	// Get statistics from service
	stats, err := h.service.GetCountyStatistics(countyName)
	if err != nil {
		// T036: Handle server errors (500)
		h.sendErrorResponse(
			c,
			http.StatusInternalServerError,
			"INTERNAL_ERROR",
			"Unable to retrieve county statistics",
		)
		return
	}

	// Return successful response
	c.JSON(http.StatusOK, models.CountyStatisticsResponse{
		Data: *stats,
	})
}

// Helper function to send error responses
func (h *CountyHandler) sendErrorResponse(c *gin.Context, statusCode int, errorCode string, message string) {
	c.JSON(statusCode, gin.H{
		"error": gin.H{
			"code":    errorCode,
			"message": message,
			"status":  statusCode,
		},
	})
}

// Helper function to validate county name
func (h *CountyHandler) validateCountyName(name string) bool {
	return models.IsValidCountyName(name)
}
