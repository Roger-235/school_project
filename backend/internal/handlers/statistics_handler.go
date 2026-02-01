package handlers

import (
	"net/http"
	"strconv"
	"time"

	"github.com/wei979/ICACP/backend/internal/services"

	"github.com/gin-gonic/gin"
)

type StatisticsHandler struct {
	service *services.StatisticsService
}

func NewStatisticsHandler(service *services.StatisticsService) *StatisticsHandler {
	return &StatisticsHandler{
		service: service,
	}
}

// GetStudentComparison 取得學生比較分析
// GET /api/v1/statistics/student-comparison/:studentId
func (h *StatisticsHandler) GetStudentComparison(c *gin.Context) {
	studentIDStr := c.Param("studentId")
	studentID, err := strconv.ParseUint(studentIDStr, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": gin.H{
				"code":    "INVALID_STUDENT_ID",
				"message": "學生 ID 格式錯誤",
			},
		})
		return
	}

	result, err := h.service.GetStudentComparison(c.Request.Context(), uint(studentID))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": gin.H{
				"code":    "QUERY_ERROR",
				"message": err.Error(),
			},
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": result})
}

// CalculateNationalAverages 計算全國平均值
// POST /api/v1/statistics/national-averages/calculate
func (h *StatisticsHandler) CalculateNationalAverages(c *gin.Context) {
	if err := h.service.CalculateNationalAverages(c.Request.Context()); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": gin.H{
				"code":    "CALCULATION_ERROR",
				"message": err.Error(),
			},
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"data": gin.H{
			"message":    "全國平均值計算完成",
			"updated_at": time.Now(),
		},
	})
}

// GetNationalAverages 取得全國平均值列表
// GET /api/v1/statistics/national-averages
func (h *StatisticsHandler) GetNationalAverages(c *gin.Context) {
	sportTypeID, _ := strconv.ParseUint(c.Query("sport_type_id"), 10, 32)
	grade, _ := strconv.Atoi(c.Query("grade"))
	gender := c.Query("gender")

	averages, err := h.service.GetNationalAverages(
		c.Request.Context(),
		uint(sportTypeID),
		grade,
		gender,
	)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": gin.H{
				"code":    "QUERY_ERROR",
				"message": err.Error(),
			},
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"data": gin.H{
			"averages": averages,
		},
	})
}

// GetSchoolChampions 取得各運動項目的冠軍學校
// GET /api/v1/statistics/school-champions
func (h *StatisticsHandler) GetSchoolChampions(c *gin.Context) {
	champions, err := h.service.GetSchoolChampions(c.Request.Context())
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": gin.H{
				"code":    "QUERY_ERROR",
				"message": err.Error(),
			},
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"data": gin.H{
			"champions": champions,
		},
	})
}
