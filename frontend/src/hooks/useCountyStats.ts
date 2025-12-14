/**
 * React Query hooks for fetching county statistics
 * Feature: 002-map-visualization
 */

import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import type {
  AllCountyStatisticsResponse,
  CountyStatisticsResponse,
  ErrorResponse,
} from '../types/county';

const API_URL = process.env.NEXT_PUBLIC_API_URL || '/api/v1';

/**
 * Fetch all county statistics
 */
async function fetchAllCountyStats(): Promise<AllCountyStatisticsResponse> {
  const response = await axios.get<AllCountyStatisticsResponse>(
    `${API_URL}/counties/statistics`,
    {
      withCredentials: true, // Include cookies for authentication
    }
  );
  return response.data;
}

/**
 * Fetch statistics for a specific county
 */
async function fetchCountyStats(countyName: string): Promise<CountyStatisticsResponse> {
  const response = await axios.get<CountyStatisticsResponse>(
    `${API_URL}/counties/${encodeURIComponent(countyName)}/statistics`,
    {
      withCredentials: true, // Include cookies for authentication
    }
  );
  return response.data;
}

/**
 * Hook to fetch all county statistics with React Query
 * Caches data for 15 minutes (matches backend Redis cache)
 */
export function useAllCountyStats() {
  return useQuery<AllCountyStatisticsResponse, ErrorResponse>({
    queryKey: ['countyStats', 'all'],
    queryFn: fetchAllCountyStats,
    staleTime: 15 * 60 * 1000, // 15 minutes (matches Redis cache TTL)
    gcTime: 20 * 60 * 1000, // 20 minutes (keep in cache a bit longer) - renamed from cacheTime in React Query v5
    retry: 2,
    refetchOnWindowFocus: false,
  });
}

/**
 * Hook to fetch single county statistics with React Query
 * Caches data for 15 minutes (matches backend Redis cache)
 */
export function useCountyStats(countyName: string | null) {
  return useQuery<CountyStatisticsResponse, ErrorResponse>({
    queryKey: ['countyStats', countyName],
    queryFn: () => fetchCountyStats(countyName!),
    enabled: !!countyName, // Only run query if countyName is provided
    staleTime: 15 * 60 * 1000, // 15 minutes (matches Redis cache TTL)
    gcTime: 20 * 60 * 1000, // 20 minutes - renamed from cacheTime in React Query v5
    retry: 2,
    refetchOnWindowFocus: false,
  });
}
