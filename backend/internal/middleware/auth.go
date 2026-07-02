package middleware

import (
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/wei979/ICACP/backend/internal/models"
	"github.com/wei979/ICACP/backend/internal/services"
)

const (
	ContextKeyUserID = "user_id"
	ContextKeyEmail  = "email"
	ContextKeyRole   = "role"
)

// extractToken 從 Authorization header 取出 Bearer token
func extractToken(c *gin.Context) string {
	header := c.GetHeader("Authorization")
	if !strings.HasPrefix(header, "Bearer ") {
		return ""
	}
	return strings.TrimPrefix(header, "Bearer ")
}

// RequireAuth 驗證 JWT，未登入回傳 401
func RequireAuth(authSvc *services.AuthService) gin.HandlerFunc {
	return func(c *gin.Context) {
		token := extractToken(c)
		if token == "" {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{
				"error": gin.H{"code": "UNAUTHORIZED", "message": "請先登入"},
			})
			return
		}

		claims, err := authSvc.ValidateToken(token)
		if err != nil {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{
				"error": gin.H{"code": "INVALID_TOKEN", "message": "Token 無效或已過期"},
			})
			return
		}

		c.Set(ContextKeyUserID, claims.UserID)
		c.Set(ContextKeyEmail, claims.Email)
		c.Set(ContextKeyRole, string(claims.Role))
		c.Next()
	}
}

// RequireAdmin 驗證 JWT 且必須是 admin 角色，否則回傳 403
func RequireAdmin(authSvc *services.AuthService) gin.HandlerFunc {
	return func(c *gin.Context) {
		token := extractToken(c)
		if token == "" {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{
				"error": gin.H{"code": "UNAUTHORIZED", "message": "請先登入"},
			})
			return
		}

		claims, err := authSvc.ValidateToken(token)
		if err != nil {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{
				"error": gin.H{"code": "INVALID_TOKEN", "message": "Token 無效或已過期"},
			})
			return
		}

		if claims.Role != models.RoleAdmin {
			c.AbortWithStatusJSON(http.StatusForbidden, gin.H{
				"error": gin.H{"code": "FORBIDDEN", "message": "需要管理員權限"},
			})
			return
		}

		c.Set(ContextKeyUserID, claims.UserID)
		c.Set(ContextKeyEmail, claims.Email)
		c.Set(ContextKeyRole, string(claims.Role))
		c.Next()
	}
}

// GetCurrentUserID 從 context 取得當前使用者 ID
func GetCurrentUserID(c *gin.Context) (uint, bool) {
	v, exists := c.Get(ContextKeyUserID)
	if !exists {
		return 0, false
	}
	id, ok := v.(uint)
	return id, ok
}

// GetCurrentRole 從 context 取得當前使用者角色
func GetCurrentRole(c *gin.Context) string {
	role, _ := c.Get(ContextKeyRole)
	s, _ := role.(string)
	return s
}
