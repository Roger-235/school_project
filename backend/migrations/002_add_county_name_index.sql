-- Migration: Add index on schools.county_name for map visualization feature
-- Feature: 002-map-visualization
-- Date: 2025-11-15
-- Purpose: Optimize GROUP BY queries for county statistics aggregation

-- Create index on county_name if it doesn't exist
-- This enables fast aggregation queries (GROUP BY county_name)
CREATE INDEX IF NOT EXISTS idx_county_name ON schools(county_name);

-- Verify index was created
SHOW INDEX FROM schools WHERE Key_name = 'idx_county_name';
