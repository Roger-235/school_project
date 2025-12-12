/**
 * React Query hook for fetching schools for map display
 * Feature: 006-school-map-markers
 */

import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import type { SchoolMapResponse, SchoolMapData } from '../types/schoolMap';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1';

/**
 * Fetch all schools with coordinates for map display
 */
async function fetchSchoolsForMap(): Promise<SchoolMapResponse> {
  const response = await axios.get<SchoolMapResponse>(
    `${API_URL}/schools/map`,
    {
      withCredentials: true,
    }
  );
  return response.data;
}

/**
 * Hook to fetch schools for map with React Query
 * Caches data for 5 minutes
 */
export function useSchoolsForMap() {
  return useQuery<SchoolMapResponse, Error>({
    queryKey: ['schools', 'map'],
    queryFn: fetchSchoolsForMap,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: 2,
    refetchOnWindowFocus: false,
  });
}

/**
 * Helper to get schools array from response
 */
export function getSchoolsFromResponse(data: SchoolMapResponse | undefined): SchoolMapData[] {
  return data?.data?.schools || [];
}
