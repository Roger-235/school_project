/**
 * School API client
 * Feature: 003-student-sports-data
 */

import api from '../api'
import type {
  School,
  SchoolListResponse,
  SchoolResponse,
  CreateSchoolRequest,
  UpdateSchoolRequest,
  MessageResponse,
} from '@/types/sports'

/**
 * Fetch paginated list of schools
 */
export async function fetchSchools(
  page = 1,
  pageSize = 20,
  countyName?: string
): Promise<SchoolListResponse> {
  const params = new URLSearchParams({
    page: page.toString(),
    page_size: pageSize.toString(),
  })
  if (countyName) {
    params.append('county_name', countyName)
  }
  const response = await api.get<SchoolListResponse>(`/schools?${params}`)
  return response.data
}

/**
 * Fetch a single school by ID
 */
export async function fetchSchool(id: number): Promise<SchoolResponse> {
  const response = await api.get<SchoolResponse>(`/schools/${id}`)
  return response.data
}

/**
 * Create a new school
 */
export async function createSchool(
  data: CreateSchoolRequest
): Promise<SchoolResponse> {
  const response = await api.post<SchoolResponse>('/schools', data)
  return response.data
}

/**
 * Update an existing school
 */
export async function updateSchool(
  id: number,
  data: UpdateSchoolRequest
): Promise<SchoolResponse> {
  const response = await api.put<SchoolResponse>(`/schools/${id}`, data)
  return response.data
}

/**
 * Delete a school (soft delete)
 */
export async function deleteSchool(id: number): Promise<MessageResponse> {
  const response = await api.delete<MessageResponse>(`/schools/${id}`)
  return response.data
}
