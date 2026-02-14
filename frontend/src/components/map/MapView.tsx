/**
 * MapView - Main Leaflet map container component
 * Feature: 002-map-visualization
 * Note: Uses dynamic import with ssr: false to avoid Next.js SSR issues with Leaflet
 */

'use client';

import { useEffect, useRef, useState } from 'react';
import type { Map as LeafletMap } from 'leaflet';
import { MAP_CONFIG, OSM_TILE_LAYER } from '../../lib/leaflet-utils';

interface MapViewProps {
  children?: (map: LeafletMap) => React.ReactNode;
}

export default function MapView({ children }: MapViewProps) {
  const [map, setMap] = useState<LeafletMap | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === 'undefined' || !containerRef.current) {
      return;
    }

    // Dynamic import of Leaflet to avoid SSR issues
    import('leaflet').then((L) => {
      if (!containerRef.current || map) {
        return;
      }

      // Initialize map
      const leafletMap = L.map(containerRef.current, MAP_CONFIG);

      // Add tile layer
      L.tileLayer(OSM_TILE_LAYER.url, {
        attribution: OSM_TILE_LAYER.attribution,
      }).addTo(leafletMap);

      setMap(leafletMap);
    }).catch(error => {
      console.error('MapView: Error loading Leaflet:', error);
    });

    return () => {
      if (map) {
        map.remove();
        setMap(null);
      }
    };
  }, []);

  return (
    <div className="relative w-full h-full">
      <div
        ref={containerRef}
        className="w-full h-full"
        style={{ minHeight: '600px' }}
      />
      {map && children?.(map)}
    </div>
  );
}
