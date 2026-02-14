package handlers

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/wei979/ICACP/backend/internal/models"
	"github.com/wei979/ICACP/backend/internal/services"
)

// SchoolHandler handles HTTP requests for school endpoints
type SchoolHandler struct {
	service *services.SchoolService
}

// NewSchoolHandler creates a new SchoolHandler instance
func NewSchoolHandler(service *services.SchoolService) *SchoolHandler {
	return &SchoolHandler{
		service: service,
	}
}

// GetForMap handles GET /api/v1/schools/map
// Returns all schools with coordinates for map display
func (h *SchoolHandler) GetForMap(c *gin.Context) {
	schools, total, err := h.service.ListForMap()
	if err != nil {
		h.sendErrorResponse(c, http.StatusInternalServerError, "INTERNAL_ERROR", "無法取得地圖學校資料")
		return
	}

	c.JSON(http.StatusOK, models.SchoolMapResponse{
		Data: struct {
			Schools []models.SchoolMapData `json:"schools"`
			Total   int                    `json:"total"`
		}{
			Schools: schools,
			Total:   total,
		},
	})
}

// List handles GET /api/v1/schools
// Returns paginated list of schools
func (h *SchoolHandler) List(c *gin.Context) {
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(c.DefaultQuery("page_size", "20"))
	countyName := c.Query("county_name")

	var schools []models.School
	var pagination *models.Pagination
	var err error

	if countyName != "" {
		schools, pagination, err = h.service.ListByCounty(countyName, page, pageSize)
	} else {
		schools, pagination, err = h.service.List(page, pageSize)
	}

	if err != nil {
		h.sendErrorResponse(c, http.StatusInternalServerError, "INTERNAL_ERROR", "無法取得學校列表")
		return
	}

	c.JSON(http.StatusOK, models.SchoolListResponse{
		Data: struct {
			Schools    []models.School   `json:"schools"`
			Pagination models.Pagination `json:"pagination"`
		}{
			Schools:    schools,
			Pagination: *pagination,
		},
	})
}

// Get handles GET /api/v1/schools/:id
// Returns a single school by ID
func (h *SchoolHandler) Get(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		h.sendErrorResponse(c, http.StatusBadRequest, "INVALID_ID", "無效的學校 ID")
		return
	}

	school, err := h.service.GetByIDWithStudents(uint(id))
	if err != nil {
		if err.Error() == "school not found" {
			h.sendErrorResponse(c, http.StatusNotFound, "NOT_FOUND", "學校不存在")
			return
		}
		h.sendErrorResponse(c, http.StatusInternalServerError, "INTERNAL_ERROR", "無法取得學校資料")
		return
	}

	c.JSON(http.StatusOK, models.SchoolResponse{
		Data: struct {
			School models.School `json:"school"`
		}{
			School: *school,
		},
	})
}

// Create handles POST /api/v1/schools
// Creates a new school
func (h *SchoolHandler) Create(c *gin.Context) {
	var req models.CreateSchoolRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		h.sendErrorResponse(c, http.StatusBadRequest, "INVALID_REQUEST", "請求資料格式錯誤")
		return
	}

	school, err := h.service.Create(&req)
	if err != nil {
		if err.Error() == "無效的縣市名稱" {
			h.sendErrorResponse(c, http.StatusBadRequest, "INVALID_COUNTY", err.Error())
			return
		}
		h.sendErrorResponse(c, http.StatusInternalServerError, "INTERNAL_ERROR", "無法建立學校")
		return
	}

	c.JSON(http.StatusCreated, models.SchoolResponse{
		Data: struct {
			School models.School `json:"school"`
		}{
			School: *school,
		},
	})
}

// Update handles PUT /api/v1/schools/:id
// Updates an existing school
func (h *SchoolHandler) Update(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		h.sendErrorResponse(c, http.StatusBadRequest, "INVALID_ID", "無效的學校 ID")
		return
	}

	var req models.UpdateSchoolRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		h.sendErrorResponse(c, http.StatusBadRequest, "INVALID_REQUEST", "請求資料格式錯誤")
		return
	}

	school, err := h.service.Update(uint(id), &req)
	if err != nil {
		if err.Error() == "school not found" {
			h.sendErrorResponse(c, http.StatusNotFound, "NOT_FOUND", "學校不存在")
			return
		}
		if err.Error() == "無效的縣市名稱" {
			h.sendErrorResponse(c, http.StatusBadRequest, "INVALID_COUNTY", err.Error())
			return
		}
		h.sendErrorResponse(c, http.StatusInternalServerError, "INTERNAL_ERROR", "無法更新學校")
		return
	}

	c.JSON(http.StatusOK, models.SchoolResponse{
		Data: struct {
			School models.School `json:"school"`
		}{
			School: *school,
		},
	})
}

// Delete handles DELETE /api/v1/schools/:id
// Soft deletes a school and its students
func (h *SchoolHandler) Delete(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		h.sendErrorResponse(c, http.StatusBadRequest, "INVALID_ID", "無效的學校 ID")
		return
	}

	if err := h.service.Delete(uint(id)); err != nil {
		if err.Error() == "school not found" {
			h.sendErrorResponse(c, http.StatusNotFound, "NOT_FOUND", "學校不存在")
			return
		}
		h.sendErrorResponse(c, http.StatusInternalServerError, "INTERNAL_ERROR", "無法刪除學校")
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"data": gin.H{
			"message": "學校已成功刪除",
		},
	})
}

// Helper function to send error responses
func (h *SchoolHandler) sendErrorResponse(c *gin.Context, statusCode int, errorCode string, message string) {
	c.JSON(statusCode, gin.H{
		"error": gin.H{
			"code":    errorCode,
			"message": message,
			"status":  statusCode,
		},
	})
}
