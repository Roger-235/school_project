# Feature Specification: User Authentication System (MVP)

**Feature Branch**: `001-user-auth`
**Created**: 2025-11-14
**Status**: Draft
**Input**: User description: "開發使用者認證系統（MVP版）：
- 管理員可以註冊（僅限 Email 白名單）
- 學校人員由管理員建立帳號
- 登入功能使用 Email + 密碼
- 使用 JWT Token 進行身份驗證
- Token 有效期 24 小時
- 登出功能會清除 Token
- 兩種角色：admin（管理員）、school_staff（學校人員）

不包含：
- 忘記密碼功能
- Email 驗證
- Multi-Factor Authentication
- 社群登入"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Admin Self-Registration with Email Whitelist (Priority: P1)

A system administrator needs to create their own account to access the ACAP system. Only administrators with pre-approved email addresses can register themselves. This is the foundation for system access control.

**Why this priority**: Without admin accounts, no one can access the system or create other accounts. This is the entry point for the entire authentication system and must work first.

**Independent Test**: Can be fully tested by attempting to register with whitelisted and non-whitelisted emails, then logging in with the created admin account. Delivers the ability to bootstrap the system with initial administrators.

**Acceptance Scenarios**:

1. **Given** an email address is on the whitelist, **When** admin submits registration form with valid email and password, **Then** account is created successfully and admin can log in
2. **Given** an email address is NOT on the whitelist, **When** admin attempts to register, **Then** registration is rejected with clear error message
3. **Given** admin submits weak password (e.g., less than 8 characters), **When** registration is attempted, **Then** system rejects with password requirement message
4. **Given** admin submits duplicate email, **When** registration is attempted, **Then** system rejects with "email already exists" error

---

### User Story 2 - User Login with Email and Password (Priority: P2)

Any registered user (admin or school staff) needs to log into the system using their email and password to access their assigned features and data.

**Why this priority**: After accounts exist (P1), users need a way to authenticate. This enables all users to access the system and is required before any role-based features can be tested.

**Independent Test**: Can be tested by creating test accounts (via admin registration or admin-created school staff) and logging in with correct/incorrect credentials. Delivers authenticated sessions for accessing protected features.

**Acceptance Scenarios**:

1. **Given** valid email and password, **When** user submits login form, **Then** user receives authentication token and is redirected to dashboard
2. **Given** invalid email or password, **When** user submits login form, **Then** login fails with generic error message (for security)
3. **Given** user is already logged in with valid token, **When** user navigates to login page, **Then** user is redirected to dashboard
4. **Given** account does not exist, **When** user attempts login, **Then** login fails with generic error message
5. **Given** user submits empty email or password, **When** login is attempted, **Then** system shows validation error

---

### User Story 3 - Admin Creates School Staff Accounts (Priority: P3)

System administrators need to create accounts for school personnel who will manage student data. School staff cannot self-register; only admins can create these accounts.

**Why this priority**: After admin login works (P2), administrators need the ability to onboard school staff. This enables the system to scale beyond initial admins and begin serving schools.

**Independent Test**: Can be tested by logging in as admin, creating school staff accounts with various email addresses, then logging in as those school staff members to verify account creation. Delivers multi-user system with role separation.

**Acceptance Scenarios**:

1. **Given** admin is logged in, **When** admin submits school staff creation form with valid email and password, **Then** school staff account is created with "school_staff" role
2. **Given** admin attempts to create account with duplicate email, **When** form is submitted, **Then** system rejects with "email already exists" error
3. **Given** school staff account is created, **When** school staff logs in with provided credentials, **Then** login succeeds and user sees school staff dashboard
4. **Given** non-admin user is logged in, **When** user attempts to access account creation page, **Then** access is denied
5. **Given** admin submits invalid email format, **When** form is submitted, **Then** system shows email validation error

---

### User Story 4 - Token-Based Session Management (Priority: P4)

The system needs to maintain user sessions securely using time-limited authentication tokens. Tokens expire after 24 hours to balance security and user convenience.

**Why this priority**: After login works (P2), the system needs secure session management. This ensures users stay logged in during normal use but are protected against long-term token theft.

**Independent Test**: Can be tested by logging in, verifying token is issued, using the token to access protected resources, waiting for expiration, and verifying expired tokens are rejected. Delivers secure, time-limited sessions.

**Acceptance Scenarios**:

