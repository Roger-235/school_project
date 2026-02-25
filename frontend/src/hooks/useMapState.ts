/**
 * Map State Hook
 * Manages selected county state and popup visibility
 * Feature: 002-map-visualization (User Story 2)
 * Task: T040
 * Updated: Support dual county selection for county comparison
 */

import { useState, useCallback } from 'react';

export interface SelectedCounty {
  name: string;
  position: { x: number; y: number };
}

export interface MapState {
  selectedCounty: SelectedCounty | null;
  secondCounty: SelectedCounty | null;
  isCompareMode: boolean;
  selectCounty: (name: string, position: { x: number; y: number }) => void;
  clearSelection: () => void;
  clearComparison: () => void;
}

/**
 * Hook to manage map state including selected county (up to 2 for comparison)
 */
export function useMapState(): MapState {
  const [selectedCounty, setSelectedCounty] = useState<SelectedCounty | null>(null);
  const [secondCounty, setSecondCounty] = useState<SelectedCounty | null>(null);

  // Clicking a county:
  // - If nothing selected → select as first county
  // - If one county selected → select as second (triggers comparison)
  // - If comparing → replace first county, clear second
  const selectCounty = useCallback((name: string, position: { x: number; y: number }) => {
    setSelectedCounty(prev => {
      if (!prev) {
        // No county selected yet
        setSecondCounty(null);
        return { name, position };
      }
      if (prev.name === name) {
        // Clicked the same county → close popup
        setSecondCounty(null);
        return null;
      }
      // Already have a first county → set second to trigger comparison
      setSecondCounty({ name, position });
      return prev;
    });
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedCounty(null);
    setSecondCounty(null);
  }, []);

  const clearComparison = useCallback(() => {
    setSecondCounty(null);
  }, []);

  return {
    selectedCounty,
    secondCounty,
    isCompareMode: !!selectedCounty && !!secondCounty,
    selectCounty,
    clearSelection,
    clearComparison,
  };
}
