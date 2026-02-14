# Data Model: User Authentication System (MVP)

**Feature**: User Authentication System (MVP)
**Date**: 2025-11-14
**Phase**: 1 - Data Model Design

## Overview

The authentication system uses a single-table design for user data. All users (admins and school staff) are stored in the `users` table with a role discriminator. The email whitelist is not persisted in the database (loaded from environment variable).

## Entity: User

### Description

Represents any person with access to the ACAP system. Each user has exactly one role (admin or school_staff) and authenticates using email + password.

### Attributes

| Attribute | Type | Constraints | Description |
|-----------|------|-------------|-------------|
| id | BIGINT UNSIGNED | PRIMARY KEY, AUTO_INCREMENT | Unique identifier for the user |
| email | VARCHAR(255) | NOT NULL, UNIQUE | User's email address (normalized to lowercase) |
| password_hash | VARCHAR(60) | NOT NULL | bcrypt hashed password (60-character output) |
| role | ENUM('admin', 'school_staff') | NOT NULL | User's role in the system |
| created_at | TIMESTAMP | NOT NULL, DEFAULT CURRENT_TIMESTAMP | When the account was created |
| updated_at | TIMESTAMP | NOT NULL, DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP | Last modification timestamp |
| last_login_at | TIMESTAMP | NULL | Last successful login timestamp (NULL if never logged in) |

### Indexes

- **PRIMARY KEY** on `id`: Fast lookups by user ID
- **UNIQUE INDEX** on `email`: Enforces email uniqueness, optimizes login queries
- **INDEX** on `email`: Explicit B-tree index for `SELECT WHERE email = ?` queries (< 100ms p95)

### Validation Rules

Implemented at application layer (service/validation):

1. **Email**:
   - MUST match RFC 5322 email format
   - MUST be unique across all users
   - Normalized to lowercase before storage
   - Leading/trailing whitespace trimmed
   - Max length 255 characters

2. **Password** (plain text, before hashing):
   - MUST be at least 8 characters
   - MUST contain at least 1 letter AND 1 number
   - Max length 72 characters (bcrypt limit)
   - Leading/trailing whitespace NOT trimmed (passwords are exact)

3. **Role**:
   - MUST be 'admin' or 'school_staff'
   - Database ENUM constraint enforces this at DB level

4. **password_hash**:
   - MUST be bcrypt output (60 characters starting with $2a$, $2b$, or $2y$)
   - Never exposed in API responses

### State Transitions

```
[Not Exists]
    |
    | (Admin registers OR Admin creates school staff)
    v
[Active User]
    |
    | (Logs in)
    v
[Authenticated Session] (JWT token issued, last_login_at updated)
    |
    | (24 hours pass OR logout)
    v
[Session Expired] (user still exists, must re-login)
```

**Notes**:
- No "inactive" or "locked" states in MVP
- No "deleted" state in MVP (deferred to future)
- Account lockout not implemented (deferred to future)

### Relationships

- **One-to-Many (Implicit)**: One admin user can create multiple school_staff users
  - Not enforced via foreign key (no "created_by" field in MVP)
  - Audit trail deferred to future enhancement

- **One-to-One (Implicit)**: Each user has one JWT token at a time (conceptually)
  - Tokens not persisted in database (stateless JWT)
  - Same user can have multiple active tokens from different devices (concurrent sessions allowed)

### GORM Model Definition (Go)

```go
package models

import (
    "time"
    "gorm.io/gorm"
)

type User struct {
    ID           uint      `gorm:"primaryKey;autoIncrement" json:"id"`
    Email        string    `gorm:"type:varchar(255);uniqueIndex;not null" json:"email"`
    PasswordHash string    `gorm:"type:varchar(60);not null" json:"-"` // Never serialize to JSON
    Role         string    `gorm:"type:ENUM('admin', 'school_staff');not null" json:"role"`
    CreatedAt    time.Time `gorm:"not null;default:CURRENT_TIMESTAMP" json:"created_at"`
    UpdatedAt    time.Time `gorm:"not null;default:CURRENT_TIMESTAMP" json:"updated_at"`
    LastLoginAt  *time.Time `gorm:"default:null" json:"last_login_at,omitempty"`
}

// TableName overrides default table name
func (User) TableName() string {
    return "users"
}

// BeforeCreate hook to normalize email
func (u *User) BeforeCreate(tx *gorm.DB) error {
    u.Email = strings.ToLower(strings.TrimSpace(u.Email))
    return nil
}

// BeforeUpdate hook to normalize email on updates
func (u *User) BeforeUpdate(tx *gorm.DB) error {
    u.Email = strings.ToLower(strings.TrimSpace(u.Email))
    return nil
}
```

