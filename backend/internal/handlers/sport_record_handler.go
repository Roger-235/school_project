package handlers

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/wei979/ICACP/backend/internal/models"
	"github.com/wei979/ICACP/backend/internal/services"
)

// SportRecordHandler handles HTTP requests for sport record operations
type SportRecordHandler struct {
	service *services.SportRecordService
}

// NewSportRecordHandler creates a new SportRecordHandler instance
func NewSportRecordHandler(service *services.SportRecordService) *SportRecordHandler {
	return &SportRecordHandler{
		service: service,
	}
}

// List godoc
// @Summary List sport records for a student
// @Description Get paginated list of sport records for a specific student
// @Tags sport-records
// @Accept json
// @Produce json
// @Param student_id query int true "Student ID"
// @Param sport_type_id query int false "Filter by Sport Type ID"
// @Param page query int false "Page number" default(1)
// @Param page_size query int false "Page size" default(20)
// @Success 200 {object} map[string]interface{}
// @Failure 400 {object} map[string]interface{}
// @Failure 500 {object} map[string]interface{}
// @Router /api/v1/sport-records [get]
func (h *SportRecordHandler) List(c *gin.Context) {
	studentIDStr := c.Query("student_id")
	if studentIDStr == "" {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": gin.H{
				"code":    "MISSING_PARAM",
				"message": "student_id 為必填參數",
			},
		})
		return
	}

	studentID, err := strconv.ParseUint(studentIDStr, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": gin.H{
				"code":    "INVALID_ID",
				"message": "無效的學生 ID",
			},
		})
		return
	}

	// Check if filtering by sport type
	sportTypeIDStr := c.Query("sport_type_id")
	if sportTypeIDStr != "" {
		sportTypeID, err := strconv.ParseUint(sportTypeIDStr, 10, 32)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{
				"error": gin.H{
					"code":    "INVALID_ID",
					"message": "無效的運動項目 ID",
				},
			})
			return
		}

		records, err := h.service.ListBySportType(uint(studentID), uint(sportTypeID))
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{
				"error": gin.H{
					"code":    "INTERNAL_ERROR",
					"message": "無法取得運動記錄列表",
				},
			})
			return
		}

		c.JSON(http.StatusOK, gin.H{
			"data": gin.H{
				"records": records,
			},
		})
		return
	}

	// Pagination
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(c.DefaultQuery("page_size", "20"))

	records, pagination, err := h.service.List(uint(studentID), page, pageSize)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": gin.H{
				"code":    "INTERNAL_ERROR",
				"message": "無法取得運動記錄列表",
			},
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"data": gin.H{
			"records":    records,
			"pagination": pagination,
		},
	})
}

// Get godoc
// @Summary Get a sport record by ID
// @Description Get a specific sport record by its ID
// @Tags sport-records
// @Accept json
// @Produce json
// @Param id path int true "Sport Record ID"
// @Success 200 {object} map[string]interface{}
// @Failure 404 {object} map[string]interface{}
// @Failure 500 {object} map[string]interface{}
// @Router /api/v1/sport-records/{id} [get]
func (h *SportRecordHandler) Get(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": gin.H{
				"code":    "INVALID_ID",
				"message": "無效的運動記錄 ID",
			},
		})
		return
	}

	record, err := h.service.GetByID(uint(id))
	if err != nil {
		if err.Error() == "sport record not found" {
			c.JSON(http.StatusNotFound, gin.H{
				"error": gin.H{
					"code":    "NOT_FOUND",
					"message": "運動記錄不存在",
				},
			})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": gin.H{
				"code":    "INTERNAL_ERROR",
				"message": "無法取得運動記錄",
			},
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"data": gin.H{
			"record": record,
		},
	})
}

// Create godoc
// @Summary Create a new sport record
// @Description Create a new sport record for a student
// @Tags sport-records
// @Accept json
// @Produce json
// @Param record body models.CreateSportRecordRequest true "Sport Record data"
// @Success 201 {object} map[string]interface{}
// @Failure 400 {object} map[string]interface{}
// @Failure 500 {object} map[string]interface{}
// @Router /api/v1/sport-records [post]
func (h *SportRecordHandler) Create(c *gin.Context) {
	var req models.CreateSportRecordRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": gin.H{
				"code":    "INVALID_REQUEST",
				"message": "請求格式錯誤",
			},
		})
		return
	}

	// Validate required fields
	if req.StudentID == 0 {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": gin.H{
				"code":    "VALIDATION_ERROR",
				"message": "學生 ID 為必填",
			},
		})
		return
	}
	if req.SportTypeID == 0 {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": gin.H{
				"code":    "VALIDATION_ERROR",
				"message": "運動項目為必填",
			},
		})
		return
	}
	if req.TestDate == "" {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": gin.H{
				"code":    "VALIDATION_ERROR",
				"message": "測驗日期為必填",
			},
		})
		return
	}

	record, err := h.service.Create(&req)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": gin.H{
				"code":    "VALIDATION_ERROR",
				"message": err.Error(),
			},
		})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"data": gin.H{
			"record":  record,
			"message": "運動記錄建立成功",
		},
	})
}

