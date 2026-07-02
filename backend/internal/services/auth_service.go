package services

import (
	"errors"
	"fmt"
	"os"
	"strings"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"github.com/wei979/ICACP/backend/internal/models"
	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"
)

// TokenDuration Token 有效期
const TokenDuration = 24 * time.Hour

// Claims JWT 的 Payload
type Claims struct {
	UserID uint             `json:"user_id"`
	Email  string           `json:"email"`
	Name   string           `json:"name"`
	Role   models.UserRole  `json:"role"`
	jwt.RegisteredClaims
}

type AuthService struct {
	db        *gorm.DB
	jwtSecret []byte
	adminList map[string]bool
}

func NewAuthService(db *gorm.DB) *AuthService {
	secret := os.Getenv("JWT_SECRET")
	if secret == "" {
		panic("JWT_SECRET 環境變數未設定")
	}

	// 解析 ADMIN_WHITELIST
	adminList := make(map[string]bool)
	for _, email := range strings.Split(os.Getenv("ADMIN_WHITELIST"), ",") {
		email = strings.TrimSpace(strings.ToLower(email))
		if email != "" {
			adminList[email] = true
		}
	}

	return &AuthService{
		db:        db,
		jwtSecret: []byte(secret),
		adminList: adminList,
	}
}

// IsAdminEmail 判斷 email 是否在 admin 白名單
func (s *AuthService) IsAdminEmail(email string) bool {
	return s.adminList[strings.ToLower(email)]
}

// Login 使用 email + password 登入，首次登入自動建立帳號
func (s *AuthService) Login(email, password string) (string, *models.User, error) {
	email = strings.ToLower(strings.TrimSpace(email))
	if email == "" {
		return "", nil, errors.New("email 不能為空")
	}
	if password == "" {
		return "", nil, errors.New("密碼不能為空")
	}

	role := models.RoleUser
	if s.IsAdminEmail(email) {
		role = models.RoleAdmin
	}

	var user models.User
	result := s.db.Where("email = ?", email).First(&user)

	if errors.Is(result.Error, gorm.ErrRecordNotFound) {
		// 首次登入：自動建立帳號
		hash, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
		if err != nil {
			return "", nil, fmt.Errorf("密碼處理失敗: %w", err)
		}
		name := strings.Split(email, "@")[0]
		user = models.User{Email: email, Name: name, Role: role, PasswordHash: string(hash)}
		if err := s.db.Create(&user).Error; err != nil {
			return "", nil, fmt.Errorf("建立使用者失敗: %w", err)
		}
	} else if result.Error != nil {
		return "", nil, fmt.Errorf("查詢使用者失敗: %w", result.Error)
	} else {
		// 驗證密碼
		if err := bcrypt.CompareHashAndPassword([]byte(user.PasswordHash), []byte(password)); err != nil {
			return "", nil, errors.New("Email 或密碼錯誤")
		}
		// 同步 admin 白名單
		if user.Role != role {
			s.db.Model(&user).Update("role", role)
			user.Role = role
		}
	}

	token, err := s.generateToken(&user)
	if err != nil {
		return "", nil, err
	}
	return token, &user, nil
}

// generateToken 簽發 JWT
func (s *AuthService) generateToken(user *models.User) (string, error) {
	now := time.Now()
	claims := Claims{
		UserID: user.ID,
		Email:  user.Email,
		Name:   user.Name,
		Role:   user.Role,
		RegisteredClaims: jwt.RegisteredClaims{
			IssuedAt:  jwt.NewNumericDate(now),
			ExpiresAt: jwt.NewNumericDate(now.Add(TokenDuration)),
			Issuer:    "icacp",
		},
	}
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString(s.jwtSecret)
}

// ValidateToken 驗證 JWT 並回傳 Claims
func (s *AuthService) ValidateToken(tokenStr string) (*Claims, error) {
	token, err := jwt.ParseWithClaims(tokenStr, &Claims{}, func(t *jwt.Token) (interface{}, error) {
		if _, ok := t.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, fmt.Errorf("非預期的簽名方式: %v", t.Header["alg"])
		}
		return s.jwtSecret, nil
	})
	if err != nil {
		return nil, err
	}

	claims, ok := token.Claims.(*Claims)
	if !ok || !token.Valid {
		return nil, errors.New("token 無效")
	}
	return claims, nil
}
