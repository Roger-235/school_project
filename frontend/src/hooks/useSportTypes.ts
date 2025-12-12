/**
 * Sport Types React Query Hooks
 * Feature: 003-student-sports-data
 */

import { useQuery } from '@tanstack/react-query'
import {
  fetchSportTypes,
  fetchSportType,
  fetchSportCategories,
} from '@/lib/api/sport-types'

// Query keys
export const sportTypeKeys = {
  all: ['sportTypes'] as const,
  lists: () => [...sportTypeKeys.all, 'list'] as const,
  list: (category?: string) => [...sportTypeKeys.lists(), { category }] as const,
  details: () => [...sportTypeKeys.all, 'detail'] as const,
  detail: (id: number) => [...sportTypeKeys.details(), id] as const,
  categories: () => [...sportTypeKeys.all, 'categories'] as const,
}

/**
 * Hook to fetch all sport types
 */
export function useSportTypes(category?: string) {
  return useQuery({
    queryKey: sportTypeKeys.list(category),
    queryFn: () => fetchSportTypes(category),
    staleTime: 1000 * 60 * 30, // 30 minutes - sport types rarely change
  })
}

/**
 * Hook to fetch a single sport type
 */
export function useSportType(id: number | null) {
  return useQuery({
    queryKey: sportTypeKeys.detail(id!),
    queryFn: () => fetchSportType(id!),
    enabled: id !== null,
    staleTime: 1000 * 60 * 30, // 30 minutes
  })
}

/**
 * Hook to fetch all sport categories
 */
export function useSportCategories() {
  return useQuery({
    queryKey: sportTypeKeys.categories(),
    queryFn: fetchSportCategories,
    staleTime: 1000 * 60 * 60, // 1 hour - categories never change
  })
}
