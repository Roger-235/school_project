/**
 * SportRecordForm - 運動記錄表單組件
 * Feature: 003-student-sports-data
 */

'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import SportTypeSelect from './SportTypeSelect'
import { SportRecord, SportType } from '@/types/sports'

// Zod schema for sport record form
const sportRecordFormSchema = z.object({
  sport_type_id: z.number().min(1, '請選擇運動項目'),
  value: z.number().positive('數值必須大於零'),
  test_date: z.string().min(1, '請選擇測驗日期'),
  notes: z.string().optional(),
  reason: z.string().optional(), // Only for updates
})

type SportRecordFormData = z.infer<typeof sportRecordFormSchema>

interface SportRecordFormProps {
  studentId: number
  initialData?: SportRecord
  onSubmit: (data: SportRecordFormData) => void
  onCancel: () => void
  isSubmitting?: boolean
  isUpdate?: boolean
}

export default function SportRecordForm({
  studentId,
  initialData,
  onSubmit,
  onCancel,
  isSubmitting = false,
  isUpdate = false,
}: SportRecordFormProps) {
  const [selectedSportType, setSelectedSportType] = useState<SportType | undefined>(
    initialData?.sport_type
  )

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<SportRecordFormData>({
    resolver: zodResolver(sportRecordFormSchema),
    defaultValues: initialData
      ? {
          sport_type_id: initialData.sport_type_id,
          value: initialData.value,
          test_date: initialData.test_date.split('T')[0],
          notes: initialData.notes || '',
          reason: '',
        }
      : {
          sport_type_id: 0,
          value: 0,
          test_date: new Date().toISOString().split('T')[0],
          notes: '',
        },
  })

  const sportTypeId = watch('sport_type_id')

  const handleSportTypeChange = (id: number, sportType: SportType | undefined) => {
    setValue('sport_type_id', id)
    setSelectedSportType(sportType)
  }

  // Get max date (today)
  const today = new Date().toISOString().split('T')[0]

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* 運動項目 */}
      <div>
        <label className="block text-sm font-medium text-gray-700">
          運動項目 <span className="text-red-500">*</span>
        </label>
        <SportTypeSelect
          value={sportTypeId || undefined}
          onChange={handleSportTypeChange}
          disabled={isSubmitting || isUpdate} // Can't change sport type on update
          error={errors.sport_type_id?.message}
          className="mt-1"
        />
      </div>

      {/* 數值 */}
      <div>
        <label
          htmlFor="value"
          className="block text-sm font-medium text-gray-700"
        >
          數值 <span className="text-red-500">*</span>
          {selectedSportType && (
            <span className="ml-2 text-gray-500">
              ({selectedSportType.default_unit})
            </span>
          )}
        </label>
        <input
          type="number"
          id="value"
          step="0.01"
          {...register('value', { valueAsNumber: true })}
          disabled={isSubmitting}
          className={`mt-1 block w-full rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
            errors.value ? 'border-red-300' : 'border-gray-300'
          }`}
          placeholder={
            selectedSportType
              ? `輸入${selectedSportType.default_unit}`
              : '請先選擇運動項目'
          }
        />
        {errors.value && (
          <p className="mt-1 text-sm text-red-600">{errors.value.message}</p>
        )}
      </div>

      {/* 測驗日期 */}
      <div>
        <label
          htmlFor="test_date"
          className="block text-sm font-medium text-gray-700"
        >
          測驗日期 <span className="text-red-500">*</span>
        </label>
        <input
          type="date"
          id="test_date"
          {...register('test_date')}
          max={today}
          disabled={isSubmitting}
          className={`mt-1 block w-full rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
            errors.test_date ? 'border-red-300' : 'border-gray-300'
          }`}
        />
        {errors.test_date && (
          <p className="mt-1 text-sm text-red-600">{errors.test_date.message}</p>
        )}
      </div>

      {/* 備註 */}
      <div>
        <label
          htmlFor="notes"
          className="block text-sm font-medium text-gray-700"
        >
          備註
        </label>
        <textarea
          id="notes"
          {...register('notes')}
          rows={3}
          disabled={isSubmitting}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          placeholder="選填：記錄測驗條件、天氣等備註"
        />
      </div>

      {/* 修改原因 (僅更新時顯示) */}
      {isUpdate && (
        <div>
          <label
            htmlFor="reason"
            className="block text-sm font-medium text-gray-700"
          >
            修改原因
          </label>
          <textarea
            id="reason"
            {...register('reason')}
            rows={2}
            disabled={isSubmitting}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            placeholder="選填：說明修改此記錄的原因"
          />
        </div>
      )}

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
