/**
 * Leaflet map utilities for Taiwan map visualization
 * Feature: 002-map-visualization
 */

import type { Map as LeafletMap, LatLngExpression } from 'leaflet';

/**
 * Taiwan center coordinates (approximately central Taiwan)
 */
export const TAIWAN_CENTER: LatLngExpression = [23.5, 121];

/**
 * Default zoom level for Taiwan-wide view
 */
export const DEFAULT_ZOOM = 7;

/**
 * Map configuration options
 * Updated: Increased maxZoom to 16 for better school marker visibility
 */
export const MAP_CONFIG = {
  center: TAIWAN_CENTER,
  zoom: DEFAULT_ZOOM,
  minZoom: 6,
  maxZoom: 16,              // Increased from 12 to allow closer zoom for school markers
  scrollWheelZoom: true,
  doubleClickZoom: true,
  dragging: true,
  zoomControl: true,
};

/**
 * County color based on data availability
 * Updated: Reduced opacity to allow underlying map features to show through
 */
export const COUNTY_COLORS = {
  hasData: '#22c55e',      // Green for counties with data
  noData: '#9ca3af',        // Gray for counties without data
  border: '#374151',        // Dark gray border for better visibility
  hoverOpacity: 0.75,       // Opacity on hover
  defaultOpacity: 0.60,     // Default opacity - opaque enough to stand out against gray background
};

/**
 * Style function for GeoJSON counties
 */
export function getCountyStyle(hasData: boolean) {
  return {
    fillColor: hasData ? COUNTY_COLORS.hasData : COUNTY_COLORS.noData,
    weight: 2,              // Increased from 1 for better visibility
    opacity: 0.8,           // Border opacity
    color: COUNTY_COLORS.border,
    fillOpacity: COUNTY_COLORS.defaultOpacity,
  };
}

/**
 * Hover style for counties
 */
export function getCountyHoverStyle() {
  return {
    fillOpacity: COUNTY_COLORS.hoverOpacity,
    weight: 3,              // Thicker border on hover
    opacity: 1,             // Full border opacity on hover
  };
}

/**
 * Reset map to Taiwan-wide view
 */
export function resetMapView(map: LeafletMap) {
  map.setView(TAIWAN_CENTER, DEFAULT_ZOOM);
}

/**
 * Zoom in on the map
 */
export function zoomIn(map: LeafletMap) {
  map.zoomIn();
}

/**
 * Zoom out on the map
 */
export function zoomOut(map: LeafletMap) {
  map.zoomOut();
}

/**
 * Get OSM tile layer URL
 */
export const OSM_TILE_LAYER = {
  url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
};

/**
 * Normalize Taiwan county names
 * TopoJSON uses simplified "台" while database uses traditional "臺"
 * This function converts simplified to traditional for consistent matching
 */
export function normalizeCountyName(name: string): string {
  if (!name) return name;
  // Replace simplified 台 with traditional 臺
  return name
    .replace(/^台北市$/, '臺北市')
    .replace(/^台中市$/, '臺中市')
    .replace(/^台南市$/, '臺南市')
    .replace(/^台東縣$/, '臺東縣');
}

/**
 * Convert traditional county name back to simplified for display
 * (if needed for TopoJSON tooltip display)
 */
export function displayCountyName(name: string): string {
  if (!name) return name;
  // Keep original name for display (TopoJSON uses simplified)
  return name;
}
