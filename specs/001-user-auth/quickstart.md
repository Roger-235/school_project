# Quickstart: User Authentication System (MVP)

**Feature**: User Authentication System (MVP)
**Branch**: `001-user-auth`
**Date**: 2025-11-14

## Purpose

This guide provides step-by-step instructions for implementing the user authentication system from scratch. Developers should follow this guide sequentially to build the feature according to the specification.

## Prerequisites

### Backend
- Go 1.21+ installed
- MySQL 8.0+ (or access to AWS RDS MySQL)
- Environment variables configured (see Environment Setup)

### Frontend
- Node.js 18+ and npm installed
- Backend API running and accessible

### Tools
- Git for version control
- Docker (optional, for containerized development)
- Postman or curl (for API testing)

## Environment Setup

### Backend Environment Variables

Create a `.env` file in `backend/` directory:

```bash
# Database
DATABASE_URL="user:password@tcp(localhost:3306)/acap_dev?charset=utf8mb4&parseTime=True&loc=Local"

# JWT
JWT_SECRET="your-32-plus-character-secret-key-here-change-in-production"

# Admin Whitelist (comma-separated)
ADMIN_WHITELIST="admin@example.com,admin2@example.com"

# Server
PORT=8080

# CORS
FRONTEND_URL="http://localhost:3000"
```

**Generate JWT Secret**:
```bash
openssl rand -base64 32
```

### Frontend Environment Variables

Create a `.env.local` file in `frontend/` directory:

```bash
NEXT_PUBLIC_API_URL=http://localhost:8080/api/v1
```

## Implementation Steps

### Phase 1: Backend Setup (Go/Gin)

#### Step 1.1: Initialize Go Project

```bash
cd backend
go mod init github.com/yourusername/acap-backend
go get github.com/gin-gonic/gin@v1.9.1
go get gorm.io/gorm@v1.25.5
go get gorm.io/driver/mysql@v1.5.2
go get github.com/golang-jwt/jwt/v5@v5.2.0
go get golang.org/x/crypto@v0.17.0
go get github.com/gin-contrib/cors@v1.5.0
go get github.com/joho/godotenv@v1.5.1
```

#### Step 1.2: Create Project Structure

```bash
mkdir -p cmd/server
mkdir -p internal/{auth,models,database,config}
mkdir -p tests/{unit,integration}
```

#### Step 1.3: Implement Configuration Loader

**File**: `internal/config/config.go`

```go
package config

import (
    "os"
    "github.com/joho/godotenv"
)

type Config struct {
    DatabaseURL   string
    JWTSecret     string
    AdminWhitelist []string
    Port          string
    FrontendURL   string
}

func Load() (*Config, error) {
    godotenv.Load() // Load .env file if exists

    return &Config{
        DatabaseURL:   os.Getenv("DATABASE_URL"),
        JWTSecret:     os.Getenv("JWT_SECRET"),
        AdminWhitelist: strings.Split(os.Getenv("ADMIN_WHITELIST"), ","),
        Port:          getEnv("PORT", "8080"),
        FrontendURL:   os.Getenv("FRONTEND_URL"),
    }, nil
}

func getEnv(key, fallback string) string {
    if value := os.Getenv(key); value != "" {
        return value
    }
    return fallback
}
```

#### Step 1.4: Implement User Model

**File**: `internal/models/user.go`

```go
package models

import (
    "time"
    "strings"
    "gorm.io/gorm"
)

type User struct {
    ID           uint       `gorm:"primaryKey;autoIncrement" json:"id"`
    Email        string     `gorm:"type:varchar(255);uniqueIndex;not null" json:"email"`
    PasswordHash string     `gorm:"type:varchar(60);not null" json:"-"`
    Role         string     `gorm:"type:ENUM('admin', 'school_staff');not null" json:"role"`
    CreatedAt    time.Time  `gorm:"not null;default:CURRENT_TIMESTAMP" json:"created_at"`
    UpdatedAt    time.Time  `gorm:"not null;default:CURRENT_TIMESTAMP" json:"updated_at"`
    LastLoginAt  *time.Time `gorm:"default:null" json:"last_login_at,omitempty"`
}

func (User) TableName() string {
    return "users"
}

func (u *User) BeforeCreate(tx *gorm.DB) error {
    u.Email = strings.ToLower(strings.TrimSpace(u.Email))
    return nil
}

func (u *User) BeforeUpdate(tx *gorm.DB) error {
    u.Email = strings.ToLower(strings.TrimSpace(u.Email))
    return nil
}
```

