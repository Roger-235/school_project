/**
 * CountyPopup Component
 * Displays county statistics when user clicks on a county
 * Feature: 002-map-visualization (User Story 2)
 * Tasks: T038, T042, T043, T044
 */

'use client';

import { useEffect, useRef } from 'react';
import { useCountyStats } from '../../hooks/useCountyStats';

interface CountyPopupProps {
  countyName: string;
  position: { x: number; y: number };
  onClose: () => void;
}

export default function CountyPopup({ countyName, position, onClose }: CountyPopupProps) {
  const popupRef = useRef<HTMLDivElement>(null);
  const { data, isLoading, error } = useCountyStats(countyName);

  // T045: Close popup on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (popupRef.current && !popupRef.current.contains(event.target as Node)) {
        onClose();
      }
    }

    // Delay adding listener to prevent immediate close
    const timer = setTimeout(() => {
      document.addEventListener('mousedown', handleClickOutside);
    }, 100);

    return () => {
      clearTimeout(timer);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose]);

  // T045: Close popup on Escape key
  useEffect(() => {
    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        onClose();
      }
    }

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  // Calculate position to keep popup within viewport
  const popupStyle: React.CSSProperties = {
    position: 'fixed',
    left: `${Math.min(position.x, window.innerWidth - 280)}px`,
    top: `${Math.min(position.y, window.innerHeight - 200)}px`,
    zIndex: 1000,
  };

  return (
    <div
      ref={popupRef}
      className="county-popup"
      style={popupStyle}
    >
      {/* Header with county name and close button */}
      <div className="popup-header">
        <h3 className="popup-title">{countyName}</h3>
        <button
          onClick={onClose}
          className="popup-close-btn"
          aria-label="關閉"
        >
          ✕
        </button>
      </div>

      {/* Content */}
      <div className="popup-content">
        {/* T044: Loading state */}
        {isLoading && (
          <div className="popup-loading">
            <div className="loading-spinner" />
            <span>載入中...</span>
          </div>
        )}

        {/* Error state */}
        {error && !isLoading && (
          <div className="popup-error">
            <span>無法載入資料</span>
          </div>
        )}

        {/* T042 & T043: Display statistics or "No data available" */}
        {!isLoading && !error && data && (
          <>
            {(data as any).data?.has_data ? (
              <div className="popup-stats">
                <div className="stat-item">
                  <span className="stat-label">學校數</span>
                  <span className="stat-value">{(data as any).data.school_count}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">學童總數</span>
                  <span className="stat-value">{(data as any).data.student_count.toLocaleString()}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">運動記錄數</span>
                  <span className="stat-value">{(data as any).data.record_count?.toLocaleString() || 0}</span>
                </div>
              </div>
            ) : (
              <div className="popup-no-data">
                <span className="no-data-icon">📭</span>
                <span>尚無資料</span>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
