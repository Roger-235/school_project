/**
 * Map Page - 台灣地圖視覺化主頁面
 * Feature: 002-map-visualization
 * Updated: 004-navigation-enhancement - Use MainLayout with fullWidth mode
 * Updated: 006-school-map-markers - Add school markers with detail panel
 * User Story 1: View Taiwan Map Overview (Priority: P1)
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import dynamic from 'next/dynamic';
import Head from 'next/head';
import MainLayout from '../components/layout/MainLayout';
import { useAllCountyStats } from '../hooks/useCountyStats';
import { useMapState } from '../hooks/useMapState';
import { useSchoolsForMap, getSchoolsFromResponse } from '../hooks/useSchoolsForMap';
import CountyPopup from '../components/map/CountyPopup';
import type { SchoolMapData } from '../types/schoolMap';
import { SchoolChampion } from '@/types/statistics';
import { useSchoolChampions } from '../hooks/useStatistics';

// 動態載入地圖元件（避免 SSR 問題）
const MapView = dynamic(() => import('../components/map/MapView'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-full">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
        <p className="text-gray-600">載入地圖中...</p>
      </div>
    </div>
  ),
});

const CountyLayer = dynamic(() => import('../components/map/CountyLayer'), {
  ssr: false,
});

const MapControls = dynamic(() => import('../components/map/MapControls'), {
  ssr: false,
});

const SchoolMarkerLayer = dynamic(() => import('../components/map/SchoolMarkerLayer'), {
  ssr: false,
});

const SchoolDetailPanel = dynamic(() => import('../components/map/SchoolDetailPanel'), {
  ssr: false,
});


const ChampionsList = dynamic(() => import('../components/map/ChampionsList'), {
  ssr: false,
});

const CountyComparisonPanel = dynamic(() => import('../components/map/CountyComparisonPanel'), {
  ssr: false,
});

export default function MapPage() {
  const [isMobile, setIsMobile] = useState(false);
  const { data, isLoading, error, refetch } = useAllCountyStats();
  const { selectedCounty, secondCounty, isCompareMode, selectCounty, clearSelection, clearComparison } = useMapState();

  // School markers state (Feature: 006-school-map-markers)
  const { data: schoolsData, isLoading: schoolsLoading } = useSchoolsForMap();
  const [selectedSchool, setSelectedSchool] = useState<SchoolMapData | null>(null);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [selectedSportTypeId, setSelectedSportTypeId] = useState<number | null>(null);

  // 冠軍學校相關狀態
  const { data: champions, isLoading: championsLoading } = useSchoolChampions();
  const [showChampions, setShowChampions] = useState(true);
  const [mapInstance, setMapInstance] = useState<any>(null);

  // 點擊冠軍時飛到該位置並打開學校面板
  const handleChampionClick = useCallback((champion: SchoolChampion) => {
    if (mapInstance) {
      mapInstance.flyTo([champion.latitude, champion.longitude], 15, {
        duration: 1.5,
      });
    }
    // 找到對應的學校並顯示詳情，同時傳遞運動項目 ID
    const school = getSchoolsFromResponse(schoolsData).find(s => s.id === champion.school_id);
    if (school) {
      setSelectedSchool(school);
      setSelectedSportTypeId(champion.sport_type_id);
      setIsPanelOpen(true);
      clearSelection();
    }
  }, [mapInstance, schoolsData, clearSelection]);

  // 處理縣市點擊事件
  const handleCountyClick = useCallback((countyName: string, position: { x: number; y: number }) => {
    selectCounty(countyName, position);
  }, [selectCounty]);

  // 處理學校標記點擊事件
  const handleSchoolClick = useCallback((school: SchoolMapData) => {
    setSelectedSchool(school);
    setSelectedSportTypeId(null); // 清除運動項目篩選
    setIsPanelOpen(true);
    // Close county popup when clicking a school
    clearSelection();
  }, [clearSelection]);

  // 關閉學校詳情面板
  const handleClosePanel = useCallback(() => {
    setIsPanelOpen(false);
    // Delay clearing selected school to allow animation
    setTimeout(() => {
      setSelectedSchool(null);
      setSelectedSportTypeId(null);
    }, 300);
  }, []);

  // 檢查是否為桌面裝置
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // 行動裝置提示訊息
  if (isMobile) {
    return (
      <MainLayout fullWidth showBreadcrumb={false}>
        <Head>
          <title>台灣地圖視覺化 | ACAP</title>
        </Head>
        <div className="flex items-center justify-center h-[calc(100vh-200px)]">
          <div className="text-center max-w-md px-4">
            <svg
              className="mx-auto h-16 w-16 text-gray-400 mb-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              此功能僅支援桌面裝置
            </h2>
            <p className="text-gray-600">
              地圖視覺化功能已針對桌面裝置優化。請使用解析度至少 1024x768 的桌面瀏覽器訪問。
            </p>
            <p className="text-sm text-gray-500 mt-4">
              行動裝置支援將於未來版本推出。
            </p>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout fullWidth showBreadcrumb={false}>
      <Head>
        <title>台灣地圖視覺化 | ACAP</title>
        <meta name="description" content="全台原住民學童運動員培育系統 - 地圖視覺化" />
      </Head>

      <div className="relative h-[calc(100vh-140px)]">
        {/* 🎯 在這裡加入冠軍榜單（第一個元素） */}
        {!championsLoading && champions && champions.length > 0 && (
          <div className="absolute left-4 top-4 h-[calc(100vh-180px)] z-[999]">
            <ChampionsList
              champions={champions}
              onChampionClick={handleChampionClick}
            />
          </div>
        )}

        {/* 載入狀態覆蓋層（不阻擋地圖渲染） */}
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-60 z-10 pointer-events-none">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
              <p className="text-gray-700 font-medium">載入縣市統計資料中...</p>
            </div>
          </div>
        )}

        {/* 錯誤狀態覆蓋層 */}
        {error && (
          <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-90 z-10">
            <div className="text-center">
              <svg
                className="mx-auto h-12 w-12 text-red-500 mb-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <h3 className="text-lg font-bold text-gray-900 mb-2">
                無法載入地圖資料
              </h3>
              <p className="text-gray-600 mb-4">
                {(error as any)?.error?.message || (error as any)?.message || '發生未知錯誤，請稍後再試。'}
              </p>
              <button
                onClick={() => refetch()}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
              >
                重試
              </button>
            </div>
          </div>
        )}

        {/* 地圖視圖（立即渲染，不等待 API 資料） */}
        <MapView>
          {(map) => {
            // 保存 map 實例以供其他地方使用
            if (!mapInstance) {
              setMapInstance(map);
            }

            return (
              <>
                {/* 縣市圖層 - 資料載入後才渲染 */}
                {data && (
                  <CountyLayer
                    map={map}
                    countyStats={(data as any).data.counties}
                    onCountyClick={handleCountyClick}
                  />
                )}

                {/* School markers，冠軍學校直接套用金色樣式 */}
                {!schoolsLoading && schoolsData && (
                  <SchoolMarkerLayer
                    map={map}
                    schools={getSchoolsFromResponse(schoolsData)}
                    onSchoolClick={handleSchoolClick}
                    champions={showChampions && !championsLoading ? (champions ?? []) : []}
                  />
                )}

                <MapControls map={map} />
              </>
            );
          }}
        </MapView>

        {/* 縣市統計彈窗（單選模式，非比較模式下顯示） */}
        {selectedCounty && !isCompareMode && (
          <CountyPopup
            countyName={selectedCounty.name}
            position={selectedCounty.position}
            onClose={clearSelection}
          />
        )}

        {/* 選擇第一個縣市後的提示 */}
        {selectedCounty && !isCompareMode && (
          <div className="absolute bottom-24 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-sm px-4 py-2 rounded-full shadow-lg z-[1001] pointer-events-none">
            已選擇 {selectedCounty.name}，點選另一個縣市進行比較
          </div>
        )}

        {/* 雙縣市比較面板 */}
        {isCompareMode && selectedCounty && secondCounty && (
          <CountyComparisonPanel
            county1={selectedCounty.name}
            county2={secondCounty.name}
            onClose={clearSelection}
          />
        )}

        {/* 學校詳情側邊面板 (Feature: 006-school-map-markers) */}
        <SchoolDetailPanel
          schoolId={selectedSchool?.id ?? null}
          isOpen={isPanelOpen}
          onClose={handleClosePanel}
          sportTypeId={selectedSportTypeId}
        />

        {/* 圖例 */}
        {!isLoading && !error && (
          <div className="absolute bottom-8 right-8 bg-white p-4 rounded-lg shadow-lg z-[1000]">
            <h4 className="font-bold text-gray-900 mb-3">圖例</h4>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-green-500 rounded"></div>
                <span className="text-sm text-gray-700">有資料縣市</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-gray-400 rounded"></div>
                <span className="text-sm text-gray-700">無資料縣市</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-green-600 rounded-full flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white" width="14" height="14">
                    <path d="M12 3L1 9l4 2.18v6L12 21l7-3.82v-6l2-1.09V17h2V9L12 3z"/>
                  </svg>
                </div>
                <span className="text-sm text-gray-700">學校位置</span>
              </div>
              {/* 新增冠軍標記說明 */}
              <div className="flex items-center gap-2">
                <div className="text-2xl">🏆</div>
                <span className="text-sm text-gray-700">冠軍學校</span>
              </div>
            </div>
            
            {/* 切換按鈕 */}
            <div className="mt-3 pt-3 border-t border-gray-200">
              <button
                onClick={() => setShowChampions(!showChampions)}
                className={`w-full px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  showChampions
                    ? 'bg-yellow-500 text-white hover:bg-yellow-600'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {showChampions ? '隱藏冠軍標記' : '顯示冠軍標記'}
              </button>
            </div>
            {data && (
              <div className="mt-3 pt-3 border-t border-gray-200">
                <p className="text-xs text-gray-500">
                  總計 {(data as any).data.total} 個縣市
                </p>
                <p className="text-xs text-gray-500">
                  {((data as any).data.counties || []).filter((c: any) => c.has_data).length} 個縣市有資料
                </p>
                {schoolsData && (
                  <p className="text-xs text-gray-500">
                    {getSchoolsFromResponse(schoolsData).length} 所學校
                  </p>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </MainLayout>
  );
}
