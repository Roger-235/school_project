/**
 * StudentCard - 學生卡片組件
 * Feature: 003-student-sports-data
 */

'use client'

import Link from 'next/link'
import { Student, GENDER_LABELS } from '@/types/sports'

interface StudentCardProps {
  student: Student
  onDelete?: (id: number) => void
  showSchool?: boolean
}

export default function StudentCard({
  student,
  onDelete,
  showSchool = false,
}: StudentCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
      <div className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <Link href={`/students/${student.id}`}>
              <h3 className="text-lg font-semibold text-gray-900 hover:text-blue-600 transition-colors">
                {student.name}
              </h3>
            </Link>
            <p className="mt-1 text-sm text-gray-500">
              學號：{student.student_number}
            </p>
          </div>
          <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
              student.gender === 'male'
                ? 'bg-blue-100 text-blue-800'
                : 'bg-pink-100 text-pink-800'
            }`}
          >
            {GENDER_LABELS[student.gender]}
          </span>
        </div>

        <div className="mt-4 space-y-2">
          <div className="flex items-center text-sm text-gray-600">
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
                d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
              />
            </svg>
            <span>
              {student.grade} 年級 {student.class && `${student.class}`}
            </span>
          </div>

          {showSchool && student.school && (
            <div className="flex items-center text-sm text-gray-600">
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
                  d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                />
              </svg>
              <Link
                href={`/schools/${student.school.id}`}
                className="text-blue-600 hover:text-blue-800"
              >
                {student.school.name}
              </Link>
            </div>
          )}

          {student.birth_date && (
            <div className="flex items-center text-sm text-gray-600">
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
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              <span>{student.birth_date}</span>
            </div>
          )}
        </div>

        <div className="mt-6 flex justify-end space-x-3">
          <Link
            href={`/students/${student.id}/edit`}
            className="text-sm font-medium text-gray-600 hover:text-gray-900"
          >
            編輯
          </Link>
          {onDelete && (
            <button
              onClick={() => onDelete(student.id)}
              className="text-sm font-medium text-red-600 hover:text-red-900"
            >
              刪除
            </button>
          )}
          <Link
            href={`/students/${student.id}`}
            className="text-sm font-medium text-blue-600 hover:text-blue-900"
          >
            查看詳情
          </Link>
        </div>
      </div>
    </div>
  )
}