#### Step 1.5: Implement Database Connection

**File**: `internal/database/db.go`

```go
package database

import (
    "time"
    "gorm.io/gorm"
    "gorm.io/driver/mysql"
    "github.com/yourusername/acap-backend/internal/models"
)

func Connect(dsn string) (*gorm.DB, error) {
    db, err := gorm.Open(mysql.Open(dsn), &gorm.Config{})
    if err != nil {
        return nil, err
    }

    // Configure connection pool
    sqlDB, _ := db.DB()
    sqlDB.SetMaxOpenConns(10)
    sqlDB.SetMaxIdleConns(5)
    sqlDB.SetConnMaxLifetime(5 * time.Minute)

    // Run migrations
    if err := db.AutoMigrate(&models.User{}); err != nil {
        return nil, err
    }

    return db, nil
}
```

#### Step 1.6: Implement Whitelist Helper

**File**: `internal/auth/whitelist.go`

```go
package auth

import "strings"

type Whitelist struct {
    emails map[string]bool
}

func NewWhitelist(emailList []string) *Whitelist {
    wl := &Whitelist{
        emails: make(map[string]bool),
    }
    for _, email := range emailList {
        normalized := strings.ToLower(strings.TrimSpace(email))
        if normalized != "" {
            wl.emails[normalized] = true
        }
    }
    return wl
}

func (wl *Whitelist) IsWhitelisted(email string) bool {
    normalized := strings.ToLower(strings.TrimSpace(email))
    return wl.emails[normalized]
}
```

#### Step 1.7: Implement Auth Service

**File**: `internal/auth/service.go`

```go
package auth

import (
    "errors"
    "time"
    "golang.org/x/crypto/bcrypt"
    "github.com/golang-jwt/jwt/v5"
    "gorm.io/gorm"
    "github.com/yourusername/acap-backend/internal/models"
)

type Service struct {
    db         *gorm.DB
    jwtSecret  []byte
    whitelist  *Whitelist
}

func NewService(db *gorm.DB, jwtSecret string, whitelist *Whitelist) *Service {
    return &Service{
        db:        db,
        jwtSecret: []byte(jwtSecret),
        whitelist: whitelist,
    }
}

func (s *Service) RegisterAdmin(email, password string) (*models.User, string, error) {
    // Check whitelist
    if !s.whitelist.IsWhitelisted(email) {
        return nil, "", errors.New("email not whitelisted")
    }

    // Validate password
    if err := validatePassword(password); err != nil {
        return nil, "", err
    }

    // Hash password
    hashedPassword, err := bcrypt.GenerateFromPassword([]byte(password), 10)
    if err != nil {
        return nil, "", err
    }

    // Create user
    user := &models.User{
        Email:        email,
        PasswordHash: string(hashedPassword),
        Role:         "admin",
    }

    if err := s.db.Create(user).Error; err != nil {
        return nil, "", err
    }

    // Generate JWT
    token, err := s.generateToken(user)
    if err != nil {
        return nil, "", err
    }

    return user, token, nil
}

func (s *Service) Login(email, password string) (*models.User, string, error) {
    var user models.User
    if err := s.db.Where("email = ?", strings.ToLower(strings.TrimSpace(email))).First(&user).Error; err != nil {
        return nil, "", errors.New("invalid credentials")
    }

    // Compare password
    if err := bcrypt.CompareHashAndPassword([]byte(user.PasswordHash), []byte(password)); err != nil {
        return nil, "", errors.New("invalid credentials")
    }

    // Update last login
    now := time.Now()
    user.LastLoginAt = &now
    s.db.Save(&user)

    // Generate JWT
    token, err := s.generateToken(&user)
    if err != nil {
        return nil, "", err
    }

    return &user, token, nil
}

func (s *Service) CreateSchoolStaff(email, password string) (*models.User, error) {
    // Validate password
    if err := validatePassword(password); err != nil {
        return nil, err
    }

    // Hash password
    hashedPassword, err := bcrypt.GenerateFromPassword([]byte(password), 10)
    if err != nil {
        return nil, err
    }

    // Create user
    user := &models.User{
        Email:        email,
        PasswordHash: string(hashedPassword),
        Role:         "school_staff",
    }

    if err := s.db.Create(user).Error; err != nil {
        return nil, err
    }

    return user, nil
}

func (s *Service) generateToken(user *models.User) (string, error) {
    claims := jwt.MapClaims{
        "sub":   fmt.Sprintf("%d", user.ID),
        "email": user.Email,
        "role":  user.Role,
        "exp":   time.Now().Add(24 * time.Hour).Unix(),
        "iat":   time.Now().Unix(),
    }

    token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
    return token.SignedString(s.jwtSecret)
}

func validatePassword(password string) error {
    if len(password) < 8 {
        return errors.New("password must be at least 8 characters")
    }
    hasLetter := false
    hasNumber := false
    for _, char := range password {
        if unicode.IsLetter(char) {
            hasLetter = true
        }
        if unicode.IsDigit(char) {
            hasNumber = true
        }
    }
    if !hasLetter || !hasNumber {
        return errors.New("password must contain at least one letter and one number")
    }
    return nil
}
```

