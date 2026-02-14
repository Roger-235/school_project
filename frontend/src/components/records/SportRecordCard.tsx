/**
 * SportRecordCard - 運動記錄卡片組件
 * Feature: 003-student-sports-data
 */

import Link from 'next/link'
import { SportRecord } from '@/types/sports'

interface SportRecordCardProps {
  record: SportRecord
  studentId: number
  onDelete?: (id: number) => void
  onViewHistory?: (id: number) => void
  showStudent?: boolean
}

export default function SportRecordCard({
  record,
  studentId,
  onDelete,
  onViewHistory,
  showStudent = false,
}: SportRecordCardProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('zh-TW', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    })
  }

  const formatValue = (value: number, unit: string) => {
    // Format based on value type
    if (unit === '秒' || unit === '分鐘') {
      // Time: show 2 decimal places
      return value.toFixed(2)
    } else if (unit === '公分' || unit === '公尺') {
      // Distance: show 1 decimal place
      return value.toFixed(1)
    } else {
      // Count/score: show as integer or 1 decimal if needed
      return Number.isInteger(value) ? value.toString() : value.toFixed(1)
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case '體適能':
        return 'bg-green-100 text-green-800'
      case '田徑':
        return 'bg-blue-100 text-blue-800'
      case '球類':
        return 'bg-orange-100 text-orange-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="bg-white rounded-lg shadow p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          {/* Sport Type */}
          <div className="flex items-center space-x-2">
            <h3 className="text-lg font-medium text-gray-900">
              {record.sport_type?.name}
            </h3>
            {record.sport_type && (
              <span
                className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getCategoryColor(
                  record.sport_type.category
                )}`}
              >
                {record.sport_type.category}
              </span>
            )}
          </div>

          {/* Value */}
          <div className="mt-2">
            <span className="text-2xl font-bold text-gray-900">
              {formatValue(record.value, record.sport_type?.default_unit || '')}
            </span>
            <span className="ml-1 text-gray-500">
              {record.sport_type?.default_unit}
            </span>
          </div>

          {/* Test Date */}
          <p className="mt-1 text-sm text-gray-500">
            測驗日期：{formatDate(record.test_date)}
          </p>

          {/* Student (if showing) */}
          {showStudent && record.student && (
            <p className="mt-1 text-sm text-gray-500">
              學生：{record.student.name}
            </p>
          )}

          {/* Notes */}
          {record.notes && (
            <p className="mt-2 text-sm text-gray-600 bg-gray-50 p-2 rounded">
              {record.notes}
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="flex flex-col space-y-2 ml-4">
          <Link
            href={`/students/${studentId}/records/${record.id}/edit`}
            className="text-blue-600 hover:text-blue-800 text-sm"
          >
            編輯
          </Link>
          {onViewHistory && (
            <button
              onClick={() => onViewHistory(record.id)}
              className="text-gray-600 hover:text-gray-800 text-sm text-left"
            >
              歷史
            </button>
          )}
          {onDelete && (
            <button
              onClick={() => onDelete(record.id)}
              className="text-red-600 hover:text-red-800 text-sm text-left"
            >
              刪除
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
