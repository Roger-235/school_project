/**
 * CountySelect - 縣市下拉選單組件
 * Feature: 003-student-sports-data
 */

'use client'

import { VALID_TAIWAN_COUNTIES, TaiwanCountyName } from '@/types/county'

interface CountySelectProps {
  value: string
  onChange: (value: TaiwanCountyName) => void
  error?: string
  disabled?: boolean
  required?: boolean
}

export default function CountySelect({
  value,
  onChange,
  error,
  disabled = false,
  required = false,
}: CountySelectProps) {
  return (
    <div>
      <label
        htmlFor="county_name"
        className="block text-sm font-medium text-gray-700"
      >
        縣市 {required && <span className="text-red-500">*</span>}
      </label>
      <select
        id="county_name"
        name="county_name"
        value={value}
        onChange={(e) => onChange(e.target.value as TaiwanCountyName)}
        disabled={disabled}
        className={`mt-1 block w-full rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
          error
            ? 'border-red-300 text-red-900 placeholder-red-300'
            : 'border-gray-300'
        } ${disabled ? 'bg-gray-100 cursor-not-allowed' : ''}`}
      >
        <option value="">請選擇縣市</option>
        {VALID_TAIWAN_COUNTIES.map((county) => (
          <option key={county} value={county}>
            {county}
          </option>
        ))}
      </select>
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  )
}