### TypeScript Type Definition (Frontend)

```typescript
export type UserRole = 'admin' | 'school_staff'

export interface User {
  id: number
  email: string
  role: UserRole
  created_at: string  // ISO 8601 timestamp
  updated_at: string  // ISO 8601 timestamp
  last_login_at?: string  // ISO 8601 timestamp, optional
}

// password_hash is NEVER sent to frontend
```

## Non-Persisted Entity: Email Whitelist

### Description

List of email addresses approved for admin self-registration. NOT stored in database for MVP simplicity.

### Storage Mechanism

**Environment Variable**: `ADMIN_WHITELIST`

**Format**: Comma-separated list of email addresses

**Example**: `ADMIN_WHITELIST="admin1@example.com,admin2@example.com,admin3@example.com"`

### In-Memory Representation

```go
// Loaded once at application startup
var adminWhitelist map[string]bool

func LoadWhitelist() {
    rawList := os.Getenv("ADMIN_WHITELIST")
    emails := strings.Split(rawList, ",")
    adminWhitelist = make(map[string]bool)
    for _, email := range emails {
        normalized := strings.ToLower(strings.TrimSpace(email))
        if normalized != "" {
            adminWhitelist[normalized] = true
        }
    }
}

func IsEmailWhitelisted(email string) bool {
    normalized := strings.ToLower(strings.TrimSpace(email))
    return adminWhitelist[normalized]
}
```

### Validation Rules

1. Email addresses MUST be valid RFC 5322 format
2. Duplicates are automatically deduplicated by map structure
3. Empty strings are ignored (after trimming)
4. Case-insensitive matching (all normalized to lowercase)

## Non-Persisted Entity: JWT Token

### Description

Stateless authentication token issued upon successful login. NOT stored in database.

### Structure

**Format**: JSON Web Token (JWT) with HS256 signing

**Header**:
```json
{
  "alg": "HS256",
  "typ": "JWT"
}
```

**Payload** (Claims):
```json
{
  "sub": "123",                     // User ID (subject)
  "email": "user@example.com",       // User email
  "role": "admin",                   // User role ('admin' or 'school_staff')
  "exp": 1699987200,                 // Expiration (Unix timestamp, 24h from issuance)
  "iat": 1699900800                  // Issued at (Unix timestamp)
}
```

**Signature**: HMAC-SHA256 signature using `JWT_SECRET` from environment

### Validation Rules

1. **Signature MUST be valid**: Computed with secret key
2. **Expiration MUST be in future**: `exp` > current time
3. **Required claims MUST exist**: sub, email, role, exp, iat
4. **Role MUST be valid**: 'admin' or 'school_staff'

### Lifecycle

1. **Issuance**: Generated by backend on successful login
2. **Storage**: Client stores in localStorage or httpOnly cookie
3. **Usage**: Sent in `Authorization: Bearer <token>` header on API requests
4. **Validation**: Backend validates signature + expiration on every protected endpoint
5. **Expiration**: After 24 hours, token becomes invalid (user must re-login)
6. **Logout**: Client deletes token (server does not track invalidation)

### Go Type Definition

```go
type JWTClaims struct {
    UserID uint   `json:"sub"`
    Email  string `json:"email"`
    Role   string `json:"role"`
    jwt.RegisteredClaims
}
```

### TypeScript Type Definition

```typescript
export interface JWTPayload {
  sub: string        // User ID as string
  email: string
  role: UserRole
  exp: number        // Unix timestamp
  iat: number        // Unix timestamp
}
```

## Database Schema (SQL)

### MySQL Schema Definition

