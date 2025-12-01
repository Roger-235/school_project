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
 */
export const MAP_CONFIG = {
  center: TAIWAN_CENTER,
  zoom: DEFAULT_ZOOM,
  minZoom: 6,
  maxZoom: 12,
  scrollWheelZoom: true,
  doubleClickZoom: true,
  dragging: true,
  zoomControl: true,
};

/**
 * County color based on data availability
 */
export const COUNTY_COLORS = {
  hasData: '#22c55e',      // Green for counties with data
  noData: '#9ca3af',        // Gray for counties without data
  border: '#ffffff',        // White border
  hoverOpacity: 0.8,        // Opacity on hover
  defaultOpacity: 0.7,      // Default opacity
};

/**
 * Style function for GeoJSON counties
 */
export function getCountyStyle(hasData: boolean) {
  return {
    fillColor: hasData ? COUNTY_COLORS.hasData : COUNTY_COLORS.noData,
    weight: 1,
    opacity: 1,
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
    weight: 2,
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
