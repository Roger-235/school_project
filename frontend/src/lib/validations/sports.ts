/**
 * Zod Validation Schemas for Student Sports Data Management
 * Feature: 003-student-sports-data
 */

import { z } from 'zod'
import { VALID_TAIWAN_COUNTIES } from '@/types/county'

// ============ Common Validators ============

/**
 * Valid Taiwan county name validator
 */
const countyNameSchema = z.enum(VALID_TAIWAN_COUNTIES, {
  errorMap: () => ({ message: '請選擇有效的縣市' }),
})

/**
 * Grade validator (1-12)
 */
const gradeSchema = z.coerce
  .number()
  .min(1, '年級必須在 1-12 之間')
  .max(12, '年級必須在 1-12 之間')

/**
 * Gender validator
 */
const genderSchema = z.enum(['male', 'female'], {
  errorMap: () => ({ message: '請選擇性別' }),
})

/**
 * Date string validator (YYYY-MM-DD format)
 */
const dateStringSchema = z.string().regex(
  /^\d{4}-\d{2}-\d{2}$/,
  '日期格式必須為 YYYY-MM-DD'
)

/**
 * Past date validator (not in future)
 */
const pastDateSchema = dateStringSchema.refine(
  (date) => new Date(date) <= new Date(),
  '日期不能是未來日期'
)

/**
 * Positive number validator
 */
const positiveNumberSchema = z.coerce
  .number()
  .positive('數值必須為正數')

// ============ School Schemas ============

/**
 * Create school form schema
 */
export const createSchoolSchema = z.object({
  name: z
    .string()
    .min(1, '學校名稱為必填')
    .max(100, '學校名稱最多 100 字元'),
  county_name: countyNameSchema,
  address: z
    .string()
    .max(255, '地址最多 255 字元')
    .optional()
    .or(z.literal('')),
  phone: z
    .string()
    .max(20, '電話最多 20 字元')
    .optional()
    .or(z.literal('')),
})

/**
 * Update school form schema (same as create)
 */
export const updateSchoolSchema = createSchoolSchema

export type CreateSchoolForm = z.infer<typeof createSchoolSchema>
export type UpdateSchoolForm = z.infer<typeof updateSchoolSchema>

// ============ Student Schemas ============

/**
 * Create student form schema
 */
export const createStudentSchema = z.object({
  school_id: z.coerce.number().positive('請選擇學校'),
  student_number: z
    .string()
    .min(1, '學號為必填')
    .max(20, '學號最多 20 字元'),
  name: z
    .string()
    .min(1, '姓名為必填')
    .max(50, '姓名最多 50 字元'),
  grade: gradeSchema,
  class: z
    .string()
    .max(20, '班級最多 20 字元')
    .optional()
    .or(z.literal('')),
  gender: genderSchema,
  birth_date: z
    .string()
    .optional()
    .refine(
      (date) => !date || /^\d{4}-\d{2}-\d{2}$/.test(date),
      '日期格式必須為 YYYY-MM-DD'
    )
    .refine(
      (date) => !date || new Date(date) <= new Date(),
      '出生日期不能是未來日期'
    ),
})

/**
 * Update student form schema (school_id cannot be changed)
 */
export const updateStudentSchema = z.object({
  student_number: z
    .string()
    .min(1, '學號為必填')
    .max(20, '學號最多 20 字元'),
  name: z
    .string()
    .min(1, '姓名為必填')
    .max(50, '姓名最多 50 字元'),
  grade: gradeSchema,
  class: z
    .string()
    .max(20, '班級最多 20 字元')
    .optional()
    .or(z.literal('')),
  gender: genderSchema,
  birth_date: z
    .string()
    .optional()
    .refine(
      (date) => !date || /^\d{4}-\d{2}-\d{2}$/.test(date),
      '日期格式必須為 YYYY-MM-DD'
    )
    .refine(
      (date) => !date || new Date(date) <= new Date(),
      '出生日期不能是未來日期'
    ),
})

/**
 * Student search form schema
 */
export const studentSearchSchema = z.object({
  name: z.string().optional(),
  school_id: z.coerce.number().optional(),
  grade: z.coerce.number().min(1).max(12).optional().or(z.literal('')),
  gender: z.enum(['male', 'female']).optional().or(z.literal('')),
})

export type CreateStudentForm = z.infer<typeof createStudentSchema>
export type UpdateStudentForm = z.infer<typeof updateStudentSchema>
export type StudentSearchForm = z.infer<typeof studentSearchSchema>

// ============ Sport Record Schemas ============

/**
 * Create sport record form schema
 */
export const createSportRecordSchema = z.object({
  student_id: z.coerce.number().positive('請選擇學生'),
  sport_type_id: z.coerce.number().positive('請選擇運動項目'),
  value: positiveNumberSchema,
  test_date: pastDateSchema,
  notes: z
    .string()
    .max(500, '備註最多 500 字元')
    .optional()
    .or(z.literal('')),
})

/**
 * Update sport record form schema
 */
export const updateSportRecordSchema = z.object({
  value: positiveNumberSchema,
  test_date: pastDateSchema,
  notes: z
    .string()
    .max(500, '備註最多 500 字元')
    .optional()
    .or(z.literal('')),
  reason: z
    .string()
    .max(255, '修改原因最多 255 字元')
    .optional()
    .or(z.literal('')),
})

export type CreateSportRecordForm = z.infer<typeof createSportRecordSchema>
export type UpdateSportRecordForm = z.infer<typeof updateSportRecordSchema>

// ============ Export All Schemas ============

export {
  countyNameSchema,
  gradeSchema,
  genderSchema,
  dateStringSchema,
  pastDateSchema,
  positiveNumberSchema,
}
