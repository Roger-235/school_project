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

// GetGradeComparison 取得學生同年級比較
// GET /api/v1/statistics/grade-comparison/:studentId
func (h *StatisticsHandler) GetGradeComparison(c *gin.Context) {
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

	result, err := h.service.GetGradeComparison(c.Request.Context(), uint(studentID))
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

// GetCountyComparison 取得學生縣市內比較
// GET /api/v1/statistics/county-comparison/:studentId
func (h *StatisticsHandler) GetCountyComparison(c *gin.Context) {
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

	result, err := h.service.GetCountyComparison(c.Request.Context(), uint(studentID))
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

// GetCountySportAverages 取得縣市各運動項目平均成績
// GET /api/v1/statistics/county-sport-averages/:countyName
func (h *StatisticsHandler) GetCountySportAverages(c *gin.Context) {
	countyName := c.Param("countyName")
	if countyName == "" {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": gin.H{
				"code":    "INVALID_COUNTY",
				"message": "縣市名稱不能為空",
			},
		})
		return
	}

	averages, err := h.service.GetCountySportAverages(c.Request.Context(), countyName)
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
			"county_name": countyName,
			"averages":    averages,
		},
	})
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

// GetTopSchoolsBySport 取得指定運動項目的前N名學校（支援縣市篩選）
// GET /api/v1/statistics/top-schools/:sportTypeId?limit=10&county=高雄市
func (h *StatisticsHandler) GetTopSchoolsBySport(c *gin.Context) {
	sportTypeIDStr := c.Param("sportTypeId")
	sportTypeID, err := strconv.ParseUint(sportTypeIDStr, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": gin.H{
				"code":    "INVALID_SPORT_TYPE_ID",
				"message": "運動類型 ID 格式錯誤",
			},
		})
		return
	}

	limit := 100 // 增加默認 limit 以支援縣市篩選
	if limitStr := c.Query("limit"); limitStr != "" {
		if parsedLimit, err := strconv.Atoi(limitStr); err == nil && parsedLimit > 0 {
			limit = parsedLimit
		}
	}

	// 取得可選的縣市參數
	county := c.Query("county")

	// 傳遞 county 參數給 service，由 service 在數據庫級別過濾
	rankings, err := h.service.GetTopSchoolsBySport(c.Request.Context(), uint(sportTypeID), limit, county)
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
			"rankings": rankings,
			"count":    len(rankings),
		},
	})
}

// GetAllTopSchools 取得所有運動項目的前N名學校
// GET /api/v1/statistics/top-schools?limit=10
func (h *StatisticsHandler) GetAllTopSchools(c *gin.Context) {
	limit := 10 // 默認前10名
	if limitStr := c.Query("limit"); limitStr != "" {
		if parsedLimit, err := strconv.Atoi(limitStr); err == nil && parsedLimit > 0 {
			limit = parsedLimit
		}
	}

	rankings, err := h.service.GetAllTopSchools(c.Request.Context(), limit)
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
			"rankings": rankings,
		},
	})
}
