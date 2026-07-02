/**
 * SchoolMarkerLayer - Renders school markers with clustering
 * Feature: 006-school-map-markers
 * Uses leaflet.markercluster for grouping nearby schools
 */

'use client';

import { useEffect, useRef } from 'react';
import type { Map as LeafletMap } from 'leaflet';
import type { SchoolMapData } from '../../types/schoolMap';
import type { SchoolChampion } from '../../types/statistics';

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
  champions?: SchoolChampion[];
}

// Returns upload status color and label based on last_records_uploaded_at
function getUploadStatus(lastUploadedAt: string | null | undefined): {
  color: string;
  label: string;
} {
  if (!lastUploadedAt) {
    return { color: '#9ca3af', label: '尚未上傳成績' };
  }
  const diffDays = (Date.now() - new Date(lastUploadedAt).getTime()) / (1000 * 60 * 60 * 24);
  if (diffDays <= 30) {
    return { color: '#22c55e', label: `最後上傳：${new Date(lastUploadedAt).toLocaleDateString('zh-TW')}` };
  } else if (diffDays <= 90) {
    return { color: '#eab308', label: `最後上傳：${new Date(lastUploadedAt).toLocaleDateString('zh-TW')}` };
  } else {
    return { color: '#f97316', label: `最後上傳：${new Date(lastUploadedAt).toLocaleDateString('zh-TW')}` };
  }
}

export default function SchoolMarkerLayer({
  map,
  schools,
  onSchoolClick,
  champions = [],
}: SchoolMarkerLayerProps) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const clusterGroupRef = useRef<any>(null);

  // 用穩定字串表示冠軍學校 ID，避免陣列參照每次不同造成無限重跑
  const championKey = champions.map(c => c.school_id).sort().join(',');

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

        // 建立冠軍學校 ID → 冠軍項目的對應表
        const championMap = new Map<number, SchoolChampion[]>();
        for (const c of champions) {
          if (!championMap.has(c.school_id)) championMap.set(c.school_id, []);
          championMap.get(c.school_id)!.push(c);
        }

        // Helper to create a color-coded school icon
        const createSchoolIcon = (color: string) => L.divIcon({
          html: `
            <div class="school-marker" style="color: ${color};">
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

        // 冠軍學校：金色學校圖標 + 右上角小星星徽章
        const createChampionSchoolIcon = () => L.divIcon({
          html: `
            <div style="position: relative; width: 36px; height: 36px;">
              <div style="
                position: absolute; inset: 0;
                border-radius: 50%;
                box-shadow: 0 0 0 3px #FFD700, 0 0 8px 2px rgba(255,215,0,0.5);
              "></div>
              <div class="school-marker" style="color: #D97706; position: absolute; inset: 0; display: flex; align-items: center; justify-content: center;">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="28" height="28">
                  <path d="M12 3L1 9l4 2.18v6L12 21l7-3.82v-6l2-1.09V17h2V9L12 3zm6.82 6L12 12.72 5.18 9 12 5.28 18.82 9zM17 15.99l-5 2.73-5-2.73v-3.72L12 15l5-2.73v3.72z"/>
                </svg>
              </div>
              <div style="
                position: absolute; top: -4px; right: -4px;
                width: 15px; height: 15px;
                background: #FFD700;
                border: 1.5px solid #D97706;
                border-radius: 50%;
                font-size: 9px;
                line-height: 12px;
                text-align: center;
              ">★</div>
            </div>
          `,
          className: 'champion-school-marker-icon',
          iconSize: [36, 36],
          iconAnchor: [18, 36],
          popupAnchor: [0, -36],
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
            const hasChampion = cluster.getAllChildMarkers().some((m: any) => m.options.isChampion);

            let size = 'small';
            let dimension = 30;
            if (count >= 10) { size = 'medium'; dimension = 40; }
            if (count >= 30) { size = 'large'; dimension = 50; }

            if (hasChampion) {
              return L.divIcon({
                html: `
                  <div style="position:relative; width:${dimension}px; height:${dimension}px;">
                    <div class="cluster-marker cluster-${size}" style="width:100%; height:100%;">
                      <span>${count}</span>
                    </div>
                    <div style="
                      position:absolute; top:-5px; right:-5px;
                      width:16px; height:16px;
                      background:#FFD700; border:1.5px solid #D97706;
                      border-radius:50%; font-size:10px; line-height:13px; text-align:center;
                      box-shadow: 0 1px 3px rgba(0,0,0,0.3);
                    ">★</div>
                  </div>`,
                className: 'school-cluster-icon',
                iconSize: [dimension, dimension],
              });
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
          const schoolChampions = championMap.get(school.id);
          const isChampion = !!schoolChampions && schoolChampions.length > 0;

          const { color, label } = getUploadStatus(school.last_records_uploaded_at);
          const icon = isChampion ? createChampionSchoolIcon() : createSchoolIcon(color);

          const marker = L.marker([school.latitude, school.longitude], {
            icon,
            title: school.name,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            isChampion,
          } as any);

          // Tooltip
          if (isChampion) {
            marker.bindTooltip(
              `<div class="school-tooltip">
                <strong>🏆 ${school.name}</strong><br/>
                <span style="color:#D97706; font-size:11px;">${schoolChampions!.length} 個項目冠軍</span><br/>
                <span class="text-gray-600">${school.county_name}</span>
              </div>`,
              { direction: 'top', offset: [0, -20], className: 'school-tooltip-container' }
            );
          } else {
            marker.bindTooltip(
              `<div class="school-tooltip">
                <strong>${school.name}</strong><br/>
                <span class="text-gray-600">${school.county_name}</span><br/>
                <span class="text-green-600">學生數: ${school.student_count}</span><br/>
                <span style="color: ${color};">${label}</span>
              </div>`,
              { direction: 'top', offset: [0, -16], className: 'school-tooltip-container' }
            );
          }

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
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map, schools, onSchoolClick, championKey]);

  return null;
}