```sql
CREATE TABLE users (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(60) NOT NULL,
    role ENUM('admin', 'school_staff') NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    last_login_at TIMESTAMP NULL DEFAULT NULL,

    INDEX idx_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### Initial Data (Seed)

No seed data in MVP. First admin must self-register using whitelisted email.

**Bootstrap Process**:
1. Deploy application with `ADMIN_WHITELIST` containing at least one email
2. First admin visits `/register` and creates account
3. First admin logs in and creates school staff accounts as needed

## Data Access Patterns

### Query Patterns

1. **Login Query**:
   ```sql
   SELECT id, email, password_hash, role, created_at, updated_at, last_login_at
   FROM users
   WHERE email = ?
   LIMIT 1;
   ```
   - **Frequency**: Every login attempt
   - **Performance**: < 100ms (indexed on email)

2. **Check Email Uniqueness**:
   ```sql
   SELECT COUNT(*) FROM users WHERE email = ?;
   ```
   - **Frequency**: Every registration attempt
   - **Performance**: < 100ms (indexed on email)

3. **Create User** (Registration or Admin-created):
   ```sql
   INSERT INTO users (email, password_hash, role, created_at, updated_at)
   VALUES (?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
   ```
   - **Frequency**: Occasional (registration/user creation)
   - **Performance**: < 50ms

4. **Update Last Login**:
   ```sql
   UPDATE users SET last_login_at = ? WHERE id = ?;
   ```
   - **Frequency**: Every successful login
   - **Performance**: < 50ms (primary key lookup)

5. **Get Current User** (for /auth/me endpoint):
   ```sql
   SELECT id, email, role, created_at, updated_at, last_login_at
   FROM users
   WHERE id = ?
   LIMIT 1;
   ```
   - **Frequency**: Optional (when frontend needs user info)
   - **Performance**: < 50ms (primary key lookup)

### Performance Optimization

- **Email Index**: B-tree index on email column enables O(log n) lookups
- **No Joins**: Single table design eliminates join overhead
- **Connection Pooling**: Max 10 connections shared across requests
- **JWT Validation**: No database hit (validates cryptographically)

### Estimated Load (MVP)

- **Total Users**: < 100 (5 schools × ~20 users/school)
- **Concurrent Logins**: < 5 per day (morning login peak)
- **Queries Per Second (QPS)**: < 1 during normal operation
- **Peak QPS**: ~5 during morning login rush

**Conclusion**: Single `users` table on RDS t3.micro (1GB RAM) is vastly over-provisioned for MVP load.

## Data Integrity Constraints

### Database-Level Constraints

1. **PRIMARY KEY** on `id`: Uniqueness enforced by MySQL
2. **UNIQUE** on `email`: Duplicate emails rejected by MySQL
3. **NOT NULL** on `email`, `password_hash`, `role`: Enforced by MySQL
4. **ENUM** on `role`: Only 'admin' or 'school_staff' allowed by MySQL
5. **AUTO_INCREMENT** on `id`: Guaranteed unique ID generation

### Application-Level Constraints

1. **Email Validation**: RFC 5322 format check before INSERT
2. **Password Complexity**: 8+ chars, letter + number before hashing
3. **Email Normalization**: Lowercase + trim before storage
4. **Whitelist Check**: Admin registration requires whitelist membership
5. **Role Assignment**:
   - Self-registered users → 'admin'
   - Admin-created users → 'school_staff'

## Security Considerations

### Password Storage

- **Never store plain text passwords**: Always hash with bcrypt before INSERT
- **Never log passwords**: Exclude from all logging statements
- **Never return password_hash**: Exclude from JSON serialization (GORM `json:"-"` tag)

### Email Privacy

- **Generic login errors**: Don't reveal whether email exists in system
- **Case-insensitive lookup**: Prevents email enumeration via case variations

### Token Security

- **Secret key**: Load `JWT_SECRET` from environment, never commit to git
- **Short expiration**: 24h limits window for stolen token exploitation
- **HTTPS only**: Tokens transmitted only over encrypted connections in production

### Database Security

- **Parameterized queries**: GORM prevents SQL injection
- **Minimum privileges**: Database user should have SELECT, INSERT, UPDATE only (no DROP, DELETE in MVP)
- **Connection encryption**: Enable TLS for RDS connection in production

## Migration Strategy

### Initial Migration (MVP)

Use GORM AutoMigrate for simplicity:

```go
func RunMigrations(db *gorm.DB) error {
    return db.AutoMigrate(&User{})
}
```

**Note**: AutoMigrate is safe for MVP but not recommended for production. For production, use versioned migrations (e.g., golang-migrate, goose).

### Future Migration Considerations

Deferred to post-MVP:
- Add `created_by` field (foreign key to admin who created the user)
- Add `deleted_at` field (soft delete support)
- Add `failed_login_attempts` and `locked_until` fields (account lockout)
- Separate `admin_whitelist` table with CRUD UI

## Data Retention

### MVP Policy

- **User Data**: Retained indefinitely (no deletion in MVP)
- **JWT Tokens**: Expire after 24 hours (automatically invalid, not persisted)
- **Audit Logs**: Not implemented in MVP (last_login_at only)

### Future Considerations

- Implement GDPR-compliant data deletion
- Add audit log table for security events
- Implement token revocation (blacklist)

## Conclusion

The single-table `users` design is intentionally simple to meet MVP requirements while staying within constitution constraints. The schema supports all functional requirements (FR-001 through FR-029) and can scale to hundreds of users without performance issues on RDS t3.micro infrastructure.
