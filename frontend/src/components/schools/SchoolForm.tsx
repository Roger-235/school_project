/**
 * SchoolForm - 學校表單組件
 * Feature: 003-student-sports-data
 */

'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { createSchoolSchema, CreateSchoolForm } from '@/lib/validations/sports'
import CountySelect from '@/components/common/CountySelect'
import { TaiwanCountyName } from '@/types/county'
import { School } from '@/types/sports'

interface SchoolFormProps {
  initialData?: School
  onSubmit: (data: CreateSchoolForm) => void
  onCancel: () => void
  isSubmitting?: boolean
}

export default function SchoolForm({
  initialData,
  onSubmit,
  onCancel,
  isSubmitting = false,
}: SchoolFormProps) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CreateSchoolForm>({
    resolver: zodResolver(createSchoolSchema),
    defaultValues: initialData
      ? {
          name: initialData.name,
          county_name: initialData.county_name,
          address: initialData.address || '',
          phone: initialData.phone || '',
        }
      : {
          name: '',
          county_name: '' as TaiwanCountyName,
          address: '',
          phone: '',
        },
  })

  const countyValue = watch('county_name')

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* 學校名稱 */}
      <div>
        <label
          htmlFor="name"
          className="block text-sm font-medium text-gray-700"
        >
          學校名稱 <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          id="name"
          {...register('name')}
          disabled={isSubmitting}
          className={`mt-1 block w-full rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
            errors.name ? 'border-red-300' : 'border-gray-300'
          }`}
          placeholder="例：台北市立測試國小"
        />
        {errors.name && (
          <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
        )}
      </div>

      {/* 縣市 */}
      <CountySelect
        value={countyValue}
        onChange={(value) => setValue('county_name', value)}
        error={errors.county_name?.message}
        disabled={isSubmitting}
        required
      />

      {/* 地址 */}
      <div>
        <label
          htmlFor="address"
          className="block text-sm font-medium text-gray-700"
        >
          地址
        </label>
        <input
          type="text"
          id="address"
          {...register('address')}
          disabled={isSubmitting}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          placeholder="例：台北市中正區測試路1號"
        />
        {errors.address && (
          <p className="mt-1 text-sm text-red-600">{errors.address.message}</p>
        )}
      </div>

      {/* 電話 */}
      <div>
        <label
          htmlFor="phone"
          className="block text-sm font-medium text-gray-700"
        >
          電話
        </label>
        <input
          type="text"
          id="phone"
          {...register('phone')}
          disabled={isSubmitting}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          placeholder="例：02-1234-5678"
        />
        {errors.phone && (
          <p className="mt-1 text-sm text-red-600">{errors.phone.message}</p>
        )}
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
          {isSubmitting ? '處理中...' : initialData ? '儲存' : '建立'}
        </button>
      </div>
    </form>
  )
}