1. **Given** user successfully logs in, **When** login completes, **Then** system issues JWT token valid for 24 hours
2. **Given** user has valid token, **When** user accesses protected resource, **Then** system validates token and grants access
3. **Given** token has expired (>24 hours old), **When** user accesses protected resource, **Then** system rejects request and prompts re-login
4. **Given** user presents malformed or invalid token, **When** user accesses protected resource, **Then** system rejects request with authentication error
5. **Given** user is accessing system within token validity period, **When** user navigates between pages, **Then** user remains logged in without re-authentication

---

### User Story 5 - User Logout (Priority: P5)

Users need the ability to explicitly log out of the system to end their session, especially on shared devices or when finishing work.

**Why this priority**: After session management works (P4), users need control over their sessions. This provides security for users on shared devices and clean session termination.

**Independent Test**: Can be tested by logging in, verifying access to protected resources, logging out, then verifying token is cleared and protected resources are no longer accessible. Delivers user-controlled session termination.

**Acceptance Scenarios**:

1. **Given** user is logged in, **When** user clicks logout button, **Then** authentication token is cleared and user is redirected to login page
2. **Given** user has logged out, **When** user attempts to access protected resource, **Then** system prompts for login
3. **Given** user has logged out, **When** user clicks browser back button, **Then** user cannot access previously viewed protected pages
4. **Given** user is not logged in, **When** user attempts to logout, **Then** system handles gracefully (redirect to login or no-op)

---

### Edge Cases

- **Concurrent logins**: What happens when the same user logs in from multiple devices simultaneously? (Assumption: Allow multiple sessions with separate tokens)
- **Password complexity**: What minimum password requirements should be enforced? (Assumption: Minimum 8 characters, at least one letter and one number)
- **Whitelist management**: How is the email whitelist maintained and updated? (Decision: Environment variable containing comma-separated list of approved emails - simple for MVP, updateable via infrastructure config without code changes)
- **Account lockout**: Should accounts be locked after multiple failed login attempts? (Assumption: Not implemented in MVP - defer to future enhancement)
- **Token refresh**: Should tokens be refreshable before expiration? (Assumption: No refresh in MVP - users must re-login after 24 hours)
- **Case sensitivity**: Are email addresses case-sensitive for login? (Assumption: Email addresses normalized to lowercase for comparison)
- **Token storage**: Where should the client store the token? (Assumption: localStorage or httpOnly cookie - implementation decision)
- **Whitespace handling**: How should leading/trailing whitespace in email/password be handled? (Assumption: Trim whitespace from email, preserve for password)

## Requirements *(mandatory)*

### Functional Requirements

**Authentication & Authorization**:

- **FR-001**: System MUST allow administrators to self-register accounts using email addresses present on a predefined whitelist
- **FR-002**: System MUST reject registration attempts from email addresses not on the whitelist with clear error message
- **FR-003**: System MUST allow administrators to create school staff user accounts with email and password
- **FR-004**: System MUST prevent school staff users from self-registering or creating other accounts
- **FR-005**: System MUST authenticate users via email and password combination
- **FR-006**: System MUST support exactly two user roles: "admin" (administrator) and "school_staff" (school personnel)
- **FR-007**: System MUST assign "admin" role to self-registered users from whitelist
- **FR-008**: System MUST assign "school_staff" role to accounts created by administrators

**Token Management**:

- **FR-009**: System MUST issue JWT (JSON Web Token) upon successful login
- **FR-010**: System MUST set token expiration to 24 hours from issuance time
- **FR-011**: System MUST validate token signature and expiration on every protected resource access
- **FR-012**: System MUST reject expired tokens and prompt user to re-login
- **FR-013**: System MUST reject malformed or tampered tokens with authentication error

**Session Management**:

- **FR-014**: System MUST provide logout functionality that clears authentication token
- **FR-015**: System MUST redirect unauthenticated users to login page when accessing protected resources
- **FR-016**: System MUST redirect authenticated users to dashboard when accessing login page
- **FR-017**: System MUST maintain user session state while token remains valid

**Password Security**:

- **FR-018**: System MUST enforce minimum password length of 8 characters
- **FR-019**: System MUST require passwords to contain at least one letter and one number
- **FR-020**: System MUST store passwords using secure one-way hashing (not reversible)
- **FR-021**: System MUST NOT log or display passwords in plain text

**Input Validation**:

- **FR-022**: System MUST validate email format according to standard email specification
- **FR-023**: System MUST normalize email addresses to lowercase for comparison
- **FR-024**: System MUST trim leading/trailing whitespace from email input
- **FR-025**: System MUST reject empty email or password fields
- **FR-026**: System MUST prevent duplicate email addresses across all users

