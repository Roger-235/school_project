/**
 * React Query hooks for school data management
 * Feature: 003-student-sports-data
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  fetchSchools,
  fetchSchool,
  createSchool,
  updateSchool,
  deleteSchool,
} from '@/lib/api/schools'
import type {
  School,
  SchoolListResponse,
  SchoolResponse,
  CreateSchoolRequest,
  UpdateSchoolRequest,
} from '@/types/sports'

/**
 * Hook to fetch paginated list of schools
 */
export function useSchools(page = 1, pageSize = 20, countyName?: string) {
  return useQuery<SchoolListResponse>({
    queryKey: ['schools', { page, pageSize, countyName }],
    queryFn: () => fetchSchools(page, pageSize, countyName),
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

/**
 * Hook to fetch a single school by ID
 */
export function useSchool(id: number | null) {
  return useQuery<SchoolResponse>({
    queryKey: ['school', id],
    queryFn: () => fetchSchool(id!),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  })
}

/**
 * Hook to create a new school
 */
export function useCreateSchool() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateSchoolRequest) => createSchool(data),
    onSuccess: () => {
      // Invalidate schools list to refetch
      queryClient.invalidateQueries({ queryKey: ['schools'] })
      // Also invalidate county stats as they include school counts
      queryClient.invalidateQueries({ queryKey: ['countyStats'] })
    },
  })
}

/**
 * Hook to update an existing school
 */
export function useUpdateSchool() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateSchoolRequest }) =>
      updateSchool(id, data),
    onSuccess: (_, variables) => {
      // Invalidate specific school and list
      queryClient.invalidateQueries({ queryKey: ['school', variables.id] })
      queryClient.invalidateQueries({ queryKey: ['schools'] })
      queryClient.invalidateQueries({ queryKey: ['countyStats'] })
    },
  })
}

/**
 * Hook to delete a school
 */
export function useDeleteSchool() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: number) => deleteSchool(id),
    onSuccess: (_, id) => {
      // Remove from cache and invalidate list
      queryClient.removeQueries({ queryKey: ['school', id] })
      queryClient.invalidateQueries({ queryKey: ['schools'] })
      queryClient.invalidateQueries({ queryKey: ['countyStats'] })
    },
  })
}
