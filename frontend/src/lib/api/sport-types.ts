/**
 * Sport Types API Client
 * Feature: 003-student-sports-data
 */

import api from '../api'
import { SportTypeListResponse, SportTypeResponse } from '@/types/sports'

const BASE_URL = '/sport-types'

/**
 * Fetch all sport types
 */
export async function fetchSportTypes(category?: string): Promise<SportTypeListResponse> {
  const params = category ? { category } : {}
  const response = await api.get<SportTypeListResponse>(BASE_URL, { params })
  return response.data
}

/**
 * Fetch sport type by ID
 */
export async function fetchSportType(id: number): Promise<SportTypeResponse> {
  const response = await api.get<SportTypeResponse>(`${BASE_URL}/${id}`)
  return response.data
}

/**
 * Fetch all sport categories
 */
export async function fetchSportCategories(): Promise<{ data: { categories: string[] } }> {
  const response = await api.get<{ data: { categories: string[] } }>(`${BASE_URL}/categories`)
  return response.data
}
