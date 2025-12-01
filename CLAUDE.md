# ACAP Development Guidelines

Auto-generated from all feature plans. Last updated: 2025-11-14

## Active Technologies

- Go 1.21+ (backend), TypeScript with Next.js 14 Pages Router (frontend) (001-user-auth)
- Leaflet.js 1.9.4 + React-Leaflet 4.2.1 for map visualization (002-map-visualization)
- Redis for county statistics caching with 15-minute TTL (002-map-visualization)
- React Query v5 for data fetching and client-side caching (002-map-visualization)

## Project Structure

```text
backend/
frontend/
tests/
```

## Commands

npm test; npm run lint

## Code Style

Go 1.21+ (backend), TypeScript with Next.js 14 Pages Router (frontend): Follow standard conventions

## Recent Changes

- 001-user-auth: Added Go 1.21+ (backend), TypeScript with Next.js 14 Pages Router (frontend)
- 002-map-visualization: Added Leaflet.js map with Taiwan counties GeoJSON, county statistics API with Redis caching

<!-- MANUAL ADDITIONS START -->
<!-- MANUAL ADDITIONS END -->
