/**
 * React Query hooks for student data management
 * Feature: 003-student-sports-data
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useState, useCallback, useMemo } from 'react'
import { useDebouncedCallback } from 'use-debounce'
import {
  fetchStudents,
  fetchStudent,
  fetchStudentWithRecords,
  createStudent,
  updateStudent,
  deleteStudent,
} from '@/lib/api/students'
import type {
  StudentListResponse,
  StudentResponse,
  CreateStudentRequest,
  UpdateStudentRequest,
  StudentSearchParams,
} from '@/types/sports'

/**
 * Hook to fetch paginated list of students with filters
 */
export function useStudents(params: StudentSearchParams = {}) {
  return useQuery<StudentListResponse>({
    queryKey: ['students', params],
    queryFn: () => fetchStudents(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

/**
 * Hook to fetch students by school
 */
export function useStudentsBySchool(schoolId: number | null, page = 1, pageSize = 20) {
  return useQuery<StudentListResponse>({
    queryKey: ['students', { school_id: schoolId, page, page_size: pageSize }],
    queryFn: () =>
      fetchStudents({ school_id: schoolId!, page, page_size: pageSize }),
    enabled: !!schoolId,
    staleTime: 5 * 60 * 1000,
  })
}

/**
 * Hook to fetch a single student by ID
 */
export function useStudent(id: number | null) {
  return useQuery<StudentResponse>({
    queryKey: ['student', id],
    queryFn: () => fetchStudent(id!),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  })
}

/**
 * Hook to fetch a student with all sport records
 */
export function useStudentWithRecords(id: number | null) {
  return useQuery<StudentResponse>({
    queryKey: ['student', id, 'records'],
    queryFn: () => fetchStudentWithRecords(id!),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  })
}

/**
 * Hook to create a new student
 */
export function useCreateStudent() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateStudentRequest) => createStudent(data),
    onSuccess: (response) => {
      // Invalidate students list
      queryClient.invalidateQueries({ queryKey: ['students'] })
      // Invalidate school to update student count
      queryClient.invalidateQueries({
        queryKey: ['school', response.data.student.school_id],
      })
      // Invalidate county stats
      queryClient.invalidateQueries({ queryKey: ['countyStats'] })
    },
  })
}

/**
 * Hook to update an existing student
 */
export function useUpdateStudent() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateStudentRequest }) =>
      updateStudent(id, data),
    onSuccess: (_, variables) => {
      // Invalidate specific student and list
      queryClient.invalidateQueries({ queryKey: ['student', variables.id] })
      queryClient.invalidateQueries({ queryKey: ['students'] })
    },
  })
}

/**
 * Hook to delete a student
 */
export function useDeleteStudent() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: number) => deleteStudent(id),
    onSuccess: (_, id) => {
      // Remove from cache and invalidate list
      queryClient.removeQueries({ queryKey: ['student', id] })
      queryClient.invalidateQueries({ queryKey: ['students'] })
      queryClient.invalidateQueries({ queryKey: ['countyStats'] })
    },
  })
}

/**
 * Hook for debounced student search
 */
export function useStudentSearch(initialParams: StudentSearchParams = {}) {
  const [searchParams, setSearchParams] = useState<StudentSearchParams>(initialParams)
  const [debouncedParams, setDebouncedParams] = useState<StudentSearchParams>(initialParams)

  // Debounce the search params update
  const debouncedSetParams = useDebouncedCallback((params: StudentSearchParams) => {
    setDebouncedParams(params)
  }, 300)

  // Update search params and trigger debounced update
  const updateSearchParams = useCallback(
    (newParams: Partial<StudentSearchParams>) => {
      const updated = { ...searchParams, ...newParams }
      setSearchParams(updated)
      debouncedSetParams(updated)
    },
    [searchParams, debouncedSetParams]
  )

  // Reset search params
  const resetSearchParams = useCallback(() => {
    const reset = { page: 1, page_size: 20 }
    setSearchParams(reset)
    setDebouncedParams(reset)
  }, [])

  // Query with debounced params
  const query = useStudents(debouncedParams)

  return {
    ...query,
    searchParams,
    updateSearchParams,
    resetSearchParams,
  }
}