**Error Handling**:

- **FR-027**: System MUST return generic error message for failed login attempts (do not reveal if email or password was incorrect)
- **FR-028**: System MUST return specific error messages for registration validation failures (weak password, duplicate email, not whitelisted)
- **FR-029**: System MUST handle network errors gracefully with user-friendly messages

**Explicitly Out of Scope** (will not be implemented in MVP):

- **FR-030**: System will NOT implement password reset or "forgot password" functionality
- **FR-031**: System will NOT send email verification or confirmation emails
- **FR-032**: System will NOT implement multi-factor authentication (MFA)
- **FR-033**: System will NOT integrate with social login providers (Google, Facebook, etc.)
- **FR-034**: System will NOT implement account lockout after failed login attempts
- **FR-035**: System will NOT implement token refresh mechanism

### Key Entities

- **User**: Represents any person with system access
  - Attributes: unique identifier, email address (unique, normalized), hashed password, user role (admin or school_staff), account creation timestamp, last login timestamp
  - Relationships: Each user has exactly one role; admins can create multiple school_staff users

- **Email Whitelist**: Predefined list of approved email addresses for admin self-registration
  - Attributes: email address, date added to whitelist
  - Relationships: Referenced during admin registration validation

- **Authentication Token (JWT)**: Time-limited credential issued upon successful login
  - Attributes: user identifier, role, issuance time, expiration time (24 hours), cryptographic signature
  - Relationships: Associated with one user; used to authorize protected resource access

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Whitelisted administrators can complete self-registration in under 2 minutes, including form submission and first successful login
- **SC-002**: Users can log in and receive authentication token in under 3 seconds (95th percentile) on standard network connection
- **SC-003**: Administrators can create school staff accounts in under 1 minute per account
- **SC-004**: System correctly rejects 100% of login attempts with invalid credentials
- **SC-005**: System correctly rejects 100% of registration attempts from non-whitelisted email addresses
- **SC-006**: Expired tokens (>24 hours old) are rejected 100% of the time, prompting re-login
- **SC-007**: Logout functionality successfully clears authentication state, preventing access to protected resources in 100% of cases
- **SC-008**: 90% of users successfully complete their first login attempt with valid credentials
- **SC-009**: System supports at least 20 concurrent authenticated users without performance degradation (per MVP infrastructure constraints)
- **SC-010**: Password validation catches 100% of passwords that don't meet minimum requirements (8 chars, letter + number)
- **SC-011**: Zero plain-text passwords are logged or exposed in error messages or responses
- **SC-012**: Users remain logged in for the full 24-hour token validity period without requiring re-authentication (assuming continuous or intermittent system use)

## Assumptions

1. **Whitelist Storage**: Email whitelist will be stored as an environment variable containing a comma-separated list of approved email addresses (e.g., ADMIN_WHITELIST="admin1@example.com,admin2@example.com")
2. **Password Complexity**: Minimum requirements are 8 characters with at least one letter and one number; additional complexity rules (special characters, uppercase) deferred to future
3. **Concurrent Sessions**: Same user can be logged in from multiple devices simultaneously with separate tokens
4. **Account Lockout**: Not implemented in MVP; deferred to future security enhancements
5. **Token Refresh**: Not implemented in MVP; users must re-login after 24 hours
6. **Token Storage**: Client-side token storage mechanism (localStorage vs httpOnly cookies) is an implementation decision
7. **Email Case Sensitivity**: Email addresses are normalized to lowercase for storage and comparison
8. **Initial Whitelist Population**: At least one admin email address will be pre-configured in the whitelist before system deployment to enable bootstrap
9. **Network Security**: HTTPS will be enforced in production deployment (implementation detail handled by infrastructure)
10. **Brute Force Protection**: Not implemented in MVP; rate limiting and account lockout deferred to future

## Dependencies

- System infrastructure must support secure HTTPS connections in production (handled by AWS/Vercel deployment)
- Email whitelist must be populated with at least one admin email before initial deployment
- Password hashing library must be available in the chosen backend technology stack
- JWT library must be available for token generation and validation

## Security Considerations

- Passwords must never be stored in plain text or reversible encryption
- Failed login attempts should not reveal whether email exists in system (generic error messages)
- JWT secret key must be kept secure and not committed to version control
- Token signature must be validated on every protected resource access
- HTTPS must be enforced in production to prevent token interception
- User input must be sanitized to prevent injection attacks
