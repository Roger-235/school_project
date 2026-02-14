/**
 * SportTypeSelect - 運動項目選擇組件
 * Feature: 003-student-sports-data
 *
 * Shows sport types grouped by category with auto-unit display
 */

'use client'

import { useSportTypes } from '@/hooks/useSportTypes'
import { SportType, SPORT_CATEGORIES } from '@/types/sports'

interface SportTypeSelectProps {
  value: number | undefined
  onChange: (sportTypeId: number, sportType: SportType | undefined) => void
  disabled?: boolean
  error?: string
  className?: string
}

export default function SportTypeSelect({
  value,
  onChange,
  disabled = false,
  error,
  className = '',
}: SportTypeSelectProps) {
  const { data, isLoading } = useSportTypes()
  const sportTypes = data?.data?.sport_types || []

  // Group sport types by category
  const groupedTypes = SPORT_CATEGORIES.reduce(
    (acc, category) => {
      acc[category] = sportTypes.filter((st) => st.category === category)
      return acc
    },
    {} as Record<string, SportType[]>
  )

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = parseInt(e.target.value)
    const selectedType = sportTypes.find((st) => st.id === id)
    onChange(id, selectedType)
  }

  const selectedSportType = sportTypes.find((st) => st.id === value)

  return (
    <div className={className}>
      <select
        value={value || ''}
        onChange={handleChange}
        disabled={disabled || isLoading}
        className={`block w-full rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
          error ? 'border-red-300' : 'border-gray-300'
        }`}
      >
        <option value="">
          {isLoading ? '載入中...' : '請選擇運動項目'}
        </option>
        {SPORT_CATEGORIES.map((category) => {
          const types = groupedTypes[category]
          if (!types || types.length === 0) return null
          return (
            <optgroup key={category} label={category}>
              {types.map((type) => (
                <option key={type.id} value={type.id}>
                  {type.name} ({type.default_unit})
                </option>
              ))}
            </optgroup>
          )
        })}
      </select>
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
      {selectedSportType && (
        <p className="mt-1 text-xs text-gray-500">
          單位：{selectedSportType.default_unit} | 類別：{selectedSportType.category}
        </p>
      )}
    </div>
  )
}