#### Step 1.8: Implement JWT Middleware

**File**: `internal/auth/middleware.go`

```go
package auth

import (
    "net/http"
    "strings"
    "github.com/gin-gonic/gin"
    "github.com/golang-jwt/jwt/v5"
)

func (s *Service) AuthMiddleware() gin.HandlerFunc {
    return func(c *gin.Context) {
        authHeader := c.GetHeader("Authorization")
        if authHeader == "" {
            c.JSON(http.StatusUnauthorized, gin.H{
                "error": gin.H{
                    "code":    "INVALID_TOKEN",
                    "message": "Authorization header required",
                    "status":  401,
                },
            })
            c.Abort()
            return
        }

        tokenString := strings.TrimPrefix(authHeader, "Bearer ")
        token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
            return s.jwtSecret, nil
        })

        if err != nil || !token.Valid {
            c.JSON(http.StatusUnauthorized, gin.H{
                "error": gin.H{
                    "code":    "INVALID_TOKEN",
                    "message": "Invalid authentication token",
                    "status":  401,
                },
            })
            c.Abort()
            return
        }

        claims := token.Claims.(jwt.MapClaims)
        c.Set("user_id", claims["sub"])
        c.Set("user_email", claims["email"])
        c.Set("user_role", claims["role"])
        c.Next()
    }
}

func (s *Service) AdminOnly() gin.HandlerFunc {
    return func(c *gin.Context) {
        role, exists := c.Get("user_role")
        if !exists || role != "admin" {
            c.JSON(http.StatusForbidden, gin.H{
                "error": gin.H{
                    "code":    "FORBIDDEN",
                    "message": "Only administrators can access this endpoint",
                    "status":  403,
                },
            })
            c.Abort()
            return
        }
        c.Next()
    }
}
```

#### Step 1.9: Implement HTTP Handlers

**File**: `internal/auth/handler.go`

