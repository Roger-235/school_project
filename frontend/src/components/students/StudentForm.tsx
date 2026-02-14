/**
 * StudentForm - 學生表單組件
 * Feature: 003-student-sports-data
 */

'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  createStudentSchema,
  updateStudentSchema,
  CreateStudentForm,
  UpdateStudentForm,
} from '@/lib/validations/sports'
import { Student, School, GRADES, GENDERS, GENDER_LABELS } from '@/types/sports'

interface BaseStudentFormProps {
  initialData?: Student
  school?: School
  schools?: School[]
  onCancel: () => void
  isSubmitting?: boolean
}

interface CreateStudentFormProps extends BaseStudentFormProps {
  onSubmit: (data: CreateStudentForm) => void
  isUpdate?: false
}

interface UpdateStudentFormProps extends BaseStudentFormProps {
  onSubmit: (data: UpdateStudentForm) => void
  isUpdate: true
}

type StudentFormProps = CreateStudentFormProps | UpdateStudentFormProps

export default function StudentForm(props: StudentFormProps) {
  const {
    initialData,
    school,
    schools,
    onCancel,
    isSubmitting = false,
  } = props
  const isUpdate = props.isUpdate === true
  const schema = isUpdate ? updateStudentSchema : createStudentSchema

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: initialData
      ? {
          ...(isUpdate ? {} : { school_id: initialData.school_id }),
          student_number: initialData.student_number,
          name: initialData.name,
          grade: initialData.grade,
          class: initialData.class || '',
          gender: initialData.gender,
          birth_date: initialData.birth_date || '',
        }
      : {
          ...(isUpdate ? {} : { school_id: school?.id || 0 }),
          student_number: '',
          name: '',
          grade: 1,
          class: '',
          gender: 'male' as const,
          birth_date: '',
        },
  })

  const handleFormSubmit = (data: CreateStudentForm | UpdateStudentForm) => {
    if (isUpdate) {
      ;(props as UpdateStudentFormProps).onSubmit(data as UpdateStudentForm)
    } else {
      ;(props as CreateStudentFormProps).onSubmit(data as CreateStudentForm)
    }
  }

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      {/* 學校 (只在新增時顯示) */}
      {!isUpdate && (
        <div>
          <label
            htmlFor="school_id"
            className="block text-sm font-medium text-gray-700"
          >
            學校 <span className="text-red-500">*</span>
          </label>
          {school ? (
            <div className="mt-1 px-3 py-2 bg-gray-100 rounded-md text-gray-700">
              {school.name}
            </div>
          ) : (
            <select
              id="school_id"
              {...(register as any)('school_id')}
              disabled={isSubmitting}
              className={`mt-1 block w-full rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                (errors as any).school_id
                  ? 'border-red-300'
                  : 'border-gray-300'
              }`}
            >
              <option value="">請選擇學校</option>
              {schools?.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          )}
          {(errors as any).school_id && (
            <p className="mt-1 text-sm text-red-600">
              {(errors as any).school_id.message}
            </p>
          )}
        </div>
      )}

      {/* 學號 */}
      <div>
        <label
          htmlFor="student_number"
          className="block text-sm font-medium text-gray-700"
        >
          學號 <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          id="student_number"
          {...register('student_number')}
          disabled={isSubmitting}
          className={`mt-1 block w-full rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
            errors.student_number ? 'border-red-300' : 'border-gray-300'
          }`}
          placeholder="例：11001"
        />
        {errors.student_number && (
          <p className="mt-1 text-sm text-red-600">
            {errors.student_number.message}
          </p>
        )}
      </div>

      {/* 姓名 */}
      <div>
        <label
          htmlFor="name"
          className="block text-sm font-medium text-gray-700"
        >
          姓名 <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          id="name"
          {...register('name')}
          disabled={isSubmitting}
          className={`mt-1 block w-full rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
            errors.name ? 'border-red-300' : 'border-gray-300'
          }`}
          placeholder="例：王小明"
        />
        {errors.name && (
          <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* 年級 */}
        <div>
          <label
            htmlFor="grade"
            className="block text-sm font-medium text-gray-700"
          >
            年級 <span className="text-red-500">*</span>
          </label>
          <select
            id="grade"
            {...register('grade')}
            disabled={isSubmitting}
            className={`mt-1 block w-full rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
              errors.grade ? 'border-red-300' : 'border-gray-300'
            }`}
          >
            {GRADES.map((grade) => (
              <option key={grade} value={grade}>
                {grade} 年級
              </option>
            ))}
          </select>
          {errors.grade && (
            <p className="mt-1 text-sm text-red-600">{errors.grade.message}</p>
          )}
        </div>

        {/* 班級 */}
        <div>
          <label
            htmlFor="class"
            className="block text-sm font-medium text-gray-700"
          >
            班級
          </label>
          <input
            type="text"
            id="class"
            {...register('class')}
            disabled={isSubmitting}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            placeholder="例：甲班"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* 性別 */}
        <div>
          <label
            htmlFor="gender"
            className="block text-sm font-medium text-gray-700"
          >
            性別 <span className="text-red-500">*</span>
          </label>
          <select
            id="gender"
            {...register('gender')}
            disabled={isSubmitting}
            className={`mt-1 block w-full rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
              errors.gender ? 'border-red-300' : 'border-gray-300'
            }`}
          >
            {GENDERS.map((gender) => (
              <option key={gender} value={gender}>
                {GENDER_LABELS[gender]}
              </option>
            ))}
          </select>
          {errors.gender && (
            <p className="mt-1 text-sm text-red-600">{errors.gender.message}</p>
          )}
        </div>

        {/* 出生日期 */}
        <div>
          <label
            htmlFor="birth_date"
            className="block text-sm font-medium text-gray-700"
          >
            出生日期
          </label>
          <input
            type="date"
            id="birth_date"
            {...register('birth_date')}
            disabled={isSubmitting}
            max={new Date().toISOString().split('T')[0]}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          />
          {errors.birth_date && (
            <p className="mt-1 text-sm text-red-600">
              {errors.birth_date.message}
            </p>
          )}
        </div>
      </div>

      {/* 按鈕 */}
      <div className="flex justify-end space-x-3">
        <button
          type="button"
          onClick={onCancel}
          disabled={isSubmitting}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          取消
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? '處理中...' : isUpdate ? '儲存' : '建立'}
        </button>
      </div>
    </form>
  )
}
