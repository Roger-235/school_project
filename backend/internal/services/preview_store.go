package services

import (
	"sync"
	"time"

	"github.com/wei979/ICACP/backend/internal/models"
)

// PreviewStore manages in-memory storage of import previews with TTL
type PreviewStore struct {
	mu       sync.RWMutex
	previews map[string]*models.ImportPreview
	ttl      time.Duration
}

// NewPreviewStore creates a new PreviewStore with the specified TTL
func NewPreviewStore(ttl time.Duration) *PreviewStore {
	store := &PreviewStore{
		previews: make(map[string]*models.ImportPreview),
		ttl:      ttl,
	}
	// Start cleanup goroutine
	go store.cleanupExpired()
	return store
}

// Set stores a preview with automatic expiration
func (s *PreviewStore) Set(id string, preview *models.ImportPreview) {
	s.mu.Lock()
	defer s.mu.Unlock()

	preview.CreatedAt = time.Now()
	preview.ExpiresAt = time.Now().Add(s.ttl)
	s.previews[id] = preview
}

// Get retrieves a preview by ID, returns nil if not found or expired
func (s *PreviewStore) Get(id string) *models.ImportPreview {
	s.mu.RLock()
	defer s.mu.RUnlock()

	preview, exists := s.previews[id]
	if !exists {
		return nil
	}

	// Check if expired
	if time.Now().After(preview.ExpiresAt) {
		return nil
	}

	return preview
}

// Delete removes a preview by ID
func (s *PreviewStore) Delete(id string) bool {
	s.mu.Lock()
	defer s.mu.Unlock()

	if _, exists := s.previews[id]; exists {
		delete(s.previews, id)
		return true
	}
	return false
}

// MarkExecuted marks a preview as executed to prevent re-execution
func (s *PreviewStore) MarkExecuted(id string) bool {
	s.mu.Lock()
	defer s.mu.Unlock()

	preview, exists := s.previews[id]
	if !exists || time.Now().After(preview.ExpiresAt) {
		return false
	}

	preview.Executed = true
	return true
}

// IsExecuted checks if a preview has already been executed
func (s *PreviewStore) IsExecuted(id string) bool {
	s.mu.RLock()
	defer s.mu.RUnlock()

	preview, exists := s.previews[id]
	if !exists {
		return false
	}

	return preview.Executed
}

// cleanupExpired periodically removes expired previews
func (s *PreviewStore) cleanupExpired() {
	ticker := time.NewTicker(5 * time.Minute)
	defer ticker.Stop()

	for range ticker.C {
		s.mu.Lock()
		now := time.Now()
		for id, preview := range s.previews {
			if now.After(preview.ExpiresAt) {
				delete(s.previews, id)
			}
		}
		s.mu.Unlock()
	}
}

// Count returns the number of active previews (for monitoring)
func (s *PreviewStore) Count() int {
	s.mu.RLock()
	defer s.mu.RUnlock()

	count := 0
	now := time.Now()
	for _, preview := range s.previews {
		if !now.After(preview.ExpiresAt) {
			count++
		}
	}
	return count
}
