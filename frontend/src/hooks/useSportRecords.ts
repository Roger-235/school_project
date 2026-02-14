/**
 * Sport Records React Query Hooks
 * Feature: 003-student-sports-data
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  fetchSportRecords,
  fetchSportRecord,
  createSportRecord,
  updateSportRecord,
  deleteSportRecord,
  fetchSportRecordHistory,
  fetchSportRecordTrend,
} from '@/lib/api/sport-records'
import { CreateSportRecordRequest, UpdateSportRecordRequest } from '@/types/sports'

// Query keys
export const sportRecordKeys = {
  all: ['sportRecords'] as const,
  lists: () => [...sportRecordKeys.all, 'list'] as const,
  list: (studentId: number, page?: number, sportTypeId?: number) =>
    [...sportRecordKeys.lists(), { studentId, page, sportTypeId }] as const,
  details: () => [...sportRecordKeys.all, 'detail'] as const,
  detail: (id: number) => [...sportRecordKeys.details(), id] as const,
  history: (id: number) => [...sportRecordKeys.all, 'history', id] as const,
  trend: (studentId: number, sportTypeId: number) =>
    [...sportRecordKeys.all, 'trend', { studentId, sportTypeId }] as const,
}

/**
 * Hook to fetch sport records for a student
 */
export function useSportRecords(
  studentId: number | null,
  page: number = 1,
  pageSize: number = 20,
  sportTypeId?: number
) {
  return useQuery({
    queryKey: sportRecordKeys.list(studentId!, page, sportTypeId),
    queryFn: () => fetchSportRecords(studentId!, page, pageSize, sportTypeId),
    enabled: studentId !== null,
    staleTime: 1000 * 60 * 5, // 5 minutes
  })
}

/**
 * Hook to fetch a single sport record
 */
export function useSportRecord(id: number | null) {
  return useQuery({
    queryKey: sportRecordKeys.detail(id!),
    queryFn: () => fetchSportRecord(id!),
    enabled: id !== null,
  })
}

/**
 * Hook to fetch sport record history (audit trail)
 */
export function useSportRecordHistory(recordId: number | null) {
  return useQuery({
    queryKey: sportRecordKeys.history(recordId!),
    queryFn: () => fetchSportRecordHistory(recordId!),
    enabled: recordId !== null,
  })
}

/**
 * Hook to fetch trend data for analysis
 */
export function useSportRecordTrend(
  studentId: number | null,
  sportTypeId: number | null
) {
  return useQuery({
    queryKey: sportRecordKeys.trend(studentId!, sportTypeId!),
    queryFn: () => fetchSportRecordTrend(studentId!, sportTypeId!),
    enabled: studentId !== null && sportTypeId !== null,
  })
}

/**
 * Hook to create a sport record
 */
export function useCreateSportRecord() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateSportRecordRequest) => createSportRecord(data),
    onSuccess: (_, variables) => {
      // Invalidate list queries for the student
      queryClient.invalidateQueries({
        queryKey: sportRecordKeys.lists(),
      })
      // Also invalidate trend data
      queryClient.invalidateQueries({
        queryKey: ['sportRecords', 'trend', { studentId: variables.student_id }],
      })
    },
  })
}

/**
 * Hook to update a sport record
 */
export function useUpdateSportRecord() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: number
      data: UpdateSportRecordRequest
    }) => updateSportRecord(id, data),
    onSuccess: (_, variables) => {
      // Invalidate detail and list queries
      queryClient.invalidateQueries({
        queryKey: sportRecordKeys.detail(variables.id),
      })
      queryClient.invalidateQueries({
        queryKey: sportRecordKeys.lists(),
      })
      // Also invalidate history
      queryClient.invalidateQueries({
        queryKey: sportRecordKeys.history(variables.id),
      })
    },
  })
}

/**
 * Hook to delete a sport record
 */
export function useDeleteSportRecord() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: number) => deleteSportRecord(id),
    onSuccess: () => {
      // Invalidate list queries
      queryClient.invalidateQueries({
        queryKey: sportRecordKeys.lists(),
      })
    },
  })
}

// Student score result from bulk API
export interface StudentScore {
  student_id: number
  student_name: string
  grade: number
  class: string | null
  gender: string
  value: number | null
  test_date: string | null
  record_id: number | null
}

/**
 * Hook to fetch scores for multiple students in a specific sport type
 */
export function useBulkStudentScores(studentIds: number[], sportTypeId: number | null) {
  return useQuery({
    queryKey: ['bulkScores', studentIds, sportTypeId],
    queryFn: async () => {
      if (!sportTypeId || studentIds.length === 0) {
        return []
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || '/api/v1'}/sport-records/bulk-scores?student_ids=${studentIds.join(',')}&sport_type_id=${sportTypeId}`
      )

      if (!response.ok) {
        throw new Error('Failed to fetch bulk scores')
      }

      const data = await response.json()
      return data.data.scores as StudentScore[]
    },
    enabled: !!sportTypeId && studentIds.length > 0,
    staleTime: 1000 * 60 * 5, // 5 minutes
  })
}
