package handlers

import (
	"bytes"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/wei979/ICACP/backend/internal/models"
	"github.com/wei979/ICACP/backend/internal/services"
)

// ImportHandler handles import-related HTTP requests
type ImportHandler struct {
	service         *services.ImportService
	templateService *services.TemplateService
}

// NewImportHandler creates a new ImportHandler
func NewImportHandler(service *services.ImportService, templateService *services.TemplateService) *ImportHandler {
	return &ImportHandler{
		service:         service,
		templateService: templateService,
	}
}

// DownloadStudentTemplate handles GET /api/v1/import/templates/students
func (h *ImportHandler) DownloadStudentTemplate(c *gin.Context) {
	// Generate template
	buffer, err := h.templateService.GenerateStudentTemplate()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": gin.H{
				"code":    "TEMPLATE_ERROR",
				"message": "無法產生模板: " + err.Error(),
				"status":  500,
			},
		})
		return
	}

	// Set headers for file download
	c.Header("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")
	c.Header("Content-Disposition", "attachment; filename=student-list-template.xlsx")
	c.Data(http.StatusOK, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", buffer.Bytes())
}

// DownloadRecordsTemplate handles GET /api/v1/import/templates/records
// Supports optional query parameters: school_id, grade, class
// If provided, generates template with actual students from that school/grade/class
func (h *ImportHandler) DownloadRecordsTemplate(c *gin.Context) {
	var buffer *bytes.Buffer
	var err error
	var filename string

	// Check for optional query parameters
	schoolIDStr := c.Query("school_id")
	gradeStr := c.Query("grade")
	class := c.Query("class")

	if schoolIDStr != "" && gradeStr != "" {
		// Generate template with actual students
		schoolID, parseErr := strconv.ParseUint(schoolIDStr, 10, 64)
		if parseErr != nil {
			c.JSON(http.StatusBadRequest, gin.H{
				"error": gin.H{
					"code":    "INVALID_SCHOOL_ID",
					"message": "無效的學校 ID",
					"status":  400,
				},
			})
			return
		}

		grade, parseErr := strconv.Atoi(gradeStr)
		if parseErr != nil {
			c.JSON(http.StatusBadRequest, gin.H{
				"error": gin.H{
					"code":    "INVALID_GRADE",
					"message": "無效的年級",
					"status":  400,
				},
			})
			return
		}

		buffer, err = h.templateService.GenerateRecordsTemplateWithStudents(uint(schoolID), grade, class)
		filename = "sport-records-template.xlsx"
	} else {
		// Generate generic template
		buffer, err = h.templateService.GenerateRecordsTemplate()
		filename = "sport-records-template.xlsx"
	}

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": gin.H{
				"code":    "TEMPLATE_ERROR",
				"message": "無法產生模板: " + err.Error(),
				"status":  500,
			},
		})
		return
	}

	// Set headers for file download
	c.Header("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")
	c.Header("Content-Disposition", "attachment; filename="+filename)
	c.Data(http.StatusOK, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", buffer.Bytes())
}

