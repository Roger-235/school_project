/**
 * Student Sports Data Management Types
 * Feature: 003-student-sports-data
 */

import { VALID_TAIWAN_COUNTIES, TaiwanCountyName } from './county'

// Re-export county types for convenience
export { VALID_TAIWAN_COUNTIES }
export type { TaiwanCountyName }

/**
 * School entity - represents a school
 */
export interface School {
  id: number
  name: string
  county_name: TaiwanCountyName
  address?: string
  phone?: string
  created_at: string
  updated_at: string
  student_count?: number
  students?: Student[]
}

/**
 * Student entity - represents a student belonging to a school
 */
export interface Student {
  id: number
  school_id: number
  student_number: string
  name: string
  grade: number
  class?: string
  gender: 'male' | 'female'
  birth_date?: string
  created_at: string
  updated_at: string
  school?: School
  sport_records?: SportRecord[]
}

/**
 * Sport type categories
 */
export type SportCategory = '體適能' | '田徑' | '球類'

/**
 * Sport value types for determining how to interpret values
 */
export type SportValueType = 'time' | 'distance' | 'count' | 'score'

/**
 * SportType entity - represents a type of sport/test
 */
export interface SportType {
  id: number
  name: string
  category: SportCategory
  default_unit: string
  value_type: SportValueType
}

/**
 * SportRecord entity - represents a sport test record for a student
 */
export interface SportRecord {
  id: number
  student_id: number
  sport_type_id: number
  value: number
  test_date: string
  notes?: string
  created_at: string
  updated_at: string
  student?: Student
  sport_type?: SportType
}

/**
 * SportRecordAudit entity - tracks changes to sport records
 */
export interface SportRecordAudit {
  id: number
  sport_record_id: number
  old_value?: number
  new_value?: number
  changed_by: number
  changed_at: string
  reason?: string
}

// ============ Request/Response Types ============

/**
 * Pagination info in list responses
 */
export interface Pagination {
  page: number
  page_size: number
  total: number
  total_pages: number
}

/**
 * Generic list response with pagination
 */
export interface PaginatedResponse<T> {
  data: {
    items: T[]
    pagination: Pagination
  }
}

// School API types
export interface SchoolListResponse {
  data: {
    schools: School[]
    pagination: Pagination
  }
}

export interface SchoolResponse {
  data: {
    school: School
  }
}

export interface CreateSchoolRequest {
  name: string
  county_name: TaiwanCountyName
  address?: string
  phone?: string
}

export interface UpdateSchoolRequest {
  name: string
  county_name: TaiwanCountyName
  address?: string
  phone?: string
}

// Student API types
export interface StudentListResponse {
  data: {
    students: Student[]
    pagination: Pagination
    message?: string
  }
}

export interface StudentResponse {
  data: {
    student: Student
  }
}

export interface CreateStudentRequest {
  school_id: number
  student_number: string
  name: string
  grade: number
  class?: string
  gender: 'male' | 'female'
  birth_date?: string
}

export interface UpdateStudentRequest {
  student_number: string
  name: string
  grade: number
  class?: string
  gender: 'male' | 'female'
  birth_date?: string
}

export interface StudentSearchParams {
  page?: number
  page_size?: number
  name?: string
  school_id?: number
  grade?: number
  gender?: 'male' | 'female'
}

// Sport Type API types
export interface SportTypeListResponse {
  data: {
    sport_types: SportType[]
  }
}

export interface SportTypeResponse {
  data: {
    sport_type: SportType
  }
}

// Sport Record API types
export interface SportRecordListResponse {
  data: {
    records: SportRecord[]
    pagination: Pagination
  }
}

export interface SportRecordResponse {
  data: {
    record: SportRecord
  }
}

export interface CreateSportRecordRequest {
  student_id: number
  sport_type_id: number
  value: number
  test_date: string
  notes?: string
}

export interface UpdateSportRecordRequest {
  value: number
  test_date: string
  notes?: string
  reason?: string
}

export interface SportRecordAuditListResponse {
  data: {
    audits: SportRecordAudit[]
    message?: string
  }
}

// ============ Utility Types ============

/**
 * Grade options (1-12)
 */
export const GRADES = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12] as const
export type Grade = typeof GRADES[number]

/**
 * Gender options
 */
export const GENDERS = ['male', 'female'] as const
export type Gender = typeof GENDERS[number]

/**
 * Gender display labels
 */
export const GENDER_LABELS: Record<Gender, string> = {
  male: '男',
  female: '女',
}

/**
 * Sport categories for filtering
 */
export const SPORT_CATEGORIES: SportCategory[] = ['體適能', '田徑', '球類']

/**
 * Message response (for delete operations)
 */
export interface MessageResponse {
  data: {
    message: string
  }
}
