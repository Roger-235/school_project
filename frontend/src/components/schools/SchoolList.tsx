/**
 * SchoolList - 學校列表組件
 * Feature: 003-student-sports-data
 */

'use client'

import { useState } from 'react'
import { School, Pagination } from '@/types/sports'
import SchoolCard from './SchoolCard'

interface SchoolListProps {
  schools: School[]
  pagination: Pagination
  onPageChange: (page: number) => void
  onDelete?: (id: number) => void
  isLoading?: boolean
}

export default function SchoolList({
  schools,
  pagination,
  onPageChange,
  onDelete,
  isLoading = false,
}: SchoolListProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">載入中...</span>
      </div>
    )
  }

  if (schools.length === 0) {
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
            d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
          />
        </svg>
        <h3 className="mt-2 text-sm font-medium text-gray-900">尚無學校資料</h3>
        <p className="mt-1 text-sm text-gray-500">點擊「新增學校」開始建立學校資料</p>
      </div>
    )
  }

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {schools.map((school) => (
          <SchoolCard key={school.id} school={school} onDelete={onDelete} />
        ))}
      </div>

      {/* 分頁 */}
      {pagination.total_pages > 1 && (
        <div className="mt-8 flex items-center justify-between">
          <div className="text-sm text-gray-700">
            共 {pagination.total} 筆資料，第 {pagination.page} /{' '}
            {pagination.total_pages} 頁
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => onPageChange(pagination.page - 1)}
              disabled={pagination.page <= 1}
              className="px-3 py-1 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              上一頁
            </button>
            <button
              onClick={() => onPageChange(pagination.page + 1)}
              disabled={pagination.page >= pagination.total_pages}
              className="px-3 py-1 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              下一頁
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
