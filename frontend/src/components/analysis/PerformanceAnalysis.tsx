/**
 * PerformanceAnalysis - 學生運動表現分析綜合元件
 * Feature: 003-student-sports-data (US4)
 */

'use client';

import { useMemo } from 'react';
import TrendChart from './TrendChart';
import InsufficientDataMessage from './InsufficientDataMessage';
import type { SportRecord } from '@/types/sports';

interface PerformanceAnalysisProps {
  records: SportRecord[];
  isLoading?: boolean;
}

interface GroupedRecords {
  sportTypeId: number;
  sportTypeName: string;
  category: string;
  unit: string;
  valueType: 'time' | 'distance' | 'count';
  records: SportRecord[];
}

const CATEGORY_LABELS: Record<string, string> = {
  fitness: '體適能',
  track_field: '田徑',
  ball_sports: '球類',
};

export default function PerformanceAnalysis({
  records,
  isLoading = false,
}: PerformanceAnalysisProps) {
  // Group records by sport type
  const groupedRecords = useMemo(() => {
    const groups: Record<number, GroupedRecords> = {};

    records.forEach((record) => {
      const sportType = record.sport_type;
      if (!sportType) return;

      if (!groups[sportType.id]) {
        groups[sportType.id] = {
          sportTypeId: sportType.id,
          sportTypeName: sportType.name,
          category: sportType.category,
          unit: sportType.default_unit,
          valueType: sportType.value_type as 'time' | 'distance' | 'count',
          records: [],
        };
      }
      groups[sportType.id].records.push(record);
    });

    // Sort by category and name
    return Object.values(groups).sort((a, b) => {
      if (a.category !== b.category) {
        return a.category.localeCompare(b.category);
      }
      return a.sportTypeName.localeCompare(b.sportTypeName);
    });
  }, [records]);

  // Group by category for display
  const groupedByCategory = useMemo(() => {
    const categories: Record<string, GroupedRecords[]> = {};

    groupedRecords.forEach((group) => {
      if (!categories[group.category]) {
        categories[group.category] = [];
      }
      categories[group.category].push(group);
    });

    return categories;
  }, [groupedRecords]);

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="h-8 bg-gray-200 rounded w-1/4"></div>
        <div className="h-64 bg-gray-200 rounded"></div>
        <div className="h-64 bg-gray-200 rounded"></div>
      </div>
    );
  }

  if (records.length === 0) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
        <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
          <svg
            className="w-8 h-8 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
            />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-gray-700 mb-2">
          尚無運動記錄
        </h3>
        <p className="text-gray-500">
          新增運動測驗記錄後，即可查看運動表現趨勢分析。
        </p>
      </div>
    );
  }

  // Check if we have any sport type with enough data for analysis
  const hasAnalyzableData = groupedRecords.some(
    (group) => group.records.length >= 2
  );

  if (!hasAnalyzableData) {
    return (
      <InsufficientDataMessage
        requiredCount={2}
        currentCount={Math.max(...groupedRecords.map((g) => g.records.length))}
      />
    );
  }

  return (
    <div className="space-y-8">
      {Object.entries(groupedByCategory).map(([category, groups]) => (
        <div key={category}>
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <span
              className={`w-3 h-3 rounded-full ${
                category === 'fitness'
                  ? 'bg-blue-500'
                  : category === 'track_field'
                  ? 'bg-green-500'
                  : 'bg-orange-500'
              }`}
            ></span>
            {CATEGORY_LABELS[category] || category}
          </h3>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {groups.map((group) =>
              group.records.length >= 2 ? (
                <TrendChart
                  key={group.sportTypeId}
                  records={group.records}
                  sportTypeName={group.sportTypeName}
                  unit={group.unit}
                  valueType={group.valueType}
                />
              ) : (
                <div
                  key={group.sportTypeId}
                  className="bg-white rounded-lg shadow p-4"
                >
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">
                    {group.sportTypeName}
                  </h4>
                  <p className="text-sm text-gray-500">
                    目前有 {group.records.length} 筆記錄，需要 2
                    筆以上才能顯示趨勢。
                  </p>
                  {group.records.length === 1 && (
                    <div className="mt-3 p-3 bg-gray-50 rounded">
                      <p className="text-sm text-gray-600">
                        最新記錄：{group.records[0].value} {group.unit}
                        <span className="text-gray-400 ml-2">
                          ({group.records[0].test_date})
                        </span>
                      </p>
                    </div>
                  )}
                </div>
              )
            )}
          </div>
        </div>
      ))}

      {/* Summary Statistics */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          整體統計
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <p className="text-2xl font-bold text-blue-600">{records.length}</p>
            <p className="text-sm text-blue-700">總記錄數</p>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <p className="text-2xl font-bold text-green-600">
              {groupedRecords.length}
            </p>
            <p className="text-sm text-green-700">測驗項目</p>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <p className="text-2xl font-bold text-purple-600">
              {groupedRecords.filter((g) => g.records.length >= 2).length}
            </p>
            <p className="text-sm text-purple-700">可分析項目</p>
          </div>
          <div className="text-center p-4 bg-amber-50 rounded-lg">
            <p className="text-2xl font-bold text-amber-600">
              {Object.keys(groupedByCategory).length}
            </p>
            <p className="text-sm text-amber-700">運動類別</p>
          </div>
        </div>
      </div>
    </div>
  );
}
