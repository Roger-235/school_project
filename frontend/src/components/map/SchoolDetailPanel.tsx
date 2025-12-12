/**
 * SchoolDetailPanel - Slide-in panel showing school details and students
 * Feature: 006-school-map-markers
 */

'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useSchool } from '../../hooks/useSchools';
import type { SchoolDetailPanelProps } from '../../types/schoolMap';

export default function SchoolDetailPanel({
  schoolId,
  isOpen,
  onClose,
}: SchoolDetailPanelProps) {
  const { data, isLoading, error } = useSchool(schoolId);

  // Handle escape key to close panel
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  // Prevent body scroll when panel is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const school = data?.data?.school;

  return (
    <>
      {/* Overlay */}
      <div
        className={`school-detail-panel-overlay ${isOpen ? 'open' : ''}`}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Panel */}
      <div className={`school-detail-panel ${isOpen ? 'open' : ''}`}>
        {/* Header */}
        <div className="panel-header">
          <h2>{school?.name || '學校詳情'}</h2>
          <button
            className="panel-close-btn"
            onClick={onClose}
            aria-label="關閉面板"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
              width={20}
              height={20}
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="panel-content">
          {/* Loading state */}
          {isLoading && (
            <div className="panel-loading">
              <div className="loading-spinner" />
              <p>載入學校資料中...</p>
            </div>
          )}

          {/* Error state */}
          {error && (
            <div className="panel-error">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                width={48}
                height={48}
              >
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              <p>無法載入學校資料</p>
            </div>
          )}

          {/* School details */}
          {school && !isLoading && !error && (
            <>
              {/* Basic Info Section */}
              <div className="school-info-section">
                <h3>學校資訊</h3>
                <div className="info-item">
                  <span className="info-label">縣市</span>
                  <span className="info-value">{school.county_name}</span>
                </div>
                {school.address && (
                  <div className="info-item">
                    <span className="info-label">地址</span>
                    <span className="info-value">{school.address}</span>
                  </div>
                )}
                {school.phone && (
                  <div className="info-item">
                    <span className="info-label">電話</span>
                    <span className="info-value">{school.phone}</span>
                  </div>
                )}
                <div className="info-item">
                  <span className="info-label">學生人數</span>
                  <span className="info-value" style={{ color: '#22c55e' }}>
                    {school.student_count ?? school.students?.length ?? 0} 人
                  </span>
                </div>
              </div>

              {/* Student List Section */}
              <div className="school-info-section">
                <h3>學生名單 ({school.students?.length ?? 0})</h3>

                {school.students && school.students.length > 0 ? (
                  <div className="student-list">
                    <div className="student-list-header">
                      <span className="student-col-name">姓名</span>
                      <span className="student-col-grade">年級</span>
                      <span className="student-col-class">班級</span>
                      <span className="student-col-gender">性別</span>
                    </div>
                    {school.students.slice(0, 20).map((student) => (
                      <Link
                        key={student.id}
                        href={`/students/${student.id}`}
                        className="student-list-item"
                        style={{ textDecoration: 'none' }}
                      >
                        <span className="student-col-name">{student.name}</span>
                        <span className="student-col-grade">{student.grade}</span>
                        <span className="student-col-class">{student.class || '-'}</span>
                        <span className="student-col-gender">
                          {student.gender === 'male' ? '男' : '女'}
                        </span>
                      </Link>
                    ))}
                    {school.students.length > 20 && (
                      <p style={{
                        textAlign: 'center',
                        color: '#6b7280',
                        fontSize: '13px',
                        padding: '12px',
                        margin: 0
                      }}>
                        還有 {school.students.length - 20} 位學生...
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="student-list-empty">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={1.5}
                    >
                      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                      <circle cx="9" cy="7" r="4" />
                      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                    </svg>
                    <p>尚無學生資料</p>
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* Action buttons */}
        {school && !isLoading && !error && (
          <div className="panel-actions">
            <Link
              href={`/schools/${school.id}`}
              className="panel-action-btn panel-action-btn-primary"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                width={18}
                height={18}
              >
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
              查看學校詳情
            </Link>
            <Link
              href={`/students/new?school_id=${school.id}`}
              className="panel-action-btn panel-action-btn-secondary"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                width={18}
                height={18}
              >
                <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="8.5" cy="7" r="4" />
                <line x1="20" y1="8" x2="20" y2="14" />
                <line x1="23" y1="11" x2="17" y2="11" />
              </svg>
              新增學生
            </Link>
          </div>
        )}
      </div>
    </>
  );
}