// Update godoc
// @Summary Update a sport record
// @Description Update an existing sport record (creates audit trail)
// @Tags sport-records
// @Accept json
// @Produce json
// @Param id path int true "Sport Record ID"
// @Param record body models.UpdateSportRecordRequest true "Sport Record data"
// @Success 200 {object} map[string]interface{}
// @Failure 400 {object} map[string]interface{}
// @Failure 404 {object} map[string]interface{}
// @Failure 500 {object} map[string]interface{}
// @Router /api/v1/sport-records/{id} [put]
func (h *SportRecordHandler) Update(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": gin.H{
				"code":    "INVALID_ID",
				"message": "無效的運動記錄 ID",
			},
		})
		return
	}

	var req models.UpdateSportRecordRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": gin.H{
				"code":    "INVALID_REQUEST",
				"message": "請求格式錯誤",
			},
		})
		return
	}

	// Validate required fields
	if req.TestDate == "" {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": gin.H{
				"code":    "VALIDATION_ERROR",
				"message": "測驗日期為必填",
			},
		})
		return
	}

	// TODO: Get actual user ID from auth context
	changedByUserID := uint(1) // Placeholder

	record, err := h.service.Update(uint(id), &req, changedByUserID)
	if err != nil {
		if err.Error() == "sport record not found" {
			c.JSON(http.StatusNotFound, gin.H{
				"error": gin.H{
					"code":    "NOT_FOUND",
					"message": "運動記錄不存在",
				},
			})
			return
		}
		c.JSON(http.StatusBadRequest, gin.H{
			"error": gin.H{
				"code":    "VALIDATION_ERROR",
				"message": err.Error(),
			},
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"data": gin.H{
			"record":  record,
			"message": "運動記錄更新成功",
		},
	})
}

// Delete godoc
// @Summary Delete a sport record
// @Description Soft delete a sport record
// @Tags sport-records
// @Accept json
// @Produce json
// @Param id path int true "Sport Record ID"
// @Success 200 {object} map[string]interface{}
// @Failure 404 {object} map[string]interface{}
// @Failure 500 {object} map[string]interface{}
// @Router /api/v1/sport-records/{id} [delete]
func (h *SportRecordHandler) Delete(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": gin.H{
				"code":    "INVALID_ID",
				"message": "無效的運動記錄 ID",
			},
		})
		return
	}

	err = h.service.Delete(uint(id))
	if err != nil {
		if err.Error() == "sport record not found" {
			c.JSON(http.StatusNotFound, gin.H{
				"error": gin.H{
					"code":    "NOT_FOUND",
					"message": "運動記錄不存在",
				},
			})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": gin.H{
				"code":    "INTERNAL_ERROR",
				"message": "無法刪除運動記錄",
			},
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"data": gin.H{
			"message": "運動記錄已成功刪除",
		},
	})
}

// GetHistory godoc
// @Summary Get audit history for a sport record
// @Description Get the change history for a specific sport record
// @Tags sport-records
// @Accept json
// @Produce json
// @Param id path int true "Sport Record ID"
// @Success 200 {object} map[string]interface{}
// @Failure 404 {object} map[string]interface{}
// @Failure 500 {object} map[string]interface{}
// @Router /api/v1/sport-records/{id}/history [get]
func (h *SportRecordHandler) GetHistory(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": gin.H{
				"code":    "INVALID_ID",
				"message": "無效的運動記錄 ID",
			},
		})
		return
	}

	// First verify record exists
	_, err = h.service.GetByID(uint(id))
	if err != nil {
		if err.Error() == "sport record not found" {
			c.JSON(http.StatusNotFound, gin.H{
				"error": gin.H{
					"code":    "NOT_FOUND",
					"message": "運動記錄不存在",
				},
			})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": gin.H{
				"code":    "INTERNAL_ERROR",
				"message": "無法取得運動記錄",
			},
		})
		return
	}

	audits, err := h.service.GetHistory(uint(id))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": gin.H{
				"code":    "INTERNAL_ERROR",
				"message": "無法取得變更記錄",
			},
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"data": gin.H{
			"audits":  audits,
			"message": "取得變更記錄成功",
		},
	})
}