// PreviewStudentImport handles POST /api/v1/import/students/preview
func (h *ImportHandler) PreviewStudentImport(c *gin.Context) {
	// Get uploaded file
	file, header, err := c.Request.FormFile("file")
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": gin.H{
				"code":    "MISSING_FILE",
				"message": "請上傳 Excel 檔案",
				"status":  400,
			},
		})
		return
	}
	defer file.Close()

	// Validate file format
	if err := h.service.ValidateFileFormat(header.Filename); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": gin.H{
				"code":    "INVALID_FILE_FORMAT",
				"message": err.Error(),
				"status":  400,
			},
		})
		return
	}

	// Validate file size
	if err := h.service.ValidateFileSize(header.Size); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": gin.H{
				"code":    "FILE_TOO_LARGE",
				"message": err.Error(),
				"status":  400,
			},
		})
		return
	}

	// Get school ID
	schoolIDStr := c.PostForm("school_id")
	schoolID, err := strconv.ParseUint(schoolIDStr, 10, 64)
	if err != nil || schoolID == 0 {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": gin.H{
				"code":    "INVALID_SCHOOL_ID",
				"message": "請提供有效的學校 ID",
				"status":  400,
			},
		})
		return
	}

	// Preview import
	preview, err := h.service.PreviewStudentImport(file, header.Filename, uint(schoolID))
	if err != nil {
		// Check if it's a "not found" error
		if contains(err.Error(), "找不到") {
			c.JSON(http.StatusNotFound, gin.H{
				"error": gin.H{
					"code":    "SCHOOL_NOT_FOUND",
					"message": err.Error(),
					"status":  404,
				},
			})
			return
		}

		c.JSON(http.StatusBadRequest, gin.H{
			"error": gin.H{
				"code":    "PARSE_ERROR",
				"message": err.Error(),
				"status":  400,
			},
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": preview})
}

// ExecuteStudentImport handles POST /api/v1/import/students/execute
func (h *ImportHandler) ExecuteStudentImport(c *gin.Context) {
	var req models.ExecuteImportRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": gin.H{
				"code":    "INVALID_REQUEST",
				"message": "請提供有效的請求資料",
				"status":  400,
			},
		})
		return
	}

	result, err := h.service.ExecuteStudentImport(req.PreviewID, req.IncludeWarnings)
	if err != nil {
		// Check error type
		if contains(err.Error(), "不存在或已過期") {
			c.JSON(http.StatusNotFound, gin.H{
				"error": gin.H{
					"code":    "PREVIEW_NOT_FOUND",
					"message": err.Error(),
					"status":  404,
				},
			})
			return
		}

		if contains(err.Error(), "已被執行") {
			c.JSON(http.StatusConflict, gin.H{
				"error": gin.H{
					"code":    "PREVIEW_ALREADY_EXECUTED",
					"message": err.Error(),
					"status":  409,
				},
			})
			return
		}

		c.JSON(http.StatusInternalServerError, gin.H{
			"error": gin.H{
				"code":    "IMPORT_ERROR",
				"message": err.Error(),
				"status":  500,
			},
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": result})
}

// PreviewRecordsImport handles POST /api/v1/import/records/preview
func (h *ImportHandler) PreviewRecordsImport(c *gin.Context) {
	// Get uploaded file
	file, header, err := c.Request.FormFile("file")
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": gin.H{
				"code":    "MISSING_FILE",
				"message": "請上傳 Excel 檔案",
				"status":  400,
			},
		})
		return
	}
	defer file.Close()

	// Validate file format
	if err := h.service.ValidateFileFormat(header.Filename); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": gin.H{
				"code":    "INVALID_FILE_FORMAT",
				"message": err.Error(),
				"status":  400,
			},
		})
		return
	}

	// Validate file size
	if err := h.service.ValidateFileSize(header.Size); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": gin.H{
				"code":    "FILE_TOO_LARGE",
				"message": err.Error(),
				"status":  400,
			},
		})
		return
	}

	// Get school ID
	schoolIDStr := c.PostForm("school_id")
	schoolID, err := strconv.ParseUint(schoolIDStr, 10, 64)
	if err != nil || schoolID == 0 {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": gin.H{
				"code":    "INVALID_SCHOOL_ID",
				"message": "請提供有效的學校 ID",
				"status":  400,
			},
		})
		return
	}

	// Get grade
	gradeStr := c.PostForm("grade")
	grade, err := strconv.Atoi(gradeStr)
	if err != nil || grade < 1 || grade > 12 {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": gin.H{
				"code":    "INVALID_GRADE",
				"message": "請提供有效的年級 (1-12)",
				"status":  400,
			},
		})
		return
	}

	// Get class
	class := c.PostForm("class")

	// Preview import
	preview, err := h.service.PreviewRecordsImport(file, header.Filename, uint(schoolID), grade, class)
	if err != nil {
		if contains(err.Error(), "找不到") {
			c.JSON(http.StatusNotFound, gin.H{
				"error": gin.H{
					"code":    "SCHOOL_NOT_FOUND",
					"message": err.Error(),
					"status":  404,
				},
			})
			return
		}

		c.JSON(http.StatusBadRequest, gin.H{
			"error": gin.H{
				"code":    "PARSE_ERROR",
				"message": err.Error(),
				"status":  400,
			},
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": preview})
}

// ExecuteRecordsImport handles POST /api/v1/import/records/execute
func (h *ImportHandler) ExecuteRecordsImport(c *gin.Context) {
	var req models.ExecuteImportRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": gin.H{
				"code":    "INVALID_REQUEST",
				"message": "請提供有效的請求資料",
				"status":  400,
			},
		})
		return
	}

	result, err := h.service.ExecuteRecordsImport(req.PreviewID, req.IncludeWarnings)
	if err != nil {
		if contains(err.Error(), "不存在或已過期") {
			c.JSON(http.StatusNotFound, gin.H{
				"error": gin.H{
					"code":    "PREVIEW_NOT_FOUND",
					"message": err.Error(),
					"status":  404,
				},
			})
			return
		}

		if contains(err.Error(), "已被執行") {
			c.JSON(http.StatusConflict, gin.H{
				"error": gin.H{
					"code":    "PREVIEW_ALREADY_EXECUTED",
					"message": err.Error(),
					"status":  409,
				},
			})
			return
		}

		c.JSON(http.StatusInternalServerError, gin.H{
			"error": gin.H{
				"code":    "IMPORT_ERROR",
				"message": err.Error(),
				"status":  500,
			},
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": result})
}

// CancelPreview handles DELETE /api/v1/import/preview/:preview_id
func (h *ImportHandler) CancelPreview(c *gin.Context) {
	previewID := c.Param("preview_id")
	if previewID == "" {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": gin.H{
				"code":    "INVALID_PREVIEW_ID",
				"message": "請提供預覽 ID",
				"status":  400,
			},
		})
		return
	}

	if !h.service.CancelPreview(previewID) {
		c.JSON(http.StatusNotFound, gin.H{
			"error": gin.H{
				"code":    "PREVIEW_NOT_FOUND",
				"message": "預覽資料不存在或已過期",
				"status":  404,
			},
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"data": gin.H{
			"message": "預覽已取消",
		},
	})
}

// contains checks if s contains substr
func contains(s, substr string) bool {
	return len(s) >= len(substr) && (s == substr || len(s) > 0 && containsRune(s, substr))
}

func containsRune(s, substr string) bool {
	for i := 0; i <= len(s)-len(substr); i++ {
		if s[i:i+len(substr)] == substr {
			return true
		}
	}
	return false
}
