/**
 * Sport Records API Client
 * Feature: 003-student-sports-data
 */

import api from '../api'
import {
  SportRecord,
  SportRecordListResponse,
  SportRecordResponse,
  CreateSportRecordRequest,
  UpdateSportRecordRequest,
  SportRecordAuditListResponse,
  MessageResponse,
} from '@/types/sports'

const BASE_URL = '/sport-records'

/**
 * Fetch sport records for a student
 */
export async function fetchSportRecords(
  studentId: number,
  page: number = 1,
  pageSize: number = 20,
  sportTypeId?: number
): Promise<SportRecordListResponse> {
  const params: Record<string, any> = {
    student_id: studentId,
    page,
    page_size: pageSize,
  }
  if (sportTypeId) {
    params.sport_type_id = sportTypeId
  }
  const response = await api.get<SportRecordListResponse>(BASE_URL, { params })
  return response.data
}

/**
 * Fetch a single sport record by ID
 */
export async function fetchSportRecord(id: number): Promise<SportRecordResponse> {
  const response = await api.get<SportRecordResponse>(`${BASE_URL}/${id}`)
  return response.data
}

/**
 * Create a new sport record
 */
export async function createSportRecord(
  data: CreateSportRecordRequest
): Promise<SportRecordResponse> {
  const response = await api.post<SportRecordResponse>(BASE_URL, data)
  return response.data
}

/**
 * Update an existing sport record
 */
export async function updateSportRecord(
  id: number,
  data: UpdateSportRecordRequest
): Promise<SportRecordResponse> {
  const response = await api.put<SportRecordResponse>(`${BASE_URL}/${id}`, data)
  return response.data
}

/**
 * Delete a sport record
 */
export async function deleteSportRecord(id: number): Promise<MessageResponse> {
  const response = await api.delete<MessageResponse>(`${BASE_URL}/${id}`)
  return response.data
}

/**
 * Fetch audit history for a sport record
 */
export async function fetchSportRecordHistory(
  recordId: number
): Promise<SportRecordAuditListResponse> {
  const response = await api.get<SportRecordAuditListResponse>(
    `${BASE_URL}/${recordId}/history`
  )
  return response.data
}

/**
 * Fetch trend data for a student's sport type
 */
export async function fetchSportRecordTrend(
  studentId: number,
  sportTypeId: number
): Promise<{
  data: {
    records: SportRecord[]
    has_enough_data: boolean
    record_count: number
  }
}> {
  const response = await api.get<{
    data: {
      records: SportRecord[]
      has_enough_data: boolean
      record_count: number
    }
  }>(`${BASE_URL}/trend`, {
    params: {
      student_id: studentId,
      sport_type_id: sportTypeId,
    },
  })
  return response.data
}
