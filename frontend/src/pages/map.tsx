/**
 * Map Page - 台灣地圖視覺化主頁面
 * Feature: 002-map-visualization
 * User Story 1: View Taiwan Map Overview (Priority: P1) 🎯 MVP
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import dynamic from 'next/dynamic';
import Head from 'next/head';
import ProtectedRoute from '../components/auth/ProtectedRoute';
import { useAllCountyStats } from '../hooks/useCountyStats';
import { useMapState } from '../hooks/useMapState';
import CountyPopup from '../components/map/CountyPopup';

// 動態載入地圖元件（避免 SSR 問題）
const MapView = dynamic(() => import('../components/map/MapView'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-screen">
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

export default function MapPage() {
  const [isMobile, setIsMobile] = useState(false);
  const { data, isLoading, error, refetch } = useAllCountyStats();
  const { selectedCounty, selectCounty, clearSelection } = useMapState();

  // 處理縣市點擊事件
  const handleCountyClick = useCallback((countyName: string, position: { x: number; y: number }) => {
    selectCounty(countyName, position);
  }, [selectCounty]);

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
      <div className="desktop-only-message">
        <div className="text-center max-w-md">
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
    );
  }

  return (
    <ProtectedRoute>
      <Head>
        <title>台灣地圖視覺化 | ACAP</title>
        <meta name="description" content="全台原住民學童運動員培育系統 - 地圖視覺化" />
      </Head>

      <div className="map-container">
        {/* 載入狀態 */}
        {isLoading && (
          <div className="map-loading">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
              <p className="text-gray-700 font-medium">載入縣市統計資料中...</p>
            </div>
          </div>
        )}

        {/* 錯誤狀態 */}
        {error && (
          <div className="map-error">
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
        )}

        {/* 地圖視圖 */}
        {!isLoading && !error && data && (
          <>
            <MapView>
              {(map) => (
                <>
                  <CountyLayer
                    map={map}
                    countyStats={(data as any).data.counties}
                    onCountyClick={handleCountyClick}
                  />
                  <MapControls map={map} />
                </>
              )}
            </MapView>

            {/* 縣市統計彈窗 */}
            {selectedCounty && (
              <CountyPopup
                countyName={selectedCounty.name}
                position={selectedCounty.position}
                onClose={clearSelection}
              />
            )}
          </>
        )}

        {/* 圖例 */}
        {!isLoading && !error && (
          <div className="absolute bottom-8 right-8 bg-white p-4 rounded-lg shadow-lg z-[1000]">
            <h4 className="font-bold text-gray-900 mb-3">圖例</h4>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-green-500 rounded"></div>
                <span className="text-sm text-gray-700">有資料</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-gray-400 rounded"></div>
                <span className="text-sm text-gray-700">無資料</span>
              </div>
            </div>
            {data && (
              <div className="mt-3 pt-3 border-t border-gray-200">
                <p className="text-xs text-gray-500">
                  總計 {(data as any).data.total} 個縣市
                </p>
                <p className="text-xs text-gray-500">
                  {(data as any).data.counties.filter((c: any) => c.has_data).length} 個縣市有資料
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