```go
package auth

import (
    "net/http"
    "github.com/gin-gonic/gin"
)

type Handler struct {
    service *Service
}

func NewHandler(service *Service) *Handler {
    return &Handler{service: service}
}

func (h *Handler) Register(c *gin.Context) {
    var req struct {
        Email    string `json:"email" binding:"required,email"`
        Password string `json:"password" binding:"required"`
    }

    if err := c.ShouldBindJSON(&req); err != nil {
        c.JSON(http.StatusBadRequest, gin.H{
            "error": gin.H{
                "code":    "VALIDATION_ERROR",
                "message": err.Error(),
                "status":  400,
            },
        })
        return
    }

    user, token, err := h.service.RegisterAdmin(req.Email, req.Password)
    if err != nil {
        statusCode := http.StatusBadRequest
        code := "VALIDATION_ERROR"
        if err.Error() == "email not whitelisted" {
            statusCode = http.StatusForbidden
            code = "NOT_WHITELISTED"
        }
        c.JSON(statusCode, gin.H{
            "error": gin.H{
                "code":    code,
                "message": err.Error(),
                "status":  statusCode,
            },
        })
        return
    }

    c.JSON(http.StatusCreated, gin.H{
        "data": gin.H{
            "user":  user,
            "token": token,
        },
    })
}

func (h *Handler) Login(c *gin.Context) {
    var req struct {
        Email    string `json:"email" binding:"required"`
        Password string `json:"password" binding:"required"`
    }

    if err := c.ShouldBindJSON(&req); err != nil {
        c.JSON(http.StatusBadRequest, gin.H{
            "error": gin.H{
                "code":    "VALIDATION_ERROR",
                "message": "Email and password are required",
                "status":  400,
            },
        })
        return
    }

    user, token, err := h.service.Login(req.Email, req.Password)
    if err != nil {
        c.JSON(http.StatusUnauthorized, gin.H{
            "error": gin.H{
                "code":    "INVALID_CREDENTIALS",
                "message": "Invalid email or password",
                "status":  401,
            },
        })
        return
    }

    c.JSON(http.StatusOK, gin.H{
        "data": gin.H{
            "user":  user,
            "token": token,
        },
    })
}

func (h *Handler) Logout(c *gin.Context) {
    c.JSON(http.StatusOK, gin.H{
        "data": gin.H{
            "message": "Logout successful",
        },
    })
}

func (h *Handler) GetCurrentUser(c *gin.Context) {
    userID, _ := c.Get("user_id")
    var user models.User
    if err := h.service.db.First(&user, userID).Error; err != nil {
        c.JSON(http.StatusUnauthorized, gin.H{
            "error": gin.H{
                "code":    "INVALID_TOKEN",
                "message": "User not found",
                "status":  401,
            },
        })
        return
    }

    c.JSON(http.StatusOK, gin.H{
        "data": user,
    })
}

func (h *Handler) CreateUser(c *gin.Context) {
    var req struct {
        Email    string `json:"email" binding:"required,email"`
        Password string `json:"password" binding:"required"`
    }

    if err := c.ShouldBindJSON(&req); err != nil {
        c.JSON(http.StatusBadRequest, gin.H{
            "error": gin.H{
                "code":    "VALIDATION_ERROR",
                "message": err.Error(),
                "status":  400,
            },
        })
        return
    }

    user, err := h.service.CreateSchoolStaff(req.Email, req.Password)
    if err != nil {
        c.JSON(http.StatusBadRequest, gin.H{
            "error": gin.H{
                "code":    "VALIDATION_ERROR",
                "message": err.Error(),
                "status":  400,
            },
        })
        return
    }

    c.JSON(http.StatusCreated, gin.H{
        "data": user,
    })
}
```

#### Step 1.10: Create Main Server

**File**: `cmd/server/main.go`

