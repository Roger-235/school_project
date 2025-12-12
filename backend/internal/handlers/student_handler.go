package handlers

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/wei979/ICACP/backend/internal/models"
	"github.com/wei979/ICACP/backend/internal/services"
)

// StudentHandler handles HTTP requests for student endpoints
type StudentHandler struct {
	service *services.StudentService
}

// NewStudentHandler creates a new StudentHandler instance
func NewStudentHandler(service *services.StudentService) *StudentHandler {
	return &StudentHandler{
		service: service,
	}
}

// List handles GET /api/v1/students
// Returns paginated list of students with optional filters
func (h *StudentHandler) List(c *gin.Context) {
	params := &models.StudentSearchParams{}

	params.Page, _ = strconv.Atoi(c.DefaultQuery("page", "1"))
	params.PageSize, _ = strconv.Atoi(c.DefaultQuery("page_size", "20"))
	params.Name = c.Query("name")

	if schoolID := c.Query("school_id"); schoolID != "" {
		id, _ := strconv.ParseUint(schoolID, 10, 32)
		params.SchoolID = uint(id)
	}

	if grade := c.Query("grade"); grade != "" {
		params.Grade, _ = strconv.Atoi(grade)
	}

	params.Gender = c.Query("gender")

	students, pagination, err := h.service.List(params)
	if err != nil {
		h.sendErrorResponse(c, http.StatusInternalServerError, "INTERNAL_ERROR", "無法取得學生列表")
		return
	}

	response := models.StudentListResponse{}
	response.Data.Students = students
	response.Data.Pagination = *pagination

	if len(students) == 0 {
		response.Data.Message = "無符合條件的學生"
	}

	c.JSON(http.StatusOK, response)
}

// Get handles GET /api/v1/students/:id
// Returns a single student by ID
func (h *StudentHandler) Get(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		h.sendErrorResponse(c, http.StatusBadRequest, "INVALID_ID", "無效的學生 ID")
		return
	}

	student, err := h.service.GetByID(uint(id))
	if err != nil {
		if err.Error() == "student not found" {
			h.sendErrorResponse(c, http.StatusNotFound, "NOT_FOUND", "學生不存在")
			return
		}
		h.sendErrorResponse(c, http.StatusInternalServerError, "INTERNAL_ERROR", "無法取得學生資料")
		return
	}

	c.JSON(http.StatusOK, models.StudentResponse{
		Data: struct {
			Student models.Student `json:"student"`
		}{
			Student: *student,
		},
	})
}

// GetWithRecords handles GET /api/v1/students/:id/records
// Returns a student with all sport records
func (h *StudentHandler) GetWithRecords(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		h.sendErrorResponse(c, http.StatusBadRequest, "INVALID_ID", "無效的學生 ID")
		return
	}

	student, err := h.service.GetByIDWithRecords(uint(id))
	if err != nil {
		if err.Error() == "student not found" {
			h.sendErrorResponse(c, http.StatusNotFound, "NOT_FOUND", "學生不存在")
			return
		}
		h.sendErrorResponse(c, http.StatusInternalServerError, "INTERNAL_ERROR", "無法取得學生資料")
		return
	}

	c.JSON(http.StatusOK, models.StudentResponse{
		Data: struct {
			Student models.Student `json:"student"`
		}{
			Student: *student,
		},
	})
}

// Create handles POST /api/v1/students
// Creates a new student
func (h *StudentHandler) Create(c *gin.Context) {
	var req models.CreateStudentRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		h.sendErrorResponse(c, http.StatusBadRequest, "INVALID_REQUEST", "請求資料格式錯誤")
		return
	}

	student, err := h.service.Create(&req)
	if err != nil {
		switch err.Error() {
		case "學校不存在":
			h.sendErrorResponse(c, http.StatusBadRequest, "SCHOOL_NOT_FOUND", err.Error())
		case "此學號已存在於該學校":
			h.sendErrorResponse(c, http.StatusConflict, "DUPLICATE_STUDENT_NUMBER", err.Error())
		case "日期格式錯誤，請使用 YYYY-MM-DD 格式":
			h.sendErrorResponse(c, http.StatusBadRequest, "INVALID_DATE", err.Error())
		case "出生日期不能是未來日期":
			h.sendErrorResponse(c, http.StatusBadRequest, "FUTURE_DATE", err.Error())
		default:
			h.sendErrorResponse(c, http.StatusInternalServerError, "INTERNAL_ERROR", "無法建立學生")
		}
		return
	}

	c.JSON(http.StatusCreated, models.StudentResponse{
		Data: struct {
			Student models.Student `json:"student"`
		}{
			Student: *student,
		},
	})
}

// Update handles PUT /api/v1/students/:id
// Updates an existing student
func (h *StudentHandler) Update(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		h.sendErrorResponse(c, http.StatusBadRequest, "INVALID_ID", "無效的學生 ID")
		return
	}

	var req models.UpdateStudentRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		h.sendErrorResponse(c, http.StatusBadRequest, "INVALID_REQUEST", "請求資料格式錯誤")
		return
	}

	student, err := h.service.Update(uint(id), &req)
	if err != nil {
		switch err.Error() {
		case "student not found":
			h.sendErrorResponse(c, http.StatusNotFound, "NOT_FOUND", "學生不存在")
		case "此學號已存在於該學校":
			h.sendErrorResponse(c, http.StatusConflict, "DUPLICATE_STUDENT_NUMBER", err.Error())
		case "日期格式錯誤，請使用 YYYY-MM-DD 格式":
			h.sendErrorResponse(c, http.StatusBadRequest, "INVALID_DATE", err.Error())
		case "出生日期不能是未來日期":
			h.sendErrorResponse(c, http.StatusBadRequest, "FUTURE_DATE", err.Error())
		default:
			h.sendErrorResponse(c, http.StatusInternalServerError, "INTERNAL_ERROR", "無法更新學生")
		}
		return
	}

	c.JSON(http.StatusOK, models.StudentResponse{
		Data: struct {
			Student models.Student `json:"student"`
		}{
			Student: *student,
		},
	})
}

// Delete handles DELETE /api/v1/students/:id
// Soft deletes a student
func (h *StudentHandler) Delete(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		h.sendErrorResponse(c, http.StatusBadRequest, "INVALID_ID", "無效的學生 ID")
		return
	}

	if err := h.service.Delete(uint(id)); err != nil {
		if err.Error() == "student not found" {
			h.sendErrorResponse(c, http.StatusNotFound, "NOT_FOUND", "學生不存在")
			return
		}
		h.sendErrorResponse(c, http.StatusInternalServerError, "INTERNAL_ERROR", "無法刪除學生")
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"data": gin.H{
			"message": "學生已成功刪除",
		},
	})
}

// Helper function to send error responses
func (h *StudentHandler) sendErrorResponse(c *gin.Context, statusCode int, errorCode string, message string) {
	c.JSON(statusCode, gin.H{
		"error": gin.H{
			"code":    errorCode,
			"message": message,
			"status":  statusCode,
		},
	})
}
