/**
 * School Detail Page
 * Feature: 003-student-sports-data
 * Updated: 004-navigation-enhancement - Use MainLayout for consistent navigation
 */

import { useState } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import MainLayout from '@/components/layout/MainLayout'
import StudentList from '@/components/students/StudentList'
import { useSchool, useDeleteSchool } from '@/hooks/useSchools'
import { useStudentsBySchool, useDeleteStudent } from '@/hooks/useStudents'
import type { BreadcrumbItem } from '@/components/layout/Breadcrumb'

export default function SchoolDetailPage() {
  const router = useRouter()
  const { id } = router.query
  const schoolId = id ? parseInt(id as string) : null

  const [studentPage, setStudentPage] = useState(1)

  const { data: schoolData, isLoading: schoolLoading } = useSchool(schoolId)
  const { data: studentsData, isLoading: studentsLoading } = useStudentsBySchool(
    schoolId,
    studentPage,
    20
  )
  const deleteSchool = useDeleteSchool()
  const deleteStudent = useDeleteStudent()

  const school = schoolData?.data?.school
  const students = studentsData?.data?.students || []
  const pagination = studentsData?.data?.pagination || {
    page: 1,
    page_size: 20,
    total: 0,
    total_pages: 0,
  }

  const handleDeleteSchool = async () => {
    if (!schoolId) return
    if (
      window.confirm('確定要刪除此學校嗎？此操作會同時刪除該校所有學生資料。')
    ) {
      try {
        await deleteSchool.mutateAsync(schoolId)
        alert('學校已成功刪除')
        router.push('/schools')
      } catch (error) {
        alert('刪除失敗，請稍後再試')
      }
    }
  }

  const handleDeleteStudent = async (studentId: number) => {
    if (window.confirm('確定要刪除此學生嗎？')) {
      try {
        await deleteStudent.mutateAsync(studentId)
        alert('學生已成功刪除')
      } catch (error) {
        alert('刪除失敗，請稍後再試')
      }
    }
  }

  // Breadcrumb with dynamic school name
  const breadcrumbItems: BreadcrumbItem[] = [
    { label: '首頁', href: '/dashboard' },
    { label: '學校管理', href: '/schools' },
    { label: school?.name || `學校 #${id}` },
  ]

  if (schoolLoading) {
    return (
      <MainLayout breadcrumbItems={breadcrumbItems}>
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </MainLayout>
    )
  }

  if (!school) {
    return (
      <MainLayout breadcrumbItems={breadcrumbItems}>
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-gray-900">學校不存在</h2>
            <Link href="/schools" className="mt-4 text-blue-600 hover:underline">
              返回學校列表
            </Link>
          </div>
        </div>
      </MainLayout>
    )
  }

  return (
    <MainLayout breadcrumbItems={breadcrumbItems}>
      {/* School Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{school.name}</h1>
          <p className="mt-1 text-sm text-gray-500">{school.county_name}</p>
        </div>
        <div className="flex space-x-3">
          <Link
            href={`/schools/${school.id}/edit`}
            className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
          >
            編輯
          </Link>
          <button
            onClick={handleDeleteSchool}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700"
          >
            刪除
          </button>
        </div>
      </div>

      {/* School Info */}
      <div className="bg-white shadow rounded-lg p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">學校資訊</h2>
        <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {school.address && (
            <div>
              <dt className="text-sm font-medium text-gray-500">地址</dt>
              <dd className="mt-1 text-sm text-gray-900">{school.address}</dd>
            </div>
          )}
          {school.phone && (
            <div>
              <dt className="text-sm font-medium text-gray-500">電話</dt>
              <dd className="mt-1 text-sm text-gray-900">{school.phone}</dd>
            </div>
          )}
          <div>
            <dt className="text-sm font-medium text-gray-500">學生人數</dt>
            <dd className="mt-1 text-sm text-gray-900">{pagination.total} 位</dd>
          </div>
        </dl>
      </div>

      {/* Students Section */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-900">學生列表</h2>
          <Link
            href={`/students/new?school_id=${school.id}`}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
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
            新增學生
          </Link>
        </div>

        <StudentList
          students={students}
          pagination={pagination}
          onPageChange={setStudentPage}
          onDelete={handleDeleteStudent}
          isLoading={studentsLoading}
          emptyMessage="此學校尚無學生資料"
        />
      </div>
    </MainLayout>
  )
}