// GetTrend godoc
// @Summary Get trend data for a student's sport type
// @Description Get sport records over time for trend analysis
// @Tags sport-records
// @Accept json
// @Produce json
// @Param student_id query int true "Student ID"
// @Param sport_type_id query int true "Sport Type ID"
// @Success 200 {object} map[string]interface{}
// @Failure 400 {object} map[string]interface{}
// @Failure 500 {object} map[string]interface{}
// @Router /api/v1/sport-records/trend [get]
func (h *SportRecordHandler) GetTrend(c *gin.Context) {
	studentIDStr := c.Query("student_id")
	sportTypeIDStr := c.Query("sport_type_id")

	if studentIDStr == "" || sportTypeIDStr == "" {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": gin.H{
				"code":    "MISSING_PARAM",
				"message": "student_id 和 sport_type_id 為必填參數",
			},
		})
		return
	}

	studentID, err := strconv.ParseUint(studentIDStr, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": gin.H{
				"code":    "INVALID_ID",
				"message": "無效的學生 ID",
			},
		})
		return
	}

	sportTypeID, err := strconv.ParseUint(sportTypeIDStr, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": gin.H{
				"code":    "INVALID_ID",
				"message": "無效的運動項目 ID",
			},
		})
		return
	}

	records, err := h.service.GetTrendData(uint(studentID), uint(sportTypeID))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": gin.H{
				"code":    "INTERNAL_ERROR",
				"message": "無法取得趨勢資料",
			},
		})
		return
	}

	// Determine if there's enough data for analysis
	hasEnoughData := len(records) >= 3

	c.JSON(http.StatusOK, gin.H{
		"data": gin.H{
			"records":         records,
			"has_enough_data": hasEnoughData,
			"record_count":    len(records),
		},
	})
}

// GetProgress godoc
// @Summary Get progress/regress analysis for a student's sport type
// @Description Calculate improvement or regression based on historical records (T074)
// @Tags sport-records
// @Accept json
// @Produce json
// @Param student_id query int true "Student ID"
// @Param sport_type_id query int true "Sport Type ID"
// @Success 200 {object} map[string]interface{}
// @Failure 400 {object} map[string]interface{}
// @Failure 500 {object} map[string]interface{}
// @Router /api/v1/sport-records/progress [get]
func (h *SportRecordHandler) GetProgress(c *gin.Context) {
	studentIDStr := c.Query("student_id")
	sportTypeIDStr := c.Query("sport_type_id")

	if studentIDStr == "" || sportTypeIDStr == "" {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": gin.H{
				"code":    "MISSING_PARAM",
				"message": "student_id 和 sport_type_id 為必填參數",
			},
		})
		return
	}

	studentID, err := strconv.ParseUint(studentIDStr, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": gin.H{
				"code":    "INVALID_ID",
				"message": "無效的學生 ID",
			},
		})
		return
	}

	sportTypeID, err := strconv.ParseUint(sportTypeIDStr, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": gin.H{
				"code":    "INVALID_ID",
				"message": "無效的運動項目 ID",
			},
		})
		return
	}

	analysis, err := h.service.CalculateProgress(uint(studentID), uint(sportTypeID))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": gin.H{
				"code":    "ANALYSIS_ERROR",
				"message": err.Error(),
			},
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"data": analysis,
	})
}

// GetSchoolRanking godoc
// @Summary Get school ranking for a specific sport type
// @Description Get top students in a school for a specific sport type (T075)
// @Tags sport-records
// @Accept json
// @Produce json
// @Param school_id query int true "School ID"
// @Param sport_type_id query int true "Sport Type ID"
// @Param limit query int false "Number of results to return" default(10)
// @Success 200 {object} map[string]interface{}
// @Failure 400 {object} map[string]interface{}
// @Failure 500 {object} map[string]interface{}
// @Router /api/v1/sport-records/ranking [get]
func (h *SportRecordHandler) GetSchoolRanking(c *gin.Context) {
	schoolIDStr := c.Query("school_id")
	sportTypeIDStr := c.Query("sport_type_id")

	if schoolIDStr == "" || sportTypeIDStr == "" {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": gin.H{
				"code":    "MISSING_PARAM",
				"message": "school_id 和 sport_type_id 為必填參數",
			},
		})
		return
	}

	schoolID, err := strconv.ParseUint(schoolIDStr, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": gin.H{
				"code":    "INVALID_ID",
				"message": "無效的學校 ID",
			},
		})
		return
	}

	sportTypeID, err := strconv.ParseUint(sportTypeIDStr, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": gin.H{
				"code":    "INVALID_ID",
				"message": "無效的運動項目 ID",
			},
		})
		return
	}

	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "10"))

	ranking, err := h.service.GetSchoolRanking(uint(schoolID), uint(sportTypeID), limit)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": gin.H{
				"code":    "RANKING_ERROR",
				"message": err.Error(),
			},
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"data": ranking,
	})
}
