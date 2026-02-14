/**
 * MapControls Component
 * Provides zoom in/out and reset buttons for map navigation
 * Feature: 002-map-visualization (User Story 3)
 * Tasks: T047, T049, T050
 */

'use client';

import type { Map as LeafletMap } from 'leaflet';
import { zoomIn, zoomOut, resetMapView } from '../../lib/leaflet-utils';

interface MapControlsProps {
  map: LeafletMap;
}

export default function MapControls({ map }: MapControlsProps) {
  // Zoom in handler
  const handleZoomIn = () => {
    zoomIn(map);
  };

  // Zoom out handler
  const handleZoomOut = () => {
    zoomOut(map);
  };

  // Reset to Taiwan-wide view handler
  const handleReset = () => {
    resetMapView(map);
  };

  return (
    <div className="map-controls">
      {/* Zoom In Button */}
      <button
        onClick={handleZoomIn}
        className="map-control-btn"
        aria-label="放大"
        title="放大 (滾輪向上)"
      >
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 6v6m0 0v6m0-6h6m-6 0H6"
          />
        </svg>
      </button>

      {/* Zoom Out Button */}
      <button
        onClick={handleZoomOut}
        className="map-control-btn"
        aria-label="縮小"
        title="縮小 (滾輪向下)"
      >
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M20 12H4"
          />
        </svg>
      </button>

      {/* Divider */}
      <div className="map-control-divider" />

      {/* Reset Button */}
      <button
        onClick={handleReset}
        className="map-control-btn map-control-reset"
        aria-label="重置視圖"
        title="重置至台灣全景"
      >
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
          />
        </svg>
      </button>
    </div>
  );
}
