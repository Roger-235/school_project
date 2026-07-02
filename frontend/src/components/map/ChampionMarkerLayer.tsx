import { useEffect } from 'react';
import L from 'leaflet';
import 'leaflet.markercluster';
import { SchoolChampion } from '@/types/statistics';

// 擴展 L 類型以支援 MarkerClusterGroup
declare module 'leaflet' {
  interface MarkerClusterGroupOptions {
    showCoverageOnHover?: boolean;
    zoomToBoundsOnClick?: boolean;
    spiderfyOnMaxZoom?: boolean;
    maxClusterRadius?: number | ((zoom: number) => number);
    iconCreateFunction?: (cluster: MarkerCluster) => L.DivIcon | L.Icon<L.IconOptions>;
  }

  interface MarkerCluster extends L.Marker {
    getChildCount(): number;
  }

  namespace MarkerClusterGroup {
    interface MarkerClusterGroup extends L.LayerGroup {
      addLayer(layer: L.Layer): this;
      removeLayer(layer: L.Layer): this;
      clearLayers(): this;
    }
  }

  interface LeafletStatic {
    MarkerClusterGroup: new (options?: MarkerClusterGroupOptions) => L.LayerGroup & {
      addLayer(layer: L.Layer): any;
      removeLayer(layer: L.Layer): any;
      clearLayers(): any;
    };
  }
}

interface Props {
  map: L.Map;
  champions: SchoolChampion[];
  onSchoolClick?: (schoolId: number) => void;
}

export default function ChampionMarkerLayer({ map, champions, onSchoolClick }: Props) {
  useEffect(() => {
    if (!map || !champions || champions.length === 0) return;

    console.log('ChampionMarkerLayer: Rendering with', champions.length, 'champions');
    console.log('ChampionMarkerLayer: MarkerClusterGroup available:', !!L?.MarkerClusterGroup);

    // 檢查 MarkerClusterGroup 是否可用
    if (!L || !L.MarkerClusterGroup) {
      console.error('ChampionMarkerLayer: MarkerClusterGroup not available on window.L');
      return;
    }

    // 創建聚合圖層 - 使用與 SchoolMarkerLayer 相同的模式
    const clusterGroup = new (L as any).MarkerClusterGroup({
      showCoverageOnHover: false,
      zoomToBoundsOnClick: true,
      spiderfyOnMaxZoom: true,
      maxClusterRadius: 50,
      
      // 自訂金色聚合圖標
      iconCreateFunction: function(cluster: any) {
        const count = cluster.getChildCount();
        return L.divIcon({
          html: `
            <div style="
              background: linear-gradient(135deg, #FFD700 0%, #FFA500 100%);
              border: 3px solid #FF8C00;
              border-radius: 50%;
              width: 40px;
              height: 40px;
              display: flex;
              align-items: center;
              justify-content: center;
              font-weight: bold;
              color: white;
              font-size: 14px;
              box-shadow: 0 4px 8px rgba(255, 165, 0, 0.4);
            ">
              🏆${count}
            </div>
          `,
          className: 'champion-cluster',
          iconSize: [40, 40],
        });
      },
    });

    // 按學校分組
    const championsBySchool = champions.reduce((acc, champion) => {
      const key = champion.school_id;
      if (!acc[key]) {
        acc[key] = {
          school: champion,
          sports: [],
        };
      }
      acc[key].sports.push(champion);
      return acc;
    }, {} as Record<number, { school: SchoolChampion; sports: SchoolChampion[] }>);

    console.log('ChampionMarkerLayer: Creating markers for', Object.keys(championsBySchool).length, 'schools');

    // 建立專屬 pane，z-index 620 高於預設 markerPane (600)
    if (!map.getPane('championPane')) {
      map.createPane('championPane');
      const paneEl = map.getPane('championPane') as HTMLElement;
      if (paneEl) paneEl.style.zIndex = '620';
    }

    // 為每個冠軍學校創建標記
    Object.values(championsBySchool).forEach(({ school, sports }) => {
      // 創建金色冠軍圖標
      const championIcon = L.divIcon({
        html: `
          <div class="champion-marker-wrapper">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="12" cy="12" r="10" fill="#FFD700" stroke="#FFA500" stroke-width="2"/>
              <path d="M12 6L14 10L18 10.5L15 13.5L16 18L12 15.5L8 18L9 13.5L6 10.5L10 10L12 6Z" fill="#FFA500"/>
            </svg>
          </div>
        `,
        className: 'champion-marker',
        iconSize: [40, 40],
        iconAnchor: [20, 40],
        popupAnchor: [0, -40],
      });

      // 創建標記，使用自訂 championPane 確保永遠在學校標記上層
      const marker = L.marker([school.latitude, school.longitude], {
        icon: championIcon,
        pane: 'championPane',
        zIndexOffset: 1000,
      });

      // 創建彈窗內容
      const popupContent = `
        <div style="padding: 8px; min-width: 200px;">
          <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 12px;">
            <span style="font-size: 24px;">🏆</span>
            <div>
              <h3 style="font-weight: bold; font-size: 16px; margin: 0;">${school.school_name}</h3>
              <p style="font-size: 12px; color: #666; margin: 0;">${school.county_name}</p>
            </div>
          </div>
          
          <div style="border-top: 1px solid #e5e7eb; padding-top: 8px;">
            <p style="font-weight: 600; margin-bottom: 8px; font-size: 13px;">冠軍項目：</p>
            <div style="display: flex; flex-direction: column; gap: 4px;">
              ${sports.map(sport => `
                <div style="background: #fefce8; border-radius: 4px; padding: 4px 8px; font-size: 11px;">
                  <span style="font-weight: 500;">${sport.sport_type_name}</span>
                  <span style="color: #666; margin-left: 8px;">
                    平均 ${sport.average_value.toFixed(1)} ${sport.unit}
                  </span>
                  <span style="color: #999; margin-left: 4px;">
                    (${sport.student_count} 人)
                  </span>
                </div>
              `).join('')}
            </div>
          </div>
        </div>
      `;

      marker.bindPopup(popupContent, {
        maxWidth: 300,
        className: 'champion-popup',
      });

      marker.bindTooltip(
        `<div style="font-weight: 600;">🏆 ${school.school_name}</div>
         <div style="font-size: 11px; color: #666;">${sports.length} 個項目冠軍</div>`,
        {
          direction: 'top',
          offset: [0, -20],
          opacity: 0.9,
        }
      );

      if (onSchoolClick) {
        marker.on('click', () => {
          onSchoolClick(school.school_id);
        });
      }

      // 加入聚合圖層
      clusterGroup.addLayer(marker);
    });

    // 將聚合圖層加入地圖
    map.addLayer(clusterGroup);
    console.log('ChampionMarkerLayer: Cluster group added to map');

    // 清理函數
    return () => {
      console.log('ChampionMarkerLayer: Cleaning up');
      clusterGroup.clearLayers();
      map.removeLayer(clusterGroup);
    };
  }, [map, champions, onSchoolClick]);

  return null;
}