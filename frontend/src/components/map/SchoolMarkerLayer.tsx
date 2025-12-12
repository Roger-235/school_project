/**
 * SchoolMarkerLayer - Renders school markers with clustering
 * Feature: 006-school-map-markers
 * Uses leaflet.markercluster for grouping nearby schools
 */

'use client';

import { useEffect, useRef } from 'react';
import type { Map as LeafletMap } from 'leaflet';
import type { SchoolMapData } from '../../types/schoolMap';

// Declare window.L for TypeScript
declare global {
  interface Window {
    L: typeof import('leaflet') & {
      MarkerClusterGroup: new (options?: Record<string, unknown>) => unknown;
    };
  }
}

interface SchoolMarkerLayerProps {
  map: LeafletMap;
  schools: SchoolMapData[];
  onSchoolClick: (school: SchoolMapData) => void;
}

export default function SchoolMarkerLayer({
  map,
  schools,
  onSchoolClick,
}: SchoolMarkerLayerProps) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const clusterGroupRef = useRef<any>(null);

  useEffect(() => {
    if (!map || schools.length === 0) {
      return;
    }

    // Dynamic import to avoid SSR issues
    // leaflet.markercluster modifies the global window.L object
    const loadMarkers = async () => {
      try {
        // Import leaflet first (this sets window.L)
        await import('leaflet');
        // Import markercluster to extend window.L
        await import('leaflet.markercluster');

        // Use window.L which has the markerClusterGroup extension
        const L = window.L;

        console.log('SchoolMarkerLayer: Loaded leaflet and markercluster');
        console.log('SchoolMarkerLayer: Schools count:', schools.length);
        console.log('SchoolMarkerLayer: window.L available:', !!L);
        console.log('SchoolMarkerLayer: MarkerClusterGroup available:', !!L?.MarkerClusterGroup);

        if (!L || !L.MarkerClusterGroup) {
          console.error('SchoolMarkerLayer: MarkerClusterGroup not available on window.L');
          return;
        }

        // Remove existing cluster group if any
        if (clusterGroupRef.current) {
          map.removeLayer(clusterGroupRef.current);
          clusterGroupRef.current = null;
        }

        // Create custom school icon
        const schoolIcon = L.divIcon({
          html: `
            <div class="school-marker">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
                <path d="M12 3L1 9l4 2.18v6L12 21l7-3.82v-6l2-1.09V17h2V9L12 3zm6.82 6L12 12.72 5.18 9 12 5.28 18.82 9zM17 15.99l-5 2.73-5-2.73v-3.72L12 15l5-2.73v3.72z"/>
              </svg>
            </div>
          `,
          className: 'school-marker-icon',
          iconSize: [32, 32],
          iconAnchor: [16, 32],
          popupAnchor: [0, -32],
        });

        // Create marker cluster group with custom options using constructor
        // Updated: Improved settings for better cluster expansion
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const clusterGroup = new (L as any).MarkerClusterGroup({
          maxClusterRadius: 40,           // Reduced from 50 for tighter clustering
          spiderfyOnMaxZoom: true,        // Enable spiderfy at max zoom
          showCoverageOnHover: true,      // Show coverage area on hover
          zoomToBoundsOnClick: true,      // Zoom into cluster on click
          disableClusteringAtZoom: 12,    // Disable clustering at zoom 12 (was 14)
          spiderfyDistanceMultiplier: 1.5, // Increase spider leg distance
          singleMarkerMode: false,        // Don't show cluster for single markers
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          iconCreateFunction: (cluster: any) => {
            const count = cluster.getChildCount();
            let size = 'small';
            let dimension = 30;

            if (count >= 10) {
              size = 'medium';
              dimension = 40;
            }
            if (count >= 30) {
              size = 'large';
              dimension = 50;
            }

            return L.divIcon({
              html: `<div class="cluster-marker cluster-${size}"><span>${count}</span></div>`,
              className: 'school-cluster-icon',
              iconSize: [dimension, dimension],
            });
          },
        });

        // Add markers for each school
        schools.forEach((school) => {
          const marker = L.marker([school.latitude, school.longitude], {
            icon: schoolIcon,
            title: school.name,
          });

          // Create tooltip with school info
          marker.bindTooltip(
            `<div class="school-tooltip">
              <strong>${school.name}</strong><br/>
              <span class="text-gray-600">${school.county_name}</span><br/>
              <span class="text-green-600">學生數: ${school.student_count}</span>
            </div>`,
            {
              direction: 'top',
              offset: [0, -16],
              className: 'school-tooltip-container',
            }
          );

          // Handle click event
          marker.on('click', () => {
            onSchoolClick(school);
          });

          clusterGroup.addLayer(marker);
        });

        // Add cluster group to map
        map.addLayer(clusterGroup);
        clusterGroupRef.current = clusterGroup;

        console.log('SchoolMarkerLayer: Successfully added', schools.length, 'markers to cluster group');
      } catch (error) {
        console.error('SchoolMarkerLayer: Error loading dependencies:', error);
      }
    };

    loadMarkers();

    // Cleanup on unmount
    return () => {
      if (clusterGroupRef.current && map) {
        map.removeLayer(clusterGroupRef.current);
        clusterGroupRef.current = null;
      }
    };
  }, [map, schools, onSchoolClick]);

  return null;
}
