package config

import (
	"context"
	"fmt"
	"os"
	"time"

	"github.com/go-redis/redis/v8"
)

var (
	// RedisClient is the global Redis client instance
	RedisClient *redis.Client
	ctx         = context.Background()
)

// RedisAvailable indicates whether Redis connection is available
var RedisAvailable bool

// InitRedis initializes the Redis client with connection pooling
// Returns nil even if Redis is unavailable (caching will be disabled)
func InitRedis() error {
	redisURL := os.Getenv("REDIS_URL")
	if redisURL == "" {
		redisURL = "localhost:6379"
	}

	redisPassword := os.Getenv("REDIS_PASSWORD")

	RedisClient = redis.NewClient(&redis.Options{
		Addr:         redisURL,
		Password:     redisPassword,
		DB:           0, // use default DB
		PoolSize:     10,
		MinIdleConns: 5,
		DialTimeout:  5 * time.Second,
		ReadTimeout:  3 * time.Second,
		WriteTimeout: 3 * time.Second,
		PoolTimeout:  4 * time.Second,
	})

	// Test connection
	_, err := RedisClient.Ping(ctx).Result()
	if err != nil {
		fmt.Printf("⚠ Warning: Redis not available (%v) - caching disabled\n", err)
		RedisClient = nil
		RedisAvailable = false
		return nil // Don't fail, just disable caching
	}

	fmt.Println("✓ Connected to Redis successfully")
	RedisAvailable = true
	return nil
}

// CloseRedis closes the Redis connection
func CloseRedis() error {
	if RedisClient != nil {
		return RedisClient.Close()
	}
	return nil
}

// GetRedisClient returns the global Redis client instance
func GetRedisClient() *redis.Client {
	return RedisClient
}
