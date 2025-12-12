/**
 * Schools List Page
 * Feature: 003-student-sports-data
 */

import { useState } from 'react'
import Link from 'next/link'
import { MainLayout } from '@/components/layout'
import SchoolList from '@/components/schools/SchoolList'
import { useSchools, useDeleteSchool } from '@/hooks/useSchools'

export default function SchoolsPage() {
  const [page, setPage] = useState(1)
  const { data, isLoading, error } = useSchools(page, 20)
  const deleteSchool = useDeleteSchool()

  const handleDelete = async (id: number) => {
    if (window.confirm('確定要刪除此學校嗎？此操作會同時刪除該校所有學生資料。')) {
      try {
        await deleteSchool.mutateAsync(id)
        alert('學校已成功刪除')
      } catch (error) {
        alert('刪除失敗，請稍後再試')
      }
    }
  }

  return (
    <MainLayout>
      {/* Page Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">學校管理</h1>
        <Link
          href="/schools/new"
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <svg
            className="w-5 h-5 mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4v16m8-8H4"
            />
          </svg>
          新增學校
        </Link>
      </div>

      {/* Content */}
      {error ? (
        <div className="text-center py-12">
          <p className="text-red-600">載入失敗，請稍後再試</p>
        </div>
      ) : (
        <SchoolList
          schools={data?.data?.schools || []}
          pagination={
            data?.data?.pagination || {
              page: 1,
              page_size: 20,
              total: 0,
              total_pages: 0,
            }
          }
          onPageChange={setPage}
          onDelete={handleDelete}
          isLoading={isLoading}
        />
      )}
    </MainLayout>
  )
}
