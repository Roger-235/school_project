/**
 * useStudentAnalysis Hook
 * Feature: 003-student-sports-data (US4)
 * Task: T083
 */

import { useQuery } from '@tanstack/react-query';

// Progress Analysis Types
export interface ProgressAnalysis {
  student_id: number;
  sport_type_id: number;
  sport_type_name: string;
  first_value: number;
  last_value: number;
  change: number;
  change_percent: number;
  is_improvement: boolean;
  record_count: number;
  value_type: 'time' | 'distance' | 'count';
  unit: string;
}

// School Ranking Types
export interface SchoolRanking {
  rank: number;
  student_id: number;
  student_name: string;
  grade: number;
  class: string;
  best_value: number;
  test_date: string;
}

export interface SchoolRankingResult {
  school_id: number;
  school_name: string;
  sport_type_id: number;
  sport_type_name: string;
  value_type: string;
  unit: string;
  total_students: number;
  rankings: SchoolRanking[];
}

// API Functions
async function fetchProgress(
  studentId: number,
  sportTypeId: number
): Promise<{ data: ProgressAnalysis }> {
  const response = await fetch(
    `/api/v1/sport-records/progress?student_id=${studentId}&sport_type_id=${sportTypeId}`
  );
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || 'Failed to fetch progress');
  }
  return response.json();
}

async function fetchSchoolRanking(
  schoolId: number,
  sportTypeId: number,
  limit: number = 10
): Promise<{ data: SchoolRankingResult }> {
  const response = await fetch(
    `/api/v1/sport-records/ranking?school_id=${schoolId}&sport_type_id=${sportTypeId}&limit=${limit}`
  );
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || 'Failed to fetch ranking');
  }
  return response.json();
}

// Hooks

/**
 * Hook to fetch progress analysis for a student's sport type
 */
export function useProgress(studentId: number, sportTypeId: number) {
  return useQuery({
    queryKey: ['progress', studentId, sportTypeId],
    queryFn: () => fetchProgress(studentId, sportTypeId),
    enabled: !!studentId && !!sportTypeId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Hook to fetch school ranking for a specific sport type
 */
export function useSchoolRanking(
  schoolId: number,
  sportTypeId: number,
  limit: number = 10
) {
  return useQuery({
    queryKey: ['schoolRanking', schoolId, sportTypeId, limit],
    queryFn: () => fetchSchoolRanking(schoolId, sportTypeId, limit),
    enabled: !!schoolId && !!sportTypeId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Hook to fetch multiple progress analyses for all sport types a student has records in
 */
export function useStudentAllProgress(studentId: number, sportTypeIds: number[]) {
  return useQuery({
    queryKey: ['allProgress', studentId, sportTypeIds],
    queryFn: async () => {
      const results = await Promise.allSettled(
        sportTypeIds.map((sportTypeId) => fetchProgress(studentId, sportTypeId))
      );

      return results
        .map((result, index) => ({
          sportTypeId: sportTypeIds[index],
          data:
            result.status === 'fulfilled' ? result.value.data : null,
          error: result.status === 'rejected' ? result.reason : null,
        }))
        .filter((r) => r.data !== null);
    },
    enabled: !!studentId && sportTypeIds.length > 0,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Helper function to determine if a change is an improvement
 */
export function isImprovement(
  change: number,
  valueType: 'time' | 'distance' | 'count'
): boolean {
  // For time-based metrics, lower is better
  if (valueType === 'time') {
    return change < 0;
  }
  // For distance/count, higher is better
  return change > 0;
}

/**
 * Helper function to format progress change
 */
export function formatProgressChange(
  change: number,
  changePercent: number,
  unit: string,
  isImprovement: boolean
): string {
  const sign = change > 0 ? '+' : '';
  const arrow = isImprovement ? '↑' : change === 0 ? '—' : '↓';
  return `${arrow} ${sign}${change.toFixed(1)} ${unit} (${sign}${changePercent.toFixed(1)}%)`;
}

/**
 * Helper function to get progress status color
 */
export function getProgressColor(isImprovement: boolean, change: number): string {
  if (change === 0) return 'gray';
  return isImprovement ? 'green' : 'red';
}
