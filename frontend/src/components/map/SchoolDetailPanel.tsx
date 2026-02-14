/**
 * SchoolDetailPanel - Slide-in panel showing school details and students
 * Feature: 006-school-map-markers
 */

'use client';

import { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { useSchool } from '../../hooks/useSchools';
import { useSportRecords, useBulkStudentScores } from '../../hooks/useSportRecords';
import { useSportType } from '../../hooks/useSportTypes';
import type { SchoolDetailPanelProps } from '../../types/schoolMap';

// Component for expandable student row with sport records
function StudentRow({
  student,
  sportTypeId,
  scoreValue
}: {
  student: any;
  sportTypeId?: number | null;
  scoreValue?: number | null;
}) {
  const [isExpanded, setIsExpanded] = useState(false);

  // 始終獲取所有成績（用於顯示預覽）
  const { data: recordsData, isLoading: loadingRecords } = useSportRecords(
    student.id,
    1,
    100
  );

  const records = recordsData?.data?.records || [];

  // 預覽顯示最近兩筆成績
  const previewRecords = records.slice(0, 2);
  // 剩餘的成績（展開時顯示）
  const remainingRecords = records.slice(2);

  return (
    <div>
      {/* Student row */}
      <div
        className="student-list-item"
        style={{ cursor: 'pointer', position: 'relative' }}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <span className="student-col-name">{student.name}</span>
        <span className="student-col-grade">{student.grade}</span>
        <span className="student-col-class">{student.class || '-'}</span>
        <span className="student-col-gender">
          {student.gender === 'male' ? '男' : '女'}
        </span>

        {/* 如果有指定運動項目，顯示成績 */}
        {sportTypeId && (
          <span style={{
            marginLeft: 'auto',
            marginRight: '32px',
            fontWeight: 600,
            color: scoreValue !== null && scoreValue !== undefined ? '#22c55e' : '#9ca3af',
            fontSize: '14px',
          }}>
            {scoreValue !== null && scoreValue !== undefined
              ? scoreValue.toFixed(1)
              : '無記錄'
            }
          </span>
        )}

        <button
          style={{
            position: 'absolute',
            right: '8px',
            top: '50%',
            transform: 'translateY(-50%)',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '4px',
            display: 'flex',
            alignItems: 'center',
            color: '#6b7280',
          }}
          onClick={(e) => {
            e.stopPropagation();
            setIsExpanded(!isExpanded);
          }}
        >
          <svg
            width={16}
            height={16}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            style={{
              transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
              transition: 'transform 0.2s',
            }}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </button>
      </div>

      {/* Expanded sport records */}
      {isExpanded && (
        <div
          style={{
            background: '#f9fafb',
            padding: '12px',
            borderBottom: '1px solid #e5e7eb',
          }}
        >
          {loadingRecords ? (
            <div style={{ textAlign: 'center', color: '#6b7280', fontSize: '13px' }}>
              載入成績中...
            </div>
          ) : records.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {sportTypeId && (
                <div style={{ fontSize: '11px', color: '#6b7280', marginBottom: '4px', paddingLeft: '4px' }}>
                  所有運動項目成績：
                </div>
              )}
              {records.map((record: any) => (
                <div
                  key={record.id}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '8px 12px',
                    background: 'white',
                    borderRadius: '6px',
                    fontSize: '13px',
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 500, color: '#1f2937' }}>
                      {record.sport_type?.name || '未知項目'}
                    </div>
                    {record.test_date && (
                      <div style={{ fontSize: '11px', color: '#9ca3af', marginTop: '2px' }}>
                        {new Date(record.test_date).toLocaleDateString('zh-TW')}
                      </div>
                    )}
                  </div>
                  <div
                    style={{
                      fontWeight: 600,
                      color: '#22c55e',
                      fontSize: '15px',
                    }}
                  >
                    {record.value} {record.sport_type?.default_unit || ''}
                  </div>
                </div>
              ))}
              <Link
                href={`/students/${student.id}`}
                style={{
                  textAlign: 'center',
                  color: '#22c55e',
                  fontSize: '12px',
                  textDecoration: 'none',
                  marginTop: '4px',
                  padding: '4px',
                }}
              >
                查看完整資料 →
              </Link>
            </div>
          ) : (
            <div
              style={{
                textAlign: 'center',
                color: '#9ca3af',
                fontSize: '13px',
                padding: '8px',
              }}
            >
              尚無運動成績記錄
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function SchoolDetailPanel({
  schoolId,
  isOpen,
  onClose,
  sportTypeId,
}: SchoolDetailPanelProps) {
  const { data, isLoading, error } = useSchool(schoolId);

  const school = data?.data?.school;

  // 獲取運動項目的詳細信息（用於判斷排序方向）
  const { data: sportTypeData } = useSportType(sportTypeId || null);
  const sportType = sportTypeData?.data?.sport_type;

  // 批量獲取學生成績（當指定了運動項目時）
  const studentIds = useMemo(() => {
    return school?.students?.map((s: any) => s.id) || [];
  }, [school?.students]);

  const { data: bulkScores, isLoading: loadingScores } = useBulkStudentScores(
    studentIds,
    sportTypeId || null
  );

  // 根據批量獲取的成績對學生進行排序
  const sortedStudents = useMemo(() => {
    if (!school?.students) return [];
    if (!sportTypeId || !bulkScores) return school.students;

    // 創建成績映射
    const scoresMap = new Map(
      bulkScores.map(score => [score.student_id, score.value])
    );

    // 判斷排序方向：time 類型越小越好（ASC），其他類型越大越好（DESC）
    const isTimeType = sportType?.value_type === 'time';

    // 排序：有成績的在前，按成績排序；無成績的在後
    return [...school.students].sort((a: any, b: any) => {
      const scoreA = scoresMap.get(a.id);
      const scoreB = scoresMap.get(b.id);

      // 都沒成績，維持原順序
      if (scoreA === null && scoreB === null) return 0;
      if (scoreA === null || scoreA === undefined) return 1; // A 沒成績，排後面
      if (scoreB === null || scoreB === undefined) return -1; // B 沒成績，A 排前面

      // 都有成績，按數值排序
      // time 類型：越小越好（ASC）
      // 其他類型：越大越好（DESC）
      if (isTimeType) {
        return (scoreA as number) - (scoreB as number); // 小的在前
      } else {
        return (scoreB as number) - (scoreA as number); // 大的在前
      }
    });
  }, [school?.students, sportTypeId, bulkScores, sportType?.value_type]);

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
                <h3>學生名單 ({sortedStudents.length})</h3>
                {sportTypeId ? (
                  <p style={{ fontSize: '12px', color: '#22c55e', fontWeight: 600, marginTop: '-8px', marginBottom: '8px' }}>
                    ✓ 已按該項目成績排序
                  </p>
                ) : (
                  <p style={{ fontSize: '12px', color: '#6b7280', marginTop: '-8px', marginBottom: '8px' }}>
                    點擊學生查看運動成績
                  </p>
                )}

                {sortedStudents.length > 0 ? (
                  <div className="student-list">
                    <div className="student-list-header">
                      <span className="student-col-name">姓名</span>
                      <span className="student-col-grade">年級</span>
                      <span className="student-col-class">班級</span>
                      <span className="student-col-gender">性別</span>
                      {sportTypeId && <span style={{ marginLeft: 'auto', marginRight: '32px' }}>成績</span>}
                    </div>
                    {sortedStudents.slice(0, 20).map((student: any) => {
                      const studentScore = bulkScores?.find(s => s.student_id === student.id);
                      return (
                        <StudentRow
                          key={student.id}
                          student={student}
                          sportTypeId={sportTypeId}
                          scoreValue={studentScore?.value ?? null}
                        />
                      );
                    })}
                    {sortedStudents.length > 20 && (
                      <p style={{
                        textAlign: 'center',
                        color: '#6b7280',
                        fontSize: '13px',
                        padding: '12px',
                        margin: 0
                      }}>
                        還有 {sortedStudents.length - 20} 位學生...
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
