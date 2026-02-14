/**
 * SchoolCard - 學校卡片組件
 * Feature: 003-student-sports-data
 */

'use client'

import Link from 'next/link'
import { School } from '@/types/sports'

interface SchoolCardProps {
  school: School
  onDelete?: (id: number) => void
}

export default function SchoolCard({ school, onDelete }: SchoolCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
      <div className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <Link href={`/schools/${school.id}`}>
              <h3 className="text-lg font-semibold text-gray-900 hover:text-blue-600 transition-colors">
                {school.name}
              </h3>
            </Link>
            <p className="mt-1 text-sm text-gray-500">{school.county_name}</p>
          </div>
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            {school.student_count ?? 0} 位學生
          </span>
        </div>

        {school.address && (
          <div className="mt-4 flex items-start text-sm text-gray-600">
            <svg
              className="flex-shrink-0 h-5 w-5 text-gray-400 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
            <span>{school.address}</span>
          </div>
        )}

        {school.phone && (
          <div className="mt-2 flex items-center text-sm text-gray-600">
            <svg
              className="flex-shrink-0 h-5 w-5 text-gray-400 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
              />
            </svg>
            <span>{school.phone}</span>
          </div>
        )}

        <div className="mt-6 flex justify-end space-x-3">
          <Link
            href={`/schools/${school.id}/edit`}
            className="text-sm font-medium text-gray-600 hover:text-gray-900"
          >
            編輯
          </Link>
          {onDelete && (
            <button
              onClick={() => onDelete(school.id)}
              className="text-sm font-medium text-red-600 hover:text-red-900"
            >
              刪除
            </button>
          )}
          <Link
            href={`/schools/${school.id}`}
            className="text-sm font-medium text-blue-600 hover:text-blue-900"
          >
            查看詳情
          </Link>
        </div>
      </div>
    </div>
  )
}
