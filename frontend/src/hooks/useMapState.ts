/**
 * Map State Hook
 * Manages selected county state and popup visibility
 * Feature: 002-map-visualization (User Story 2)
 * Task: T040
 */

import { useState, useCallback } from 'react';

export interface SelectedCounty {
  name: string;
  position: { x: number; y: number };
}

export interface MapState {
  selectedCounty: SelectedCounty | null;
  selectCounty: (name: string, position: { x: number; y: number }) => void;
  clearSelection: () => void;
}

/**
 * Hook to manage map state including selected county
 */
export function useMapState(): MapState {
  const [selectedCounty, setSelectedCounty] = useState<SelectedCounty | null>(null);

  // Select a county (updates popup when clicking different county)
  const selectCounty = useCallback((name: string, position: { x: number; y: number }) => {
    setSelectedCounty({ name, position });
  }, []);

  // Clear selection (close popup)
  const clearSelection = useCallback(() => {
    setSelectedCounty(null);
  }, []);

  return {
    selectedCounty,
    selectCounty,
    clearSelection,
  };
}