```go
package main

import (
    "log"
    "github.com/gin-gonic/gin"
    "github.com/gin-contrib/cors"
    "github.com/yourusername/acap-backend/internal/config"
    "github.com/yourusername/acap-backend/internal/database"
    "github.com/yourusername/acap-backend/internal/auth"
)

func main() {
    // Load config
    cfg, err := config.Load()
    if err != nil {
        log.Fatal("Failed to load config:", err)
    }

    // Connect to database
    db, err := database.Connect(cfg.DatabaseURL)
    if err != nil {
        log.Fatal("Failed to connect to database:", err)
    }

    // Initialize auth components
    whitelist := auth.NewWhitelist(cfg.AdminWhitelist)
    authService := auth.NewService(db, cfg.JWTSecret, whitelist)
    authHandler := auth.NewHandler(authService)

    // Setup Gin
    r := gin.Default()

    // CORS
    r.Use(cors.New(cors.Config{
        AllowOrigins:     []string{cfg.FrontendURL},
        AllowMethods:     []string{"GET", "POST", "PUT", "DELETE"},
        AllowHeaders:     []string{"Origin", "Content-Type", "Authorization"},
        AllowCredentials: true,
    }))

    // Routes
    v1 := r.Group("/api/v1")
    {
        auth := v1.Group("/auth")
        {
            auth.POST("/register", authHandler.Register)
            auth.POST("/login", authHandler.Login)
            auth.POST("/logout", authService.AuthMiddleware(), authHandler.Logout)
            auth.GET("/me", authService.AuthMiddleware(), authHandler.GetCurrentUser)
        }

        admin := v1.Group("/admin")
        admin.Use(authService.AuthMiddleware(), authService.AdminOnly())
        {
            admin.POST("/users", authHandler.CreateUser)
        }
    }

    // Health check
    r.GET("/health", func(c *gin.Context) {
        c.JSON(200, gin.H{"status": "ok"})
    })

    // Start server
    log.Printf("Server starting on port %s", cfg.Port)
    if err := r.Run(":" + cfg.Port); err != nil {
        log.Fatal("Failed to start server:", err)
    }
}
```

#### Step 1.11: Run Backend

```bash
cd backend
go run cmd/server/main.go
```

Expected output:
```
Server starting on port 8080
```

### Phase 2: Frontend Setup (Next.js/TypeScript)

#### Step 2.1: Initialize Next.js Project

```bash
npx create-next-app@14 frontend --typescript --tailwind --src-dir --app=false
cd frontend
npm install @tanstack/react-query axios zod
```

#### Step 2.2: Create API Client

**File**: `src/lib/api.ts`

```typescript
import axios from 'axios'

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export default api
```

#### Step 2.3: Create Auth Utilities

**File**: `src/lib/auth.ts`

```typescript
export const setAuthToken = (token: string) => {
  localStorage.setItem('auth_token', token)
}

export const getAuthToken = (): string | null => {
  return localStorage.getItem('auth_token')
}

export const clearAuthToken = () => {
  localStorage.removeItem('auth_token')
}

export const isAuthenticated = (): boolean => {
  return !!getAuthToken()
}
```

#### Step 2.4: Create Validation Schemas

**File**: `src/lib/validation.ts`

```typescript
import { z } from 'zod'

export const loginSchema = z.object({
  email: z.string().email('Invalid email format').toLowerCase(),
  password: z.string().min(1, 'Password is required'),
})

export const registerSchema = z.object({
  email: z.string().email('Invalid email format').toLowerCase(),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[a-zA-Z]/, 'Password must contain at least one letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
})

export type LoginForm = z.infer<typeof loginSchema>
export type RegisterForm = z.infer<typeof registerSchema>
```

#### Step 2.5: Create Auth Context

**File**: `src/context/AuthContext.tsx`

```typescript
import React, { createContext, useContext, useState, useEffect } from 'react'
import { getAuthToken, clearAuthToken } from '../lib/auth'

interface User {
  id: number
  email: string
  role: 'admin' | 'school_staff'
}

interface AuthContextType {
  user: User | null
  setUser: (user: User | null) => void
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    // Check if token exists on mount
    if (getAuthToken()) {
      // Optionally fetch user info from /auth/me
    }
  }, [])

  const logout = () => {
    setUser(null)
    clearAuthToken()
  }

  return (
    <AuthContext.Provider value={{ user, setUser, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
```

#### Step 2.6: Create Login Page

**File**: `src/pages/login.tsx`

