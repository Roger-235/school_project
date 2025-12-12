/**
 * StudentSearchForm Component
 * Feature: 003-student-sports-data
 * Task: T067
 */

import { School, GRADES, GENDERS, GENDER_LABELS } from '@/types/sports'

export interface StudentSearchParams {
  name?: string
  school_id?: number
  grade?: number
  gender?: 'male' | 'female'
  page?: number
  page_size?: number
}

interface StudentSearchFormProps {
  searchParams: StudentSearchParams
  schools: School[]
  onSearchChange: (params: Partial<StudentSearchParams>) => void
  onReset: () => void
  isLoading?: boolean
}

export default function StudentSearchForm({
  searchParams,
  schools,
  onSearchChange,
  onReset,
  isLoading = false,
}: StudentSearchFormProps) {
  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-lg font-medium text-gray-900 mb-4">搜尋學生</h2>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {/* Name Search */}
        <div>
          <label
            htmlFor="search-name"
            className="block text-sm font-medium text-gray-700"
          >
            姓名
          </label>
          <input
            type="text"
            id="search-name"
            value={searchParams.name || ''}
            onChange={(e) => onSearchChange({ name: e.target.value })}
            placeholder="輸入姓名..."
            disabled={isLoading}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm disabled:bg-gray-100"
          />
        </div>

        {/* School Filter */}
        <div>
          <label
            htmlFor="search-school"
            className="block text-sm font-medium text-gray-700"
          >
            學校
          </label>
          <select
            id="search-school"
            value={searchParams.school_id || ''}
            onChange={(e) =>
              onSearchChange({
                school_id: e.target.value ? parseInt(e.target.value) : undefined,
              })
            }
            disabled={isLoading}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm disabled:bg-gray-100"
          >
            <option value="">全部學校</option>
            {schools.map((school) => (
              <option key={school.id} value={school.id}>
                {school.name}
              </option>
            ))}
          </select>
        </div>

        {/* Grade Filter */}
        <div>
          <label
            htmlFor="search-grade"
            className="block text-sm font-medium text-gray-700"
          >
            年級
          </label>
          <select
            id="search-grade"
            value={searchParams.grade || ''}
            onChange={(e) =>
              onSearchChange({
                grade: e.target.value ? parseInt(e.target.value) : undefined,
              })
            }
            disabled={isLoading}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm disabled:bg-gray-100"
          >
            <option value="">全部年級</option>
            {GRADES.map((grade) => (
              <option key={grade} value={grade}>
                {grade} 年級
              </option>
            ))}
          </select>
        </div>

        {/* Gender Filter */}
        <div>
          <label
            htmlFor="search-gender"
            className="block text-sm font-medium text-gray-700"
          >
            性別
          </label>
          <select
            id="search-gender"
            value={searchParams.gender || ''}
            onChange={(e) =>
              onSearchChange({
                gender: (e.target.value as 'male' | 'female') || undefined,
              })
            }
            disabled={isLoading}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm disabled:bg-gray-100"
          >
            <option value="">全部</option>
            {GENDERS.map((gender) => (
              <option key={gender} value={gender}>
                {GENDER_LABELS[gender]}
              </option>
            ))}
          </select>
        </div>

        {/* Reset Button */}
        <div className="flex items-end">
          <button
            onClick={onReset}
            disabled={isLoading}
            className="w-full px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            清除篩選
          </button>
        </div>
      </div>

      {/* Active Filters Summary */}
      {(searchParams.name || searchParams.school_id || searchParams.grade || searchParams.gender) && (
        <div className="mt-4 flex flex-wrap gap-2">
          <span className="text-sm text-gray-500">目前篩選條件：</span>
          {searchParams.name && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              姓名: {searchParams.name}
              <button
                onClick={() => onSearchChange({ name: undefined })}
                className="ml-1 text-blue-600 hover:text-blue-800"
              >
                ×
              </button>
            </span>
          )}
          {searchParams.school_id && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
              學校: {schools.find(s => s.id === searchParams.school_id)?.name}
              <button
                onClick={() => onSearchChange({ school_id: undefined })}
                className="ml-1 text-green-600 hover:text-green-800"
              >
                ×
              </button>
            </span>
          )}
          {searchParams.grade && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
              年級: {searchParams.grade}年級
              <button
                onClick={() => onSearchChange({ grade: undefined })}
                className="ml-1 text-yellow-600 hover:text-yellow-800"
              >
                ×
              </button>
            </span>
          )}
          {searchParams.gender && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
              性別: {GENDER_LABELS[searchParams.gender]}
              <button
                onClick={() => onSearchChange({ gender: undefined })}
                className="ml-1 text-purple-600 hover:text-purple-800"
              >
                ×
              </button>
            </span>
          )}
        </div>
      )}
    </div>
  )
}
