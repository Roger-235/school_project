package handlers

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/wei979/ICACP/backend/internal/services"
)

// SportTypeHandler handles HTTP requests for sport type operations
type SportTypeHandler struct {
	service *services.SportTypeService
}

// NewSportTypeHandler creates a new SportTypeHandler instance
func NewSportTypeHandler(service *services.SportTypeService) *SportTypeHandler {
	return &SportTypeHandler{
		service: service,
	}
}

// List godoc
// @Summary List all sport types
// @Description Get all available sport types
// @Tags sport-types
// @Accept json
// @Produce json
// @Param category query string false "Filter by category (體適能, 田徑, 球類)"
// @Success 200 {object} map[string]interface{}
// @Failure 500 {object} map[string]interface{}
// @Router /api/v1/sport-types [get]
func (h *SportTypeHandler) List(c *gin.Context) {
	category := c.Query("category")

	var sportTypes interface{}
	var err error

	if category != "" {
		sportTypes, err = h.service.ListByCategory(category)
	} else {
		sportTypes, err = h.service.List()
	}

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": gin.H{
				"code":    "INTERNAL_ERROR",
				"message": "無法取得運動項目列表",
			},
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"data": gin.H{
			"sport_types": sportTypes,
		},
	})
}

// Get godoc
// @Summary Get a sport type by ID
// @Description Get a specific sport type by its ID
// @Tags sport-types
// @Accept json
// @Produce json
// @Param id path int true "Sport Type ID"
// @Success 200 {object} map[string]interface{}
// @Failure 404 {object} map[string]interface{}
// @Failure 500 {object} map[string]interface{}
// @Router /api/v1/sport-types/{id} [get]
func (h *SportTypeHandler) Get(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": gin.H{
				"code":    "INVALID_ID",
				"message": "無效的運動項目 ID",
			},
		})
		return
	}

	sportType, err := h.service.GetByID(uint(id))
	if err != nil {
		if err.Error() == "sport type not found" {
			c.JSON(http.StatusNotFound, gin.H{
				"error": gin.H{
					"code":    "NOT_FOUND",
					"message": "運動項目不存在",
				},
			})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": gin.H{
				"code":    "INTERNAL_ERROR",
				"message": "無法取得運動項目",
			},
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"data": gin.H{
			"sport_type": sportType,
		},
	})
}

// GetCategories godoc
// @Summary Get all sport categories
// @Description Get all available sport categories
// @Tags sport-types
// @Accept json
// @Produce json
// @Success 200 {object} map[string]interface{}
// @Router /api/v1/sport-types/categories [get]
func (h *SportTypeHandler) GetCategories(c *gin.Context) {
	categories := h.service.GetCategories()

	c.JSON(http.StatusOK, gin.H{
		"data": gin.H{
			"categories": categories,
		},
	})
}
