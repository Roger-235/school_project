/**
 * CountyLayer - GeoJSON 圖層元件，負責渲染台灣縣市邊界與顏色
 * Feature: 002-map-visualization
 */

'use client';

import { useEffect, useState } from 'react';
import type { Map as LeafletMap, GeoJSON as LeafletGeoJSON } from 'leaflet';
import type { CountyStatistics } from '../../types/county';
import { getCountyStyle, getCountyHoverStyle } from '../../lib/leaflet-utils';

interface CountyLayerProps {
  map: LeafletMap;
  countyStats: CountyStatistics[];
  onCountyClick?: (countyName: string, position: { x: number; y: number }) => void;
}

export default function CountyLayer({ map, countyStats, onCountyClick }: CountyLayerProps) {
  const [geoJsonLayer, setGeoJsonLayer] = useState<LeafletGeoJSON | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined' || !map) {
      return;
    }

    // 動態載入 Leaflet 和 GeoJSON 資料
    Promise.all([
      import('leaflet'),
      fetch('/data/taiwan-counties.geojson').then(res => res.json())
    ]).then(([L, geoJsonData]) => {
      // 清除舊的圖層
      if (geoJsonLayer) {
        map.removeLayer(geoJsonLayer);
      }

      // 建立縣市統計資料的對照表
      const statsMap = new Map<string, CountyStatistics>();
      countyStats.forEach(stat => {
        statsMap.set(stat.county_name, stat);
      });

      // 建立 GeoJSON 圖層
      const layer = L.geoJSON(geoJsonData, {
        style: (feature) => {
          const countyName = feature?.properties?.COUNTYNAME;
          const stats = statsMap.get(countyName);
          const hasData = stats?.has_data ?? false;
          return getCountyStyle(hasData);
        },
        onEachFeature: (feature, layer) => {
          const countyName = feature.properties?.COUNTYNAME;
          const stats = statsMap.get(countyName);

          // 滑鼠移入效果
          layer.on('mouseover', function (this: any) {
            this.setStyle(getCountyHoverStyle());
          });

          // 滑鼠移出效果
          layer.on('mouseout', function (this: any) {
            const hasData = stats?.has_data ?? false;
            this.setStyle(getCountyStyle(hasData));
          });

          // 縣市名稱標籤（使用 tooltip 永久顯示）
          if (countyName) {
            layer.bindTooltip(countyName, {
              permanent: true,
              direction: 'center',
              className: 'county-label',
            });
          }

          // 點擊事件 - 顯示縣市統計彈窗
          layer.on('click', (e: any) => {
            if (onCountyClick && countyName) {
              const position = {
                x: e.originalEvent?.clientX || e.containerPoint?.x || 0,
                y: e.originalEvent?.clientY || e.containerPoint?.y || 0,
              };
              onCountyClick(countyName, position);
            }
          });
        },
      });

      layer.addTo(map);
      setGeoJsonLayer(layer);
    }).catch(error => {
      console.error('CountyLayer: Error loading GeoJSON:', error);
    });

    // Cleanup
    return () => {
      if (geoJsonLayer) {
        map.removeLayer(geoJsonLayer);
      }
    };
  }, [map, countyStats, onCountyClick]);

  return null; // 此元件不渲染 DOM，只操作 Leaflet 圖層
}
