package middleware

import (
	"github.com/gin-gonic/gin"
)

// SecurityHeaders 加入常見資安標頭，防止 XSS、Clickjacking 等攻擊
func SecurityHeaders() gin.HandlerFunc {
	return func(c *gin.Context) {
		// 禁止 MIME 類型嗅探
		c.Header("X-Content-Type-Options", "nosniff")
		// 禁止 iframe 嵌入（防 Clickjacking）
		c.Header("X-Frame-Options", "DENY")
		// 啟用瀏覽器 XSS 過濾
		c.Header("X-XSS-Protection", "1; mode=block")
		// 只允許 HTTPS（正式環境）
		c.Header("Strict-Transport-Security", "max-age=31536000; includeSubDomains")
		// 限制 Referrer 資訊洩漏
		c.Header("Referrer-Policy", "strict-origin-when-cross-origin")
		// 移除 Server 標頭，避免洩漏技術棧
		c.Header("Server", "")
		c.Next()
	}
}
