/**
 * Student API client
 * Feature: 003-student-sports-data
 */

import api from '../api'
import type {
  StudentListResponse,
  StudentResponse,
  CreateStudentRequest,
  UpdateStudentRequest,
  StudentSearchParams,
  MessageResponse,
} from '@/types/sports'

/**
 * Fetch paginated list of students with optional filters
 */
export async function fetchStudents(
  params: StudentSearchParams = {}
): Promise<StudentListResponse> {
  const searchParams = new URLSearchParams()

  if (params.page) searchParams.append('page', params.page.toString())
  if (params.page_size)
    searchParams.append('page_size', params.page_size.toString())
  if (params.name) searchParams.append('name', params.name)
  if (params.school_id)
    searchParams.append('school_id', params.school_id.toString())
  if (params.grade) searchParams.append('grade', params.grade.toString())
  if (params.gender) searchParams.append('gender', params.gender)

  const response = await api.get<StudentListResponse>(
    `/students?${searchParams}`
  )
  return response.data
}

/**
 * Fetch a single student by ID
 */
export async function fetchStudent(id: number): Promise<StudentResponse> {
  const response = await api.get<StudentResponse>(`/students/${id}`)
  return response.data
}

/**
 * Fetch a student with all sport records
 */
export async function fetchStudentWithRecords(
  id: number
): Promise<StudentResponse> {
  const response = await api.get<StudentResponse>(`/students/${id}/records`)
  return response.data
}

/**
 * Create a new student
 */
export async function createStudent(
  data: CreateStudentRequest
): Promise<StudentResponse> {
  const response = await api.post<StudentResponse>('/students', data)
  return response.data
}

/**
 * Update an existing student
 */
export async function updateStudent(
  id: number,
  data: UpdateStudentRequest
): Promise<StudentResponse> {
  const response = await api.put<StudentResponse>(`/students/${id}`, data)
  return response.data
}

/**
 * Delete a student (soft delete)
 */
export async function deleteStudent(id: number): Promise<MessageResponse> {
  const response = await api.delete<MessageResponse>(`/students/${id}`)
  return response.data
}
