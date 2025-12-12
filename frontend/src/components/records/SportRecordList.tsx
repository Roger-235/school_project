/**
 * SportRecordList - 運動記錄列表組件
 * Feature: 003-student-sports-data
 */

import SportRecordCard from './SportRecordCard'
import { SportRecord, Pagination } from '@/types/sports'

interface SportRecordListProps {
  records: SportRecord[]
  studentId: number
  pagination?: Pagination
  onPageChange?: (page: number) => void
  onDelete?: (id: number) => void
  onViewHistory?: (id: number) => void
  isLoading?: boolean
  emptyMessage?: string
  showStudent?: boolean
}

export default function SportRecordList({
  records,
  studentId,
  pagination,
  onPageChange,
  onDelete,
  onViewHistory,
  isLoading = false,
  emptyMessage = '尚無運動記錄',
  showStudent = false,
}: SportRecordListProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (records.length === 0) {
    return (
      <div className="text-center py-12">
        <svg
          className="mx-auto h-12 w-12 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
          />
        </svg>
        <p className="mt-4 text-gray-500">{emptyMessage}</p>
      </div>
    )
  }

  return (
    <div>
      {/* Records Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {records.map((record) => (
          <SportRecordCard
            key={record.id}
            record={record}
            studentId={studentId}
            onDelete={onDelete}
            onViewHistory={onViewHistory}
            showStudent={showStudent}
          />
        ))}
      </div>

      {/* Pagination */}
      {pagination && pagination.total_pages > 1 && onPageChange && (
        <div className="mt-6 flex items-center justify-between">
          <div className="text-sm text-gray-500">
            共 {pagination.total} 筆記錄，第 {pagination.page} /{' '}
            {pagination.total_pages} 頁
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => onPageChange(pagination.page - 1)}
              disabled={pagination.page <= 1}
              className="px-3 py-1 text-sm border rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              上一頁
            </button>
            <button
              onClick={() => onPageChange(pagination.page + 1)}
              disabled={pagination.page >= pagination.total_pages}
              className="px-3 py-1 text-sm border rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              下一頁
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