```typescript
import { useState } from 'react'
import { useRouter } from 'next/router'
import { useMutation } from '@tanstack/react-query'
import api from '../lib/api'
import { setAuthToken } from '../lib/auth'
import { useAuth } from '../context/AuthContext'
import { loginSchema, LoginForm } from '../lib/validation'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const router = useRouter()
  const { setUser } = useAuth()

  const loginMutation = useMutation({
    mutationFn: async (data: LoginForm) => {
      const response = await api.post('/auth/login', data)
      return response.data
    },
    onSuccess: (data) => {
      setAuthToken(data.data.token)
      setUser(data.data.user)
      router.push('/dashboard')
    },
    onError: (error: any) => {
      setError(error.response?.data?.error?.message || 'Login failed')
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    const result = loginSchema.safeParse({ email, password })
    if (!result.success) {
      setError(result.error.errors[0].message)
      return
    }

    loginMutation.mutate(result.data)
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-full max-w-md p-8 bg-white rounded-lg shadow">
        <h1 className="text-2xl font-bold mb-6">Login</h1>
        {error && <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-2 border rounded"
              required
            />
          </div>
          <div className="mb-6">
            <label className="block mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-2 border rounded"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loginMutation.isPending}
            className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600 disabled:opacity-50"
          >
            {loginMutation.isPending ? 'Logging in...' : 'Login'}
          </button>
        </form>
      </div>
    </div>
  )
}
```

#### Step 2.7: Run Frontend

```bash
cd frontend
npm run dev
```

Expected output:
```
ready - started server on 0.0.0.0:3000
```

## Testing

### Manual Testing Checklist

1. **Admin Registration**:
   - Visit `http://localhost:3000/register`
   - Enter whitelisted email + valid password → Success
   - Enter non-whitelisted email → Error
   - Enter weak password → Error

2. **Login**:
   - Visit `http://localhost:3000/login`
   - Enter valid credentials → Redirect to dashboard
   - Enter invalid credentials → Error message

3. **Admin Create School Staff**:
   - Login as admin
   - Visit admin user creation page
   - Create school staff account → Success
   - Login as school staff → Success

4. **Token Expiration**:
   - Login and wait 24 hours (or manipulate JWT exp claim)
   - Access protected resource → Re-login required

5. **Logout**:
   - Click logout button
   - Token cleared from localStorage
   - Accessing protected pages redirects to login

### API Testing with curl

**Register Admin**:
```bash
curl -X POST http://localhost:8080/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"SecurePass123"}'
```

**Login**:
```bash
curl -X POST http://localhost:8080/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"SecurePass123"}'
```

**Get Current User** (replace TOKEN):
```bash
curl http://localhost:8080/api/v1/auth/me \
  -H "Authorization: Bearer TOKEN"
```

**Create School Staff** (admin only, replace TOKEN):
```bash
curl -X POST http://localhost:8080/api/v1/admin/users \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"email":"staff@school.com","password":"StaffPass456"}'
```

## Deployment

### Backend (AWS ECS Fargate)

1. Build Docker image
2. Push to ECR
3. Create ECS task definition (0.25 vCPU, 0.5GB RAM)
4. Set environment variables in task definition
5. Deploy service

### Frontend (Vercel)

1. Push code to Git repository
2. Import project in Vercel
3. Set `NEXT_PUBLIC_API_URL` environment variable
4. Deploy

## Troubleshooting

**Database Connection Failed**:
- Check `DATABASE_URL` format
- Verify MySQL is running
- Check firewall/security group rules

**JWT Token Invalid**:
- Ensure `JWT_SECRET` is consistent across restarts
- Check token hasn't expired (24h limit)

**CORS Errors**:
- Verify `FRONTEND_URL` matches actual frontend origin
- Check CORS middleware configuration

**Whitelist Not Working**:
- Confirm `ADMIN_WHITELIST` environment variable is set
- Check email normalization (should be lowercase)

## Next Steps

After completing this quickstart:
1. Run `/speckit.tasks` to generate task list for implementation
2. Follow task list sequentially
3. Write tests as specified in tasks
4. Deploy to staging environment for demo testing
